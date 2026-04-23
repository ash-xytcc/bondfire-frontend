import { bad, json, now, uuid } from "../../../../_lib/http.js";
import { requireOrgRole } from "../../../../_lib/auth.js";
import { parseLinkedItem, serializeLinkedItem } from "../../../../_lib/moduleLinks.js";

async function ensureEventNotesTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS event_notes (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    body TEXT NOT NULL,
    author_label TEXT,
    linked_item_json TEXT,
    created_at INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_event_notes_event_created ON event_notes(org_id, event_id, created_at DESC)`).run();
}

function safeAuthorLabel(user) {
  const candidates = [
    user?.name,
    user?.preferred_username,
    user?.nickname,
    user?.email,
    user?.given_name,
  ];
  for (const candidate of candidates) {
    const text = String(candidate || "").trim();
    if (text) return text;
  }
  return "member";
}

export async function onRequestGet({ env, request, params }) {
  const { orgId, eventId } = params;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;

  await ensureEventNotesTable(env.BF_DB);

  const rows = await env.BF_DB.prepare(
    `SELECT id, org_id, event_id, body, author_label, linked_item_json, created_at
     FROM event_notes
     WHERE org_id = ? AND event_id = ?
     ORDER BY created_at DESC`
  ).bind(orgId, eventId).all();

  const notes = (rows.results || []).map((row) => ({
    ...row,
    linked_item: parseLinkedItem(row.linked_item_json),
  }));

  return json({ ok: true, notes });
}

export async function onRequestPost({ env, request, params }) {
  const { orgId, eventId } = params;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureEventNotesTable(env.BF_DB);

  const payload = await request.json().catch(() => ({}));
  const body = String(payload?.body || "").trim();
  if (!body) return bad(400, "MISSING_BODY");

  const id = uuid();
  const createdAt = now();
  const authorLabel = safeAuthorLabel(auth?.user);
  const linkedItemJson = serializeLinkedItem(payload?.linked_item || null);

  await env.BF_DB.prepare(
    `INSERT INTO event_notes (id, org_id, event_id, body, author_label, linked_item_json, created_at)
     VALUES (?,?,?,?,?,?,?)`
  ).bind(id, orgId, eventId, body, authorLabel, linkedItemJson, createdAt).run();

  return json({
    ok: true,
    note: {
      id,
      org_id: orgId,
      event_id: eventId,
      body,
      author_label: authorLabel,
      linked_item_json: linkedItemJson,
      linked_item: parseLinkedItem(linkedItemJson),
      created_at: createdAt,
    },
  });
}
