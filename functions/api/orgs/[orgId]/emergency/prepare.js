import { requireOrgRole } from '../../../_lib/auth.js';
import { getOrgDestructionPreview } from '../../../_lib/destruction.js';
import { ensureEmergencySchema, writeEmergencyReport } from '../../../_lib/emergency.js';
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
  if (stage === 'prepared') {
    const preview = await getOrgDestructionPreview({ db: state.db, orgId });
    if (!preview) return bad(404, 'ORG_NOT_FOUND');
    return ok({ protocol: { stage: 'prepared', isolated: true }, preview });
  }
  if (stage !== 'isolated' || !protocol?.isolated) {
    return bad(409, 'ISOLATION_REQUIRED', { stage });
  }

  const body = await readJSON(request);
  const fresh = await requireSensitiveAction({
    env,
    request,
    password: body?.password,
    mfaCode: body?.mfaCode,
  });
  if (!fresh.ok) return fresh.resp;

  const preview = await getOrgDestructionPreview({ db: fresh.db, orgId });
  if (!preview) return bad(404, 'ORG_NOT_FOUND');

  const preparePhrase = `PREPARE ${String(preview.org?.name || '').trim()}`;
  if (String(body?.confirmation || '') !== preparePhrase) {
    return bad(400, 'CONFIRMATION_MISMATCH', { confirmationPhrase: preparePhrase });
  }

  const t = now();
  await state.db.prepare(
    `UPDATE emergency_protocol_state
     SET stage = 'prepared', isolated = 1, updated_at = ?
     WHERE org_id = ?`
  ).bind(t, orgId).run();

  await writeEmergencyReport({
    env,
    request,
    orgId,
    eventType: 'emergency.destruction.prepared',
    severity: 'critical',
    status: 'recorded',
    summary: 'Org destruction prepared; no data deleted',
    details: { stage: 'prepared' },
  });

  return ok({
    protocol: {
      stage: 'prepared',
      isolated: true,
      updatedAt: t,
    },
    preview,
  });
}
