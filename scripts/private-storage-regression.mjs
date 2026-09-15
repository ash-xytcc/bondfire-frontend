import { decodeLegacyRecord } from '../src/lib/privateClient.js';
import { encryptWithOrgKey } from '../src/lib/zk.js';
import assert from 'node:assert/strict';
import { DatabaseSync, constants } from 'node:sqlite';
import { signJwt } from '../functions/api/_lib/jwt.js';
import { onRequest as middleware } from '../functions/api/_middleware.js';
import { onRequestPost as createOrg } from '../functions/api/orgs/create.js';
import { encryptPrivate, decryptPrivate } from '../src/lib/privateCrypto.js';
import { contentContext, isCiphertext } from '../shared/privateContent.js';
import { migrationInventory } from '../functions/api/_lib/privateMigration.js';
import { ensureDriveSchema } from '../functions/api/_lib/drive.js';
import { onRequestGet as getCrypto } from '../functions/api/orgs/[orgId]/crypto.js';

const sql=new DatabaseSync(':memory:');let failSql=null;
const db={prepare(query){
  let stmt;try{stmt=sql.prepare(query);}catch(e){throw new Error('D1_ERROR: '+e.message+' SQLITE_ERROR');}
  let values=[];const check=()=>{if(failSql?.test(query))throw new Error('injected failure');};
  return {bind(...v){values=v;return this;},async first(){check();return stmt.get(...values)||null;},async all(){check();return{results:stmt.all(...values)};},async run(){check();return{success:true,meta:stmt.run(...values)};}};
},async batch(stmts){sql.exec('BEGIN');try{const result=[];for(const s of stmts)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};
sql.exec(`CREATE TABLE _cf_KV(key TEXT); CREATE TABLE users(id TEXT PRIMARY KEY); INSERT INTO users VALUES('owner'),('member'),('viewer'),('outsider');
CREATE TABLE orgs(id TEXT PRIMARY KEY,name TEXT,created_at INTEGER);
CREATE TABLE org_memberships(org_id TEXT,user_id TEXT,role TEXT,created_at INTEGER,PRIMARY KEY(org_id,user_id));
CREATE TABLE newsletter_subscribers(id TEXT,org_id TEXT);
CREATE TABLE needs(id TEXT PRIMARY KEY,org_id TEXT,title TEXT NOT NULL,description TEXT,status TEXT,created_at INTEGER,updated_at INTEGER);
CREATE TABLE people(id TEXT PRIMARY KEY,org_id TEXT,name TEXT NOT NULL,phone TEXT,notes TEXT);
`);
sql.setAuthorizer((action,name,arg)=>action===constants.SQLITE_PRAGMA&&/^_cf_/i.test(arg)?constants.SQLITE_DENY:constants.SQLITE_OK);
const objects=new Map();let failDelete=false;
const bucket={async put(k,v){objects.set(k,typeof v==='string'?v:new TextDecoder().decode(v));},async get(k){if(!objects.has(k))return null;const s=objects.get(k);return{text:async()=>s,arrayBuffer:async()=>new TextEncoder().encode(s).buffer};},async delete(k){if(failDelete)throw new Error('storage failure');objects.delete(k);},async list({prefix}){return{objects:[...objects.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key})),truncated:false};}};
const env={BF_DB:db,JWT_SECRET:'private-test',BF_DRIVE_BUCKET:bucket};
await ensureDriveSchema(env);
const tokens={};for(const id of ['owner','member','viewer','outsider'])tokens[id]=await signJwt(env.JWT_SECRET,{sub:id},3600);
const request=(path,{body,user='owner',method=body?'POST':'GET'}={})=>new Request('https://example.test'+path,{method,headers:{authorization:'Bearer '+tokens[user],'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
async function call(path,options={},expected=200){const req=request(path,options);const res=await middleware({env,request:req,next:async()=>{if(path==='/api/orgs/create')return createOrg({env,request:req});if(path.endsWith('/crypto'))return getCrypto({env,request:req,params:{orgId:path.split('/')[3]}});return Response.json({legacyReached:true});}});const data=await res.json();if(res.status===500&&expected!==500)console.error('Unexpected middleware 500', {path,method:req.method,user:options.user||'owner',data});assert.equal(res.status,expected,JSON.stringify(data));return data;}
const id=crypto.randomUUID(),key=crypto.getRandomValues(new Uint8Array(32));
const b64=b=>Buffer.from(b).toString('base64url');
const device=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
const pub=await crypto.subtle.exportKey('jwk',device.publicKey);
// Correctly sized wrapper fixture; wrapper cryptography is exercised by the browser test.
const wrappedKey=JSON.stringify({v:1,sender_pub:pub,salt:b64(new Uint8Array(16)),iv:b64(new Uint8Array(12)),ct:b64(new Uint8Array(48))});
const oldDescription=await encryptWithOrgKey(key,'SECRET legacy encrypted description');
const decodedLegacy=await decodeLegacyRecord(key,'needs',{id:'legacy-field',encrypted_description:oldDescription});
assert.equal(decodedLegacy.description,'SECRET legacy encrypted description');
assert.equal(decodedLegacy._legacyEncryptedFields.encrypted_description,oldDescription);
const oldText=await encryptWithOrgKey(key,'SECRET legacy title');
assert.equal((await decodeLegacyRecord(key,'drive/notes',{title:'bfzk1:'+oldText})).title,'SECRET legacy title');
await assert.rejects(decodeLegacyRecord(key,'needs',{encrypted_blob:'bad'}));
const oldScreen=await encryptWithOrgKey(key,JSON.stringify({title:'SECRET edited title',description:'SECRET edited body'}));
const openedPatch=await decodeLegacyRecord(key,'needs',{title:'__encrypted__',description:'',encrypted_blob:oldScreen},{normalize:false});
assert.equal(openedPatch.title,'SECRET edited title');
assert.equal(openedPatch.description,'SECRET edited body');
const notePatch=await decodeLegacyRecord(key,'drive/notes',{parentId:null},{normalize:false});
assert(!Object.hasOwn(notePatch,'body'),'partial folder move must not add an empty note body');
const camel=await decodeLegacyRecord(key,'drive/notes',{encryptedBlob:await encryptWithOrgKey(key,JSON.stringify({body:'SECRET camel-case note'}))},{normalize:false});
assert.equal(camel.body,'SECRET camel-case note');
const keyCheck=await encryptPrivate(key,{check:'bondfire-private-mode'},id,'key-check',id);
const ciphertext=await encryptPrivate(key,{name:'SECRET organization'},id,'organization',id);
await call('/api/orgs/create',{body:{private_mode:true,id,keyCheck,ciphertext,wrappedKey,recovery:{salt:b64(new Uint8Array(16)),iv:b64(new Uint8Array(12)),ct:b64(new Uint8Array(48))}}});
assert.equal(sql.prepare('SELECT name FROM orgs WHERE id=?').get(id).name,'Private organization');
assert(sql.prepare('SELECT * FROM org_key_recovery WHERE org_id=?').get(id), 'creation includes recovery');
await call('/api/orgs/create',{body:{name:'MUST NEVER STORE'}},400);
for(const variant of ['wrapped_key','recovery_payload']) {
  if(variant==='recovery_payload') {
    sql.exec('ALTER TABLE org_key_recovery RENAME TO recovery_saved; CREATE TABLE org_key_recovery(org_id TEXT,user_id TEXT,recovery_payload TEXT NOT NULL,updated_at INTEGER,PRIMARY KEY(org_id,user_id))');
  }
  const nextId=crypto.randomUUID();
  const body={private_mode:true,id:nextId,wrappedKey,
    ciphertext:await encryptPrivate(key,{name:'SECRET transactional org'},nextId,'organization',nextId),
    keyCheck:await encryptPrivate(key,{check:'bondfire-private-mode'},nextId,'key-check',nextId),
    recovery:{salt:b64(new Uint8Array(16)),iv:b64(new Uint8Array(12)),ct:b64(new Uint8Array(48))},enabled_modules:['needs','studio']};
  await call('/api/orgs/create',{body:{...body,recovery:undefined}},400);
  failSql=/INSERT INTO org_key_recovery/;
  await call('/api/orgs/create',{body},500);
  failSql=null;
  for(const table of ['orgs','org_memberships','org_private_records','org_key_wrapped','org_private_mode','org_module_configs']) {
    const column=table==='orgs'?'id':'org_id';
    assert.equal(sql.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${column}=?`).get(nextId).n,0,'failed backup must roll back '+table);
  }
  await call('/api/orgs/create',{body});
  assert.deepEqual(JSON.parse(sql.prepare('SELECT enabled_modules_json FROM org_module_configs WHERE org_id=?').get(nextId).enabled_modules_json),['people','public-site','needs','studio']);
