import { json, bad } from '../../../_lib/http.js';
import { enforceOrgWriteLockdown } from '../../../_lib/orgLockdown.js';

export async function onRequestGet({ env, params }) {
  try {
    const { orgId } = params;

    // If DB not available, return safe scaffold response
    if (!env.BF_DB) {
      return new Response(JSON.stringify({
        rooms: [],
        scaffold: true
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Minimal table check / soft fallback
    try {
      const { results } = await env.BF_DB.prepare(
        'SELECT id, name FROM chat_rooms WHERE org_id = ?'
      ).bind(orgId).all();

      return new Response(JSON.stringify({
        rooms: results || []
      }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
      // Table probably doesn't exist yet
      return new Response(JSON.stringify({
        rooms: [],
        warning: 'chat_rooms table missing'
      }), { headers: { 'Content-Type': 'application/json' } });
    }

  } catch (err) {
    return bad(500, 'INTERNAL', { detail: String(err?.message || err || 'Unknown error') });
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const { orgId } = params;
    const lockdown = await enforceOrgWriteLockdown({ env, orgId });
    if (!lockdown.ok) return lockdown.resp;

    const body = await request.json();
    const { name } = body || {};

    if (!name) {
      return new Response(JSON.stringify({ error: 'name required' }), { status: 400 });
    }

    if (!env.BF_DB) {
      return new Response(JSON.stringify({
        ok: true,
        scaffold: true,
        room: { id: 'temp-id', name }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    try {
      const id = crypto.randomUUID();

      await env.BF_DB.prepare(
        'INSERT INTO chat_rooms (id, org_id, name) VALUES (?, ?, ?)'
      ).bind(id, orgId, name).run();

      return new Response(JSON.stringify({
        ok: true,
        room: { id, name }
      }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
      return new Response(JSON.stringify({
        error: 'chat_rooms table missing'
      }), { status: 500 });
    }

  } catch (err) {
    return bad(500, 'INTERNAL', { detail: String(err?.message || err || 'Unknown error') });
  }
}
