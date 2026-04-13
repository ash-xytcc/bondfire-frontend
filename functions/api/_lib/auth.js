import { bad } from "./http.js";
import { verifyJwt } from "./jwt.js";

// Bindings can be named differently across environments.
// Try a few common ones so we don't explode into a Cloudflare 500 HTML page.
export function getDb(env) {
  return env?.BF_DB || env?.DB || env?.db || null;
}

function normalizeAuthArgs(arg1, arg2) {
  // Supports:
  //   requireUser({ env, request })
  //   requireUser(request, env)
  if (arg1 && typeof arg1 === "object" && "request" in arg1 && "env" in arg1) {
    return { request: arg1.request, env: arg1.env };
  }

  return { request: arg1, env: arg2 };
}

function normalizeOrgRoleArgs(arg1, arg2, arg3, arg4) {
  // Supports:
  //   requireOrgRole({ env, request, orgId, minRole })
  //   requireOrgRole(request, env, orgId, minRole)
  if (
    arg1 &&
    typeof arg1 === "object" &&
    "request" in arg1 &&
    "env" in arg1
  ) {
    return {
      request: arg1.request,
      env: arg1.env,
      orgId: arg1.orgId,
      minRole: arg1.minRole,
    };
  }

  return {
    request: arg1,
    env: arg2,
    orgId: arg3,
    minRole: arg4,
  };
}

export async function requireUser(arg1, arg2) {
  const { env, request } = normalizeAuthArgs(arg1, arg2);

  if (!request || !request.headers) {
    return { ok: false, resp: bad(401, "UNAUTHORIZED") };
  }

  const h = request.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/);

  // Support both Bearer auth AND cookie sessions (httpOnly).
  // This allows a gradual migration away from localStorage tokens.
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = {};
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    cookies[k] = decodeURIComponent(rest.join("=") || "");
  }

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("bf_token") || "";
  const token =
    (m && m[1]) ||
    cookies.bf_at ||
    cookies.bf_auth_token ||
    cookies.bf_token ||
    queryToken ||
    "";

  if (!token) return { ok: false, resp: bad(401, "UNAUTHORIZED") };

  const payload = await verifyJwt(env?.JWT_SECRET, token);
  if (!payload) return { ok: false, resp: bad(401, "UNAUTHORIZED") };

  return { ok: true, user: payload };
}

export async function requireOrgRole(arg1, arg2, arg3, arg4) {
  const { env, request, orgId, minRole } = normalizeOrgRoleArgs(arg1, arg2, arg3, arg4);

  const u = await requireUser(request, env);
  if (!u.ok) return u;

  const roleRank = { viewer: 1, member: 2, admin: 3, owner: 4 };

  let need = 2;
  if (Array.isArray(minRole) && minRole.length) {
    need = Math.min(...minRole.map((role) => roleRank[role] || 999));
  } else {
    need = roleRank[minRole || "member"] || 2;
  }

  const db = getDb(env);
  if (!db) return { ok: false, resp: bad(500, "NO_DB_BINDING") };

  const userId = String(u.user?.sub || u.user?.userId || u.user?.uid || "");
  const row = await db
    .prepare("SELECT role FROM org_memberships WHERE org_id = ? AND user_id = ?")
    .bind(String(orgId), userId)
    .first();

  if (!row) return { ok: false, resp: bad(403, "NOT_A_MEMBER") };

  const actualRank = roleRank[row.role] || 0;
  if (actualRank < need) {
    return { ok: false, resp: bad(403, "INSUFFICIENT_ROLE") };
  }

  return { ok: true, user: u.user, role: row.role };
}

// Back-compat alias: earlier endpoints used `requireAuth`.
export async function requireAuth(arg1, arg2) {
  return requireUser(arg1, arg2);
}

// Convenience helper used by some endpoints.
// Returns a user id string or null.
export async function getUserIdFromRequest(request, env) {
  const u = await requireUser(request, env);
  if (!u.ok) return null;
  const id = u.user?.sub || u.user?.userId || u.user?.uid || null;
  return id ? String(id) : null;
}
