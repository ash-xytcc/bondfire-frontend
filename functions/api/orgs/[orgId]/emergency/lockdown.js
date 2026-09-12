import { ensureEmergencySchema, setOrgLockdownState } from '../../../_lib/emergency.js';
import { bad, now, ok } from '../../../_lib/http.js';

export async function onRequestPost(ctx) {
  const orgId = String(ctx.params?.orgId || '');
  const body = await ctx.request.json().catch(() => ({}));
  const enabled = typeof body.enabled === 'boolean' ? body.enabled : !!body.locked;

  const state = await ensureEmergencySchema(ctx.env);
  if (!state.ok) return state.resp;

  const protocol = await state.db.prepare(
    'SELECT stage, isolated FROM emergency_protocol_state WHERE org_id = ?'
  ).bind(orgId).first();
  const stage = String(protocol?.stage || 'normal');

  if (!enabled && (stage === 'isolated' || stage === 'prepared')) {
    return bad(409, 'RECOVER_PROTOCOL_REQUIRED', { stage });
  }

  const res = await setOrgLockdownState({
    env: ctx.env,
    request: ctx.request,
    orgId,
    enabled,
    reason: body.reason || '',
    rotateKeys: !!body.rotateKeys,
  });
  if (!res.ok) return res.resp;

  const t = now();
  if (enabled) {
    if (stage === 'normal' || stage === 'lockdown') {
      await state.db.prepare(
        `INSERT INTO emergency_protocol_state (
          org_id, stage, isolated, isolated_by_user_id, isolated_at,
          recovered_by_user_id, recovered_at, updated_at
        ) VALUES (?, 'lockdown', 0, NULL, NULL, NULL, NULL, ?)
        ON CONFLICT(org_id) DO UPDATE SET
          stage = 'lockdown',
          isolated = 0,
          isolated_by_user_id = NULL,
          isolated_at = NULL,
          recovered_by_user_id = NULL,
          recovered_at = NULL,
          updated_at = excluded.updated_at`
      ).bind(orgId, t).run();
    }
  } else {
    await state.db.prepare(
      `INSERT INTO emergency_protocol_state (
        org_id, stage, isolated, isolated_by_user_id, isolated_at,
        recovered_by_user_id, recovered_at, updated_at
      ) VALUES (?, 'normal', 0, NULL, NULL, NULL, NULL, ?)
      ON CONFLICT(org_id) DO UPDATE SET
        stage = 'normal',
        isolated = 0,
        isolated_by_user_id = NULL,
        isolated_at = NULL,
        updated_at = excluded.updated_at`
    ).bind(orgId, t).run();
  }

  return ok({
    ...res,
    protocol: {
      stage: enabled ? (stage === 'isolated' || stage === 'prepared' ? stage : 'lockdown') : 'normal',
      isolated: enabled ? !!protocol?.isolated : false,
      updatedAt: t,
    },
  });
}
