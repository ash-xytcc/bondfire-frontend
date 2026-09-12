import { bad } from './http.js';

function getDb(env) {
  return env?.BF_DB || env?.DB || env?.db || null;
}

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function isWriteMethod(method) {
  return WRITE_METHODS.has(String(method || '').toUpperCase());
}

export async function getOrgLockdownState({ env, orgId }) {
  const db = getDb(env);
  if (!db || !orgId) return { enabled: false };

  const table = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'org_emergency_state'")
    .first()
    .catch(() => null);

  if (!table?.name) return { enabled: false };

  const row = await db
    .prepare('SELECT lockdown_enabled FROM org_emergency_state WHERE org_id = ?')
    .bind(orgId)
    .first()
    .catch(() => null);

  return { enabled: !!row?.lockdown_enabled };
}

export async function getOrgIsolationState({ env, orgId }) {
  const db = getDb(env);
  if (!db || !orgId) return { isolated: false, stage: 'normal' };

  const table = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'emergency_protocol_state'")
    .first()
    .catch(() => null);
  if (!table?.name) return { isolated: false, stage: 'normal' };

  const row = await db
    .prepare('SELECT isolated, stage FROM emergency_protocol_state WHERE org_id = ?')
    .bind(orgId)
    .first()
    .catch(() => null);

  return {
    isolated: !!row?.isolated,
    stage: String(row?.stage || 'normal'),
  };
}

export async function enforceOrgIsolationAccess({ env, orgId }) {
  const state = await getOrgIsolationState({ env, orgId });
  if (state.isolated) {
    return { ok: false, resp: bad(403, 'ORG_ISOLATED') };
  }
  return { ok: true };
}

export async function enforceOrgWriteLockdown({ env, orgId }) {
  const state = await getOrgLockdownState({ env, orgId });
  if (state.enabled) {
    return { ok: false, resp: bad(403, 'ORG_LOCKDOWN_ACTIVE') };
  }
  return { ok: true };
}
