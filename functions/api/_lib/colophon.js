import { getDb, requireOrgRole } from "./auth.js";

export const COLOPHON_MODULE_ID = "publishing-colophon";

const COLOPHON_CAPABILITIES = Object.freeze({
  owner: ["*"],
  admin: [
    "content:write",
    "media:write",
    "publishing:write",
    "review:manage",
    "review:comment",
    "site:manage",
    "analytics:view",
    "system:view",
    "users:manage",
  ],
  contributor: ["content:write", "media:write", "review:comment"],
  viewer: ["analytics:view"],
});

const BONDFIRE_TO_COLOPHON_ROLE = Object.freeze({
  owner: "owner",
  admin: "admin",
  member: "contributor",
  viewer: "viewer",
});

async function ensureModulesTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS org_module_configs (
      org_id TEXT PRIMARY KEY,
      enabled_modules_json TEXT NOT NULL DEFAULT '[]',
      version INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL,
      updated_by TEXT
    )`
  ).run();
}

function parseEnabledModules(value) {
  if (value == null || value === "") return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function mapBondfireRoleToColophon(role) {
  return BONDFIRE_TO_COLOPHON_ROLE[String(role || "").toLowerCase()] || "viewer";
}

export function capabilitiesForBondfireColophonRole(role) {
  const mappedRole = mapBondfireRoleToColophon(role);
  return [...(COLOPHON_CAPABILITIES[mappedRole] || COLOPHON_CAPABILITIES.viewer)];
}

export function buildBondfireColophonIdentity(auth) {
  const role = mapBondfireRoleToColophon(auth?.role);
  const capabilities = capabilitiesForBondfireColophonRole(auth?.role);
  const sourceUser = auth?.user || {};
  const id = String(sourceUser.sub || sourceUser.id || sourceUser.userId || "");
  const email = String(sourceUser.email || "");
  const displayName = String(sourceUser.name || sourceUser.displayName || sourceUser.display_name || email || id || "Bondfire member");

  return {
    role,
    capabilities,
    canAccessAdmin: true,
    canEdit: ["owner", "admin"].includes(role),
    actor: email || id || "bondfire-member",
    user: {
      id,
      email,
      displayName,
      role,
      status: "active",
    },
  };
}

export async function isColophonEnabledForOrg(db, orgId) {
  await ensureModulesTable(db);
  const row = await db.prepare(
    "SELECT enabled_modules_json FROM org_module_configs WHERE org_id = ? LIMIT 1"
  ).bind(orgId).first();

  // Existing organizations without an explicit module config use Bondfire's
  // default module set, where Colophon is enabled.
  if (!row) return true;

  const enabled = parseEnabledModules(row.enabled_modules_json);
  return Array.isArray(enabled) && enabled.includes(COLOPHON_MODULE_ID);
}

export async function requireColophonAccess({ env, request, orgId, minRole = "viewer" }) {
  const auth = await requireOrgRole({ env, request, orgId, minRole });
  if (!auth.ok) return auth;

  const db = getDb(env);
  if (!db) {
    return {
      ok: false,
      resp: new Response(JSON.stringify({ ok: false, error: "NO_DB_BINDING" }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      }),
    };
  }

  const enabled = await isColophonEnabledForOrg(db, orgId);
  if (!enabled) {
    return {
      ok: false,
      resp: new Response(JSON.stringify({ ok: false, error: "COLOPHON_MODULE_DISABLED" }), {
        status: 403,
        headers: { "content-type": "application/json; charset=utf-8" },
      }),
    };
  }

  return {
    ...auth,
    db,
    colophon: buildBondfireColophonIdentity(auth),
  };
}
