import { ensureDeviceKeySchema } from './deviceKeys.js';
import { installPrivateWriteGuards } from './privateWriteGuards.js';
import { json, bad } from './http.js';
import { requireCookieCsrf } from './csrf.js';
import { ensurePrivateSchema } from './privateStore.js';
import { ensureZkSchema } from './zk.js';
import { isCiphertext, contentContext } from '../../../shared/privateContent.js';
import { validWrappedKey } from './wrappedKeyValidation.js';

export async function createPrivateOrg({db,request,userId,body}) {
  const csrf=requireCookieCsrf(request);if(csrf)return csrf;
  const {id,ciphertext,keyCheck,wrappedKey,device_id}=body;
  if(Object.keys(body).some(k=>!['private_mode','id','ciphertext','keyCheck','wrappedKey','device_id'].includes(k))) return bad(400,'PLAINTEXT_FIELDS_FORBIDDEN');
  if(!/^[a-f0-9-]{36}$/.test(id)||!isCiphertext(ciphertext,contentContext(id,'organization',id))||!isCiphertext(keyCheck,contentContext(id,'key-check',id))||!validWrappedKey(wrappedKey)) return bad(400,'INVALID_PRIVATE_ORGANIZATION');
  await ensurePrivateSchema(db);await ensureZkSchema(db);await ensureDeviceKeySchema(db);
  if(device_id && !await db.prepare('SELECT device_id FROM user_device_keys WHERE user_id=? AND device_id=?').bind(userId,device_id).first())return bad(400,'KEY_RECIPIENT_DEVICE_UNKNOWN');
  await db.prepare('CREATE TABLE IF NOT EXISTS org_keys (org_id TEXT PRIMARY KEY,encrypted_org_metadata TEXT)').run();
  await installPrivateWriteGuards(db);
  const t=Date.now();
  const wraps=device_id?[db.prepare('INSERT INTO org_private_device_wraps(org_id,user_id,device_id,wrapped_key) VALUES(?,?,?,?)').bind(id,userId,device_id,wrappedKey)]:[];
  await db.batch([
    db.prepare('INSERT INTO orgs(id,name,created_at) VALUES(?,?,?)').bind(id,'Private organization',t),
    db.prepare("INSERT INTO org_memberships(org_id,user_id,role,created_at) VALUES(?,?,'owner',?)").bind(id,userId,t),
    db.prepare('INSERT INTO org_keys(org_id,encrypted_org_metadata) VALUES(?,NULL)').bind(id),
    db.prepare('INSERT INTO org_key_wrapped(org_id,user_id,wrapped_key,key_version) VALUES(?,?,?,1)').bind(id,userId,wrappedKey),
    ...wraps,
    db.prepare("INSERT INTO org_private_mode(org_id,state,started_at,completed_at,key_check) VALUES(?,'enabled',?,?,?)").bind(id,t,t,keyCheck),
    db.prepare("INSERT INTO org_private_records(org_id,kind,id,ciphertext,revision,created_at,updated_at) VALUES(?,'organization',?,?,1,?,?)").bind(id,id,ciphertext,t,t),
  ]);
  return json({ok:true,org:{id,name:'Private organization',private_mode:true},membership:{role:'owner'}});
}
