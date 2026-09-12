import { json, bad, now } from "../../../_lib/http.js";
import { requireOrgRole } from "../../../_lib/auth.js";
import { getOrgKeyVersion } from "../../../_lib/zk.js";

async function ensureMeetingsColumns(db) {
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0").run(); } catch {}
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN encrypted_notes TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN encrypted_blob TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN key_version INTEGER").run(); } catch {}
}

async function ensurePublicMeetingRsvpsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS public_meeting_rsvps (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    meeting_id TEXT NOT NULL,
    name TEXT,
    contact TEXT,
    status TEXT NOT NULL,
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_public_meeting_rsvps_lookup ON public_meeting_rsvps(org_id, meeting_id, created_at DESC)").run();
}

async function getRsvpCounts(db, orgId, meetingId) {
  const [memberRows, publicRows] = await Promise.all([
    db.prepare(`SELECT status, COUNT(*) AS c FROM meeting_rsvps WHERE org_id = ? AND meeting_id = ? GROUP BY status`).bind(orgId, meetingId).all().catch(() => ({ results: [] })),
    db.prepare(`SELECT status, COUNT(*) AS c FROM public_meeting_rsvps WHERE org_id = ? AND meeting_id = ? GROUP BY status`).bind(orgId, meetingId).all().catch(() => ({ results: [] })),
  ]);
  const blank = { yes: 0, maybe: 0, no: 0, total: 0 };
  const member = { ...blank };
  const pub = { ...blank };
  for (const row of memberRows?.results || []) {
    const status = String(row?.status || "").toLowerCase();
    const count = Number(row?.c || 0);
    if (status === "yes" || status === "maybe" || status === "no") member[status] += count;
  }
  for (const row of publicRows?.results || []) {
    const status = String(row?.status || "").toLowerCase();
    const count = Number(row?.c || 0);
    if (status === "yes" || status === "maybe" || status === "no") pub[status] += count;
  }
  member.total = member.yes + member.maybe + member.no;
  pub.total = pub.yes + pub.maybe + pub.no;
  return {
    member,
    public: pub,
    combined: {
      yes: member.yes + pub.yes,
      maybe: member.maybe + pub.maybe,
      no: member.no + pub.no,
      total: member.total + pub.total,
    },
  };
}

function hasCiphertext(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const meetingId = params.meetingId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;

  await ensureMeetingsColumns(env.BF_DB);
  await ensurePublicMeetingRsvpsTable(env.BF_DB);
  await env.BF_DB.prepare(
    `UPDATE meetings SET title = '', location = '', agenda = '', notes = '', encrypted_notes = NULL
     WHERE id = ? AND org_id = ? AND is_public = 0 AND encrypted_blob IS NOT NULL AND encrypted_blob <> ''`
  ).bind(meetingId, orgId).run();

  const row = await env.BF_DB.prepare(
    `SELECT id, title, starts_at, ends_at, location, agenda, notes, is_public,
            encrypted_notes, encrypted_blob, key_version, created_at, updated_at
     FROM meetings WHERE id = ? AND org_id = ?`
  ).bind(meetingId, orgId).first();

  if (!row) return bad(404, "NOT_FOUND");
  const rsvp_counts = await getRsvpCounts(env.BF_DB, orgId, meetingId);
  return json({ ok: true, meeting: { ...row, rsvp_counts } });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const meetingId = params.meetingId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;

  await ensureMeetingsColumns(env.BF_DB);
  const body = await request.json().catch(() => ({}));
  const existing = await env.BF_DB.prepare(
    `SELECT title, starts_at, ends_at, location, agenda, notes, is_public, encrypted_blob, key_version
     FROM meetings WHERE id = ? AND org_id = ?`
  ).bind(meetingId, orgId).first();
  if (!existing) return bad(404, "NOT_FOUND");

  const isPublic = body.is_public === undefined ? !!existing.is_public : !!body.is_public;
  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : existing.encrypted_blob;
  if (!isPublic && !hasCiphertext(encryptedBlob)) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");

  const title = isPublic ? (body.title === undefined ? String(existing.title || "") : String(body.title || "").trim()) : "";
  if (isPublic && !title) return bad(400, "MISSING_TITLE");
  const location = isPublic ? (body.location === undefined ? String(existing.location || "") : String(body.location || "")) : "";
  const agenda = isPublic ? (body.agenda === undefined ? String(existing.agenda || "") : String(body.agenda || "")) : "";
  const notes = isPublic ? (body.notes === undefined ? String(existing.notes || "") : String(body.notes || "")) : "";
  const startsAt = body.starts_at === undefined ? existing.starts_at : body.starts_at;
  const endsAt = body.ends_at === undefined ? existing.ends_at : body.ends_at;
  const keyVersion = hasCiphertext(body.encrypted_blob) ? await getOrgKeyVersion(env.BF_DB, orgId) : existing.key_version;

  await env.BF_DB.prepare(
    `UPDATE meetings
     SET title = ?, starts_at = ?, ends_at = ?, location = ?, agenda = ?, notes = ?, is_public = ?,
         encrypted_notes = NULL, encrypted_blob = ?, key_version = ?, updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(title, startsAt, endsAt, location, agenda, notes, isPublic ? 1 : 0, encryptedBlob || null, keyVersion || null, now(), meetingId, orgId).run();

  return json({ ok: true });
}

export async function onRequestDelete({ env, request, params }) {
  const orgId = params.orgId;
  const meetingId = params.meetingId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;

  await env.BF_DB.prepare("DELETE FROM meetings WHERE id = ? AND org_id = ?").bind(meetingId, orgId).run();
  return json({ ok: true });
}
