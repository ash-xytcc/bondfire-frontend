export const COLOPHON_MODULE_ID = "publishing-colophon";

function cleanOrgId(orgId) {
  return String(orgId || "").trim();
}

export function getBondfireColophonRouteBase(orgId) {
  const id = cleanOrgId(orgId);
  return id ? `/org/${encodeURIComponent(id)}/colophon` : "";
}

export function getBondfireColophonApiBase(orgId) {
  const id = cleanOrgId(orgId);
  return id ? `/api/orgs/${encodeURIComponent(id)}/colophon` : "";
}

export async function fetchBondfireColophonContext(orgId, options = {}) {
  const apiBase = getBondfireColophonApiBase(orgId);
  if (!apiBase) throw new Error("Colophon requires a Bondfire organization context.");

  const response = await fetch(`${apiBase}/context`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal: options.signal,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.error || `Unable to load Colophon context (${response.status})`);
    error.status = response.status;
    error.code = payload?.error || "COLOPHON_CONTEXT_FAILED";
    throw error;
  }

  return payload;
}

export function createBondfireColophonHost(orgId, context) {
  const id = cleanOrgId(orgId);
  if (!id) throw new Error("Colophon requires a Bondfire organization context.");
  if (!context?.session?.authenticated) throw new Error("Colophon requires an authenticated Bondfire session.");

  return Object.freeze({
    mode: "bondfire-native",
    orgId: id,
    moduleId: COLOPHON_MODULE_ID,
    routeBase: context.routeBase || getBondfireColophonRouteBase(id),
    apiBase: context.apiBase || getBondfireColophonApiBase(id),
    session: context.session,
    permissions: context.permissions || null,
    standalone: false,
  });
}
