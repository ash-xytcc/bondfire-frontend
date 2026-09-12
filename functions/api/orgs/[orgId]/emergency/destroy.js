import { requireOrgRole } from '../../../_lib/auth.js';
import { destroyOrgData, getOrgDestructionPreview } from '../../../_lib/destruction.js';
import { requireSensitiveAction } from '../../../_lib/sensitiveAction.js';
import { bad, ok, readJSON } from '../../../_lib/http.js';

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

  const preview = await getOrgDestructionPreview({ db: fresh.db, orgId });
  if (!preview) return bad(404, 'ORG_NOT_FOUND');

  if (String(body?.confirmation || '') !== preview.confirmationPhrase) {
    return bad(400, 'CONFIRMATION_MISMATCH', { confirmationPhrase: preview.confirmationPhrase });
  }
  if (body?.acknowledgeHistoricalLimit !== true) {
    return bad(400, 'HISTORICAL_ERASURE_ACK_REQUIRED');
  }

  let result;
  try {
    result = await destroyOrgData({ env, db: fresh.db, orgId });
  } catch (error) {
    return bad(500, error?.message || 'ORG_DESTROY_FAILED', {
      failedCount: Number(error?.failedCount || 0) || undefined,
      tables: Array.isArray(error?.tables) ? error.tables : undefined,
    });
  }

  if (!result) return bad(404, 'ORG_NOT_FOUND');
  return ok({
    destroyed: true,
    result,
    erasure: preview.erasure,
  });
}
