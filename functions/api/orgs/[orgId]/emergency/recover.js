import { requireOrgRole } from '../../../_lib/auth.js';
import { ensureEmergencySchema, setOrgLockdownState, writeEmergencyReport } from '../../../_lib/emergency.js';
import { requireSensitiveAction } from '../../../_lib/sensitiveAction.js';
import { bad, now, ok, readJSON } from '../../../_lib/http.js';

export async function onRequestPost({ env, request, params }) {
  const orgId = String(params?.orgId || '');
  const gate = await requireOrgRole({ env, request, orgId, minRole: 'owner', bypassWriteLockdown: true });
  if (!gate.ok) return gate.resp;

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

  const state = await ensureEmergencySchema(env);
  if (!state.ok) return state.resp;
  const t = now();

  await state.db.prepare(
    `INSERT INTO emergency_protocol_state (
      org_id, stage, isolated, isolated_by_user_id, isolated_at,
      recovered_by_user_id, recovered_at, updated_at
    ) VALUES (?, 'normal', 0, NULL, NULL, ?, ?, ?)
    ON CONFLICT(org_id) DO UPDATE SET
      stage = 'normal',
      isolated = 0,
      recovered_by_user_id = excluded.recovered_by_user_id,
      recovered_at = excluded.recovered_at,
      updated_at = excluded.updated_at`
  ).bind(orgId, userId, t, t).run();

  const lockdown = await setOrgLockdownState({
    env,
    request,
    orgId,
    enabled: false,
    reason: 'Emergency isolation recovered',
    rotateKeys: false,
  });
  if (!lockdown.ok) return lockdown.resp;

  await writeEmergencyReport({
    env,
    request,
    orgId,
    eventType: 'emergency.isolation.recovered',
    severity: 'info',
    status: 'recorded',
    summary: 'Org emergency isolation recovered',
    details: { stage: 'normal' },
  });

  return ok({
    protocol: {
      stage: 'normal',
      isolated: false,
      recoveredAt: t,
    },
  });
}
