import { bad, json } from "../../../_lib/http.js";
import { requireOrgRole } from "../../../_lib/auth.js";
import { isOrgModuleEnabled } from "../../../_lib/orgModules.js";
import { resolveColophonIdentity } from "../../../_lib/colophonIdentity.js";

export async function onRequestGet({ env, request, params }) {
  const orgId = String(params?.orgId || "").trim();
  if (!orgId) return bad(400, "MISSING_ORG_ID");

  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;

  if (!(await isOrgModuleEnabled(env, orgId, "publishing-colophon"))) {
    return bad(403, "MODULE_DISABLED", { moduleId: "publishing-colophon" });
  }

  const identity = await resolveColophonIdentity({ env, orgId, auth });
  if (!identity.ok) return bad(identity.status || 403, identity.error || "COLOPHON_EDITORIAL_ACCESS_REQUIRED");
  const actor = identity.actor;

  return json({
    ok: true,
    authenticated: true,
    mode: "colophon",
    orgId,
    role: actor.role,
    capabilities: actor.capabilities || [],
    bootstrap: actor.bootstrap === true,
    user: {
      id: actor.id || null,
      email: actor.email || "",
      displayName: actor.displayName || actor.email || actor.role,
    },
  });
}
