import { getDb, requireUser } from './auth.js';
import { bad } from './http.js';
import { aesGcmDecrypt, totpVerify } from './crypto.js';
import { rateLimit } from './rateLimit.js';

function fromB64(value) {
  const bin = atob(String(value || ''));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  let raw;
  try {
    raw = fromB64(storedHash);
  } catch {
    return false;
  }

  if (raw.length <= 16) return false;
  const salt = raw.slice(0, 16);
  const expected = raw.slice(16);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(String(password)),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    expected.length * 8
  );
  const got = new Uint8Array(bits);
  if (got.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < got.length; i += 1) diff |= got[i] ^ expected[i];
  return diff === 0;
}

async function verifyMfaIfEnabled({ db, env, userId, code }) {
  let row = null;
  try {
    row = await db
      .prepare('SELECT totp_secret_encrypted, mfa_enabled FROM user_mfa WHERE user_id = ?')
      .bind(userId)
      .first();
  } catch {
    row = null;
  }

  if (!row || Number(row.mfa_enabled) !== 1) return { ok: true, required: false };

  const normalized = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalized)) {
    return { ok: false, resp: bad(400, 'MFA_REQUIRED') };
  }

  let encrypted = row.totp_secret_encrypted;
  if (!encrypted) return { ok: false, resp: bad(400, 'MFA_SECRET_MISSING') };
  if (typeof encrypted === 'string') {
    try {
      encrypted = JSON.parse(encrypted);
    } catch {
      return { ok: false, resp: bad(400, 'MFA_SECRET_CORRUPT') };
    }
  }

  const encryptionKey = env.MFA_ENC_KEY || env.JWT_SECRET;
  if (!encryptionKey) return { ok: false, resp: bad(500, 'MFA_KEY_MISSING') };

  let secret;
  try {
    secret = await aesGcmDecrypt(encrypted, encryptionKey);
  } catch {
    return { ok: false, resp: bad(400, 'MFA_SECRET_DECRYPT_FAILED') };
  }

  const valid = await totpVerify(secret, normalized, { window: 1 });
  if (!valid) return { ok: false, resp: bad(400, 'INVALID_MFA_CODE') };
  return { ok: true, required: true };
}

export async function requireSensitiveAction({ env, request, password, mfaCode }) {
  const auth = await requireUser({ env, request });
  if (!auth.ok) return auth;

  const db = getDb(env);
  if (!db) return { ok: false, resp: bad(500, 'NO_DB_BINDING') };

  const userId = auth.user?.sub || auth.user?.userId || auth.user?.id || null;
  if (!userId) return { ok: false, resp: bad(401, 'UNAUTHORIZED') };

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
  const rl = await rateLimit({ env, key: `sensitive:${ip}:${userId}`, limit: 8, windowSec: 600 });
  if (!rl.ok) return { ok: false, resp: bad(429, 'RATE_LIMIT', { retry_after: rl.retry_after }) };

  const account = await db
    .prepare('SELECT id, email, name, password_hash FROM users WHERE id = ? LIMIT 1')
    .bind(userId)
    .first();
  if (!account) return { ok: false, resp: bad(401, 'UNAUTHORIZED') };

  if (!String(password || '')) return { ok: false, resp: bad(400, 'PASSWORD_REQUIRED') };
  const passwordOk = await verifyPassword(password, account.password_hash);
  if (!passwordOk) return { ok: false, resp: bad(401, 'INVALID_PASSWORD') };

  const mfa = await verifyMfaIfEnabled({ db, env, userId, code: mfaCode });
  if (!mfa.ok) return mfa;

  return {
    ok: true,
    db,
    user: auth.user,
    account: { id: account.id, email: account.email, name: account.name },
    mfaRequired: mfa.required,
  };
}
