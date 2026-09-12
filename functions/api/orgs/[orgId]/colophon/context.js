import { bad, json } from "../../../_lib/http.js";
import { COLOPHON_MODULE_ID, requireColophonAccess } from "../../../_lib/colophon.js";

export async function onRequestGet({ env, request, params }) {
  const orgId = String(params?.orgId || "").trim();
  if (!orgId) return bad(400, "MISSING_ORG_ID");

  const access = await requireColophonAccess({ env, request, orgId, minRole: "viewer" });
  if (!access.ok) return access.resp;

  const identity = access.colophon;
  const encodedOrgId = encodeURIComponent(orgId);

  return json({
    ok: true,
    mode: "bondfire-native",
    moduleId: COLOPHON_MODULE_ID,
    orgId,
    routeBase: `/org/${encodedOrgId}/colophon`,
    apiBase: `/api/orgs/${encodedOrgId}/colophon`,
    session: {
      ok: true,
      authenticated: true,
      canAccessAdmin: identity.canAccessAdmin,
      canEdit: identity.canEdit,
      authMode: "bondfire-session",
      authReason: "authenticated Bondfire organization membership",
      actor: identity.actor,
      role: identity.role,
      capabilities: identity.capabilities,
      user: identity.user,
      bootstrap: false,
      sessionExpiresAt: "",
    },
    permissions: {
      publicConfig: {
        ok: true,
        canEdit: identity.capabilities.includes("*") || identity.capabilities.includes("site:manage"),
        mode: "bondfire-session",
      },
      nativeContent: {
        ok: true,
        canEdit: identity.capabilities.includes("*") || identity.capabilities.includes("content:write"),
        mode: "bondfire-session",
      },
      canEditAnything: identity.capabilities.includes("*") || identity.capabilities.includes("content:write") || identity.capabilities.includes("site:manage"),
    },
  });
}
