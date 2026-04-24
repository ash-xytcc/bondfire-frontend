import { json, bad } from '../../../_lib/http.js';

export async function onRequestGet({ env, params }) {
  try {
    const { orgId } = params;

    // If DB not available, return safe scaffold response.
    if (!env.BF_DB) {
      return json({ rooms: [], scaffold: true });
    }

    // Minimal table check / soft fallback.
    try {
      const { results } = await env.BF_DB.prepare('SELECT id, name FROM chat_rooms WHERE org_id = ?').bind(orgId).all();

      return json({ rooms: results || [] });
    } catch {
      // Table probably doesn't exist yet.
      return json({ rooms: [], warning: 'chat_rooms table missing' });
    }
  } catch (err) {
    return bad(500, 'INTERNAL', { detail: String(err?.message || err || 'Unknown error') });
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const { orgId } = params;

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const name = String(body?.name || '').trim();
    if (!name) {
      return json({ error: 'name required' }, { status: 400 });
    }

    if (!env.BF_DB) {
      return json({
        ok: true,
        scaffold: true,
        room: { id: 'temp-id', name },
      });
    }

    try {
      const id = crypto.randomUUID();

      await env.BF_DB.prepare('INSERT INTO chat_rooms (id, org_id, name) VALUES (?, ?, ?)').bind(id, orgId, name).run();

      return json({ ok: true, room: { id, name } });
    } catch {
      return json({ error: 'chat_rooms table missing' }, { status: 500 });
    }
  } catch (err) {
    return bad(500, 'INTERNAL', { detail: String(err?.message || err || 'Unknown error') });
  }
}
