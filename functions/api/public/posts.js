import { json } from "../_lib/http.js";
import { ensureDriveSchema, getDb } from "../_lib/drive.js";

export async function onRequestGet({ env }) {
  await ensureDriveSchema(env);
  const db = getDb(env);

  const res = await db.prepare(`
    SELECT p.slug, p.title_override, p.excerpt, n.content
    FROM drive_note_posts p
    JOIN drive_notes n ON n.id = p.note_id
    WHERE p.status = 'published'
    ORDER BY p.updated_at DESC
    LIMIT 20
  `).all();

  return json({ ok: true, posts: res.results || [] });
}
