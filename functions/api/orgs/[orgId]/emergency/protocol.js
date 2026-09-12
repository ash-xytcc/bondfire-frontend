import { requireOrgRole } from '../../../_lib/auth.js';
import { ensureEmergencySchema } from '../../../_lib/emergency.js';
import { getOrgDestructionPreview } from '../../../_lib/destruction.js';
import { bad, ok } from '../../../_lib/http.js';

export async function onRequestGet({ env, request, params }) {
  const orgId = String(params?.orgId || '');
  const gate = await requireOrgRole({ env, request, orgId, minRole: 'owner', bypassWriteLockdown: true });
  if (!gate.ok) return gate.resp;

  const state = await ensureEmergencySchema(env);
  if (!state.ok) return state.resp;

  const preview = await getOrgDestructionPreview({ db: state.db, orgId });
  if (!preview) return bad(404, 'ORG_NOT_FOUND');

  const protocol = await state.db.prepare(
    `SELECT stage, isolated, isolated_by_user_id, isolated_at, recovered_by_user_id, recovered_at, updated_at
     FROM emergency_protocol_state WHERE org_id = ?`
  ).bind(orgId).first();

  return ok({
    protocol: protocol
      ? {
          stage: String(protocol.stage || 'normal'),
          isolated: !!protocol.isolated,
          isolatedAt: protocol.isolated_at || null,
          updatedAt: protocol.updated_at || null,
        }
      : { stage: 'normal', isolated: false, isolatedAt: null, updatedAt: null },
    preview,
  });
}
