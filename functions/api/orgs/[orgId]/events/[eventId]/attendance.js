import { bad, json, now, uuid } from "../../../../_lib/http.js";
import { requireOrgRole } from "../../../../_lib/auth.js";

const ALLOWED_STATUS = new Set(["going", "maybe", "not_going"]);

async function ensureEventAttendanceTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS event_attendance (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_event_attendance_event_created ON event_attendance(org_id, event_id, created_at DESC)`).run();
}

export async function onRequestGet({ env, request, params }) {
  const { orgId, eventId } = params;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;

  await ensureEventAttendanceTable(env.BF_DB);

  const rows = await env.BF_DB.prepare(
    `SELECT id, org_id, event_id, name, role, status, created_at
     FROM event_attendance
     WHERE org_id = ? AND event_id = ?
     ORDER BY created_at DESC`
  ).bind(orgId, eventId).all();

  return json({ ok: true, entries: rows.results || [] });
}

export async function onRequestPost({ env, request, params }) {
  const { orgId, eventId } = params;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureEventAttendanceTable(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const role = String(body?.role || "").trim();
  const status = String(body?.status || "").trim().toLowerCase();

  if (!name) return bad(400, "MISSING_NAME");
  if (!ALLOWED_STATUS.has(status)) return bad(400, "INVALID_STATUS", { allowed: [...ALLOWED_STATUS] });

  const id = uuid();
  const createdAt = now();

  await env.BF_DB.prepare(
    `INSERT INTO event_attendance (id, org_id, event_id, name, role, status, created_at)
     VALUES (?,?,?,?,?,?,?)`
  ).bind(id, orgId, eventId, name, role, status, createdAt).run();

  return json({ ok: true, entry: { id, org_id: orgId, event_id: eventId, name, role, status, created_at: createdAt } });
}

export async function onRequestDelete({ env, request, params }) {
  const { orgId, eventId } = params;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureEventAttendanceTable(env.BF_DB);

  const url = new URL(request.url);
  const idFromQuery = String(url.searchParams.get("id") || "").trim();
  const body = await request.json().catch(() => ({}));
  const id = idFromQuery || String(body?.id || "").trim();
  if (!id) return bad(400, "MISSING_ID");

  await env.BF_DB.prepare(
    `DELETE FROM event_attendance WHERE id = ? AND org_id = ? AND event_id = ?`
  ).bind(id, orgId, eventId).run();

  return json({ ok: true });
}
