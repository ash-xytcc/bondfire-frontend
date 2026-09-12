import { requireOrgRole } from '../../../_lib/auth.js';
import { ensureEmergencySchema, setOrgLockdownState, writeEmergencyReport } from '../../../_lib/emergency.js';
import { requireSensitiveAction } from '../../../_lib/sensitiveAction.js';
import { bad, now, ok, readJSON } from '../../../_lib/http.js';

export async function onRequestPost({ env, request, params }) {
  const orgId = String(params?.orgId || '');
  const gate = await requireOrgRole({ env, request, orgId, minRole: 'owner', bypassWriteLockdown: true });
  if (!gate.ok) return gate.resp;

  const state = await ensureEmergencySchema(env);
  if (!state.ok) return state.resp;

  const protocol = await state.db.prepare(
    'SELECT stage, isolated FROM emergency_protocol_state WHERE org_id = ?'
  ).bind(orgId).first();
  const stage = String(protocol?.stage || 'normal');
  if (stage === 'isolated') {
    return ok({ protocol: { stage: 'isolated', isolated: true } });
  }
  if (stage !== 'lockdown') {
    return bad(409, 'LOCKDOWN_REQUIRED', { stage });
  }

  const lockdownState = await state.db.prepare(
    'SELECT lockdown_enabled FROM org_emergency_state WHERE org_id = ?'
  ).bind(orgId).first();
  if (!lockdownState?.lockdown_enabled) {
    return bad(409, 'LOCKDOWN_REQUIRED', { stage });
  }

  const body = await readJSON(request);
  const fresh = await requireSensitiveAction({
    env,
    request,
    password: body?.password,
    mfaCode: body?.mfaCode,
  });
  if (!fresh.ok) return fresh.resp;

  const userId = fresh.user?.sub || fresh.user?.userId || fresh.user?.id || null;
  if (!userId) return bad(401, 'UNAUTHORIZED');

  const lockdown = await setOrgLockdownState({
    env,
    request,
    orgId,
    enabled: true,
    reason: 'Emergency isolation',
    rotateKeys: false,
  });
  if (!lockdown.ok) return lockdown.resp;

  const t = now();
  await state.db.prepare(
    `INSERT INTO emergency_protocol_state (
      org_id, stage, isolated, isolated_by_user_id, isolated_at,
      recovered_by_user_id, recovered_at, updated_at
    ) VALUES (?, 'isolated', 1, ?, ?, NULL, NULL, ?)
    ON CONFLICT(org_id) DO UPDATE SET
      stage = 'isolated',
      isolated = 1,
      isolated_by_user_id = excluded.isolated_by_user_id,
      isolated_at = excluded.isolated_at,
      recovered_by_user_id = NULL,
      recovered_at = NULL,
      updated_at = excluded.updated_at`
  ).bind(orgId, userId, t, t).run();

  await writeEmergencyReport({
    env,
    request,
    orgId,
    eventType: 'emergency.isolation.enabled',
    severity: 'critical',
    status: 'recorded',
    summary: 'Org isolated to owner-only emergency access',
    details: { stage: 'isolated' },
  });

  return ok({
    protocol: {
      stage: 'isolated',
      isolated: true,
      isolatedAt: t,
    },
  });
}
