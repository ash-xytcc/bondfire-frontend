import {
  capabilitiesForRole,
  countAdminUsers,
  getAdminUserByEmail,
  publicUser,
} from '../../../node_modules/colophon/functions/api/_lib/adminUsers.js';
import { createColophonScopedEnv } from './colophonScopedRuntime.js';

function base64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sign(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

export async function resolveColophonIdentity({ env, orgId, auth }) {
  const scopedEnv = createColophonScopedEnv(env, orgId);
  const db = scopedEnv?.BF_DB || scopedEnv?.DB || null;
  if (!db) return { ok: false, status: 500, error: 'NO_DB_BINDING' };

  const count = await countAdminUsers(db);
  const bondfireRole = String(auth?.role || 'viewer').toLowerCase();
  const bondfireUser = auth?.user || {};
  const email = String(bondfireUser.email || '').trim().toLowerCase();

  if (count === 0) {
    if (bondfireRole !== 'owner') {
      return { ok: false, status: 403, error: 'COLOPHON_OWNER_SETUP_REQUIRED' };
    }
    return {
      ok: true,
      scopedEnv,
      actor: {
        id: '',
        email,
        displayName: bondfireUser.name || bondfireUser.displayName || email || 'Bondfire owner',
        role: 'owner',
        capabilities: ['*'],
        bootstrap: true,
      },
    };
  }

  if (!email) return { ok: false, status: 403, error: 'COLOPHON_EDITORIAL_ACCESS_REQUIRED' };
  const row = await getAdminUserByEmail(db, email);
  const user = row ? publicUser(row) : null;
  if (!user || user.status !== 'active') {
    return { ok: false, status: 403, error: 'COLOPHON_EDITORIAL_ACCESS_REQUIRED' };
  }

  return {
    ok: true,
    scopedEnv,
    actor: {
      id: user.id,
      email: user.email,
      displayName: user.displayName || user.email,
      role: user.role,
      capabilities: capabilitiesForRole(user.role),
      bootstrap: false,
    },
  };
}

export async function createColophonIdentityRequest(request, scopedEnv, orgId, actor = {}) {
  const secret = String(scopedEnv?.colophon_SESSION_SECRET || '');
  if (!secret) throw new Error('COLOPHON_SESSION_SECRET_MISSING');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    v: 2,
    sub: String(actor.email || actor.id || 'bondfire-user').slice(0, 254),
    userId: String(actor.id || '').slice(0, 180),
    email: String(actor.email || '').slice(0, 254),
    role: String(actor.role || 'viewer').slice(0, 32),
    iat: now,
    exp: now + 300,
    sid: `bondfire-${crypto.randomUUID?.() || now}`,
  };
  const encoded = base64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = base64Url(await sign(secret, encoded));
  const headers = new Headers(request.headers);
  const cookies = String(headers.get('cookie') || '')
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith('colophon_session='));
  cookies.push(`colophon_session=${encodeURIComponent(`${encoded}.${signature}`)}`);
  headers.set('cookie', cookies.join('; '));
  headers.set('x-bondfire-colophon-org', String(orgId));
  headers.set('x-bondfire-colophon-role', String(actor.role || 'viewer'));
  return new Request(request, { headers });
}
