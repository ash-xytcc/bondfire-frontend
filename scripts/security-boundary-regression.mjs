import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createColophonGatewayRequest,
  createColophonScopedEnv,
} from '../functions/api/_lib/colophonScopedRuntime.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const auth = read('functions/api/_lib/auth.js');
const blobs = read('functions/api/_lib/privateBlobs.js');
const destruction = read('functions/api/_lib/destruction.js');
const protocol = read('functions/api/_lib/privateProtocol.js');
const privateClient = read('src/lib/privateClient.js');
const debug = read('src/debug/initDebug.js');
const gatewayRouter = read('functions/api/orgs/[orgId]/colophon/[[path]].js');

// Authentication credentials must not be accepted from URLs.
assert.doesNotMatch(auth, /searchParams\.get\(\s*['"](?:token|access_token|auth|authorization)['"]/i);
assert.doesNotMatch(auth, /[?&](?:token|access_token|authorization)=/i);

// Colophon gateway sessions must be signed with a server-held secret and retain
// the caller's real Bondfire role rather than silently becoming owner sessions.
const request = new Request('https://bondfire.test/api/orgs/org-a/colophon/native-content');
const actor = { id: 'user-a', email: 'member@example.test', role: 'member' };
const envA = { JWT_SECRET: 'test-server-secret-a' };
const envB = { JWT_SECRET: 'test-server-secret-b' };
const scopedA = createColophonScopedEnv(envA, 'org-a');
const scopedB = createColophonScopedEnv(envB, 'org-a');
assert.notEqual(scopedA.colophon_SESSION_SECRET, scopedB.colophon_SESSION_SECRET);
assert.throws(() => createColophonScopedEnv({}, 'org-a'), /COLOPHON_GATEWAY_SECRET_REQUIRED/);

const gatewayRequest = await createColophonGatewayRequest(request, 'org-a', actor, envA);
const cookie = gatewayRequest.headers.get('cookie') || '';
const encodedSession = decodeURIComponent(cookie.match(/(?:^|;\s*)colophon_session=([^;]+)/)?.[1] || '');
const payloadPart = encodedSession.split('.')[0];
assert.ok(payloadPart, 'Colophon gateway session cookie was not created');
const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
assert.equal(payload.role, 'member');
assert.equal(gatewayRequest.headers.get('x-bondfire-colophon-role'), 'member');
assert.match(gatewayRouter, /createColophonGatewayRequest\(context\.request,\s*orgId,\s*actor,\s*context\.env\)/);

// Private blob object naming is shared with destructive cleanup, and temporary
// upload objects can be deleted only through the authenticated org-scoped API.
assert.match(blobs, /export const privateBlobObjectKey=/);
assert.match(destruction, /import \{ privateBlobObjectKey \} from ['"]\.\/privateBlobs\.js['"]/);
assert.match(blobs, /export async function deletePrivateBlob\(/);
assert.match(protocol, /import \{ deletePrivateBlob, getPrivateBlob, putPrivateBlob \} from ['"]\.\/privateBlobs\.js['"]/);
assert.match(protocol, /request\.method===['"]DELETE['"]/);
assert.match(protocol, /deletePrivateBlob\(env,orgId,id,body\.fileId\)/);

// Failed or superseded encrypted Drive payloads must not be left behind.
assert.match(privateClient, /async function deletePayload\(/);
assert.match(privateClient, /catch\(error\) \{\s*try \{await deletePayload\(orgId,payloadId,fileId,transport\);\} catch \{\}\s*throw error;/s);
assert.match(privateClient, /if\(uploadedPayloadId\)try \{await deletePayload\(orgId,uploadedPayloadId,id,transport\);\} catch \{\}/);
assert.match(privateClient, /previous\?\.payloadId&&previous\.payloadId!==uploadedPayloadId[\s\S]*deletePayload\(orgId,previous\.payloadId,id,transport\)/);

// Tester diagnostics may expose counts and runtime state, not cached org records
// or complete URLs containing query/hash material.
assert.doesNotMatch(debug, /href:\s*window\.location\.href/);
assert.doesNotMatch(debug, /out\.orgs\s*=/);
assert.match(debug, /out\.orgCount/);

console.log('Security boundary regression checks passed');
