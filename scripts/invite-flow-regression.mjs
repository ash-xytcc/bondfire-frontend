import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { signJwt } from '../functions/api/_lib/jwt.js';
import { onRequestPost as createInvite } from '../functions/api/orgs/[orgId]/invites.js';
import { onRequestPost as redeemInvite } from '../functions/api/invites/redeem.js';

const sqlite = new DatabaseSync(':memory:');
const db = {
  prepare(sql) {
    const statement = sqlite.prepare(sql);
    let values = [];
    return {
      bind(...next) { values = next; return this; },
      async first() { return statement.get(...values) || null; },
      async all() { return { results: statement.all(...values) }; },
      async run() { return { success: true, meta: statement.run(...values) }; },
    };
  },
  async batch(statements) {
    sqlite.exec('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      sqlite.exec('ROLLBACK');
      throw error;
    }
  },
};

sqlite.exec(`
  CREATE TABLE users(id TEXT PRIMARY KEY);
  CREATE TABLE orgs(id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER);
  CREATE TABLE org_memberships(
    org_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY(org_id, user_id)
  );
  INSERT INTO users(id) VALUES ('owner'), ('member'), ('admin-member'), ('expired-user'), ('exhausted-user');
  INSERT INTO orgs(id,name,created_at) VALUES ('org-a','Release Org',0), ('org-b','Other Org',0);
  INSERT INTO org_memberships(org_id,user_id,role,created_at) VALUES ('org-a','owner','owner',0);
`);

const env = { BF_DB: db, JWT_SECRET: 'invite-regression-secret' };
const token = {};
for (const id of ['owner', 'member', 'admin-member', 'expired-user', 'exhausted-user']) {
  token[id] = await signJwt(env.JWT_SECRET, { sub: id }, 3600);
}

function request(path, user, body) {
  return new Request(`https://example.test${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token[user]}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });
}

async function read(response, expected) {
  const data = await response.json();
  assert.equal(response.status, expected, JSON.stringify(data));
  return data;
}

const created = await read(await createInvite({
  env,
  request: request('/api/orgs/org-a/invites', 'owner', { role: 'member', maxUses: 1, expiresInDays: 14 }),
  params: { orgId: 'org-a' },
}), 200);
assert.match(created.invite.code, /^[A-Z2-9]{10}$/);

await read(await createInvite({
  env,
  request: request('/api/orgs/org-a/invites', 'member', { role: 'member' }),
  params: { orgId: 'org-a' },
}), 403);

const joined = await read(await redeemInvite({
  env,
  request: request('/api/invites/redeem', 'member', { code: created.invite.code.toLowerCase() }),
}), 200);
assert.equal(joined.org.id, 'org-a');
assert.equal(joined.membership.role, 'member');
assert.equal(sqlite.prepare("SELECT role FROM org_memberships WHERE org_id='org-a' AND user_id='member'").get().role, 'member');
assert.equal(sqlite.prepare('SELECT uses FROM invites WHERE code=?').get(created.invite.code).uses, 1);
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM org_memberships WHERE org_id='org-b' AND user_id='member'").get().n, 0, 'redeeming one org invite must not create another membership');

// A one-use code stays exhausted after redemption, even for the member who used it.
await read(await redeemInvite({
  env,
  request: request('/api/invites/redeem', 'member', { code: created.invite.code }),
}), 400);
assert.equal(sqlite.prepare('SELECT uses FROM invites WHERE code=?').get(created.invite.code).uses, 1);

await read(await redeemInvite({
  env,
  request: request('/api/invites/redeem', 'admin-member', { code: 'NOT-A-CODE' }),
}), 400);

const now = Date.now();
sqlite.prepare(`INSERT INTO invites(code,org_id,role,uses,max_uses,expires_at,created_at,created_by)
  VALUES(?,?,?,?,?,?,?,?)`).run('EXPIRED999', 'org-a', 'member', 0, 1, now - 1, now - 1000, 'owner');
await read(await redeemInvite({
  env,
  request: request('/api/invites/redeem', 'expired-user', { code: 'EXPIRED999' }),
}), 400);
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM org_memberships WHERE org_id='org-a' AND user_id='expired-user'").get().n, 0);

sqlite.prepare(`INSERT INTO invites(code,org_id,role,uses,max_uses,expires_at,created_at,created_by)
  VALUES(?,?,?,?,?,?,?,?)`).run('EXHAUST999', 'org-a', 'member', 1, 1, now + 60000, now, 'owner');
await read(await redeemInvite({
  env,
  request: request('/api/invites/redeem', 'exhausted-user', { code: 'EXHAUST999' }),
}), 400);
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM org_memberships WHERE org_id='org-a' AND user_id='exhausted-user'").get().n, 0);

const adminInvite = await read(await createInvite({
  env,
  request: request('/api/orgs/org-a/invites', 'owner', { role: 'admin', maxUses: 1 }),
  params: { orgId: 'org-a' },
}), 200);
await read(await redeemInvite({
  env,
  request: request('/api/invites/redeem', 'admin-member', { code: adminInvite.invite.code }),
}), 200);
assert.equal(sqlite.prepare("SELECT role FROM org_memberships WHERE org_id='org-a' AND user_id='admin-member'").get().role, 'admin');
await read(await createInvite({
  env,
  request: request('/api/orgs/org-a/invites', 'admin-member', { role: 'member' }),
  params: { orgId: 'org-a' },
}), 403);

console.log('PASS: invite creation/redemption, invalid/expired/exhausted handling, role boundaries, and org scoping');
