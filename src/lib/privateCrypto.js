import { deviceKeyId } from '../../shared/privateContent.js';
import { contentContext, isCiphertext } from '../../shared/privateContent.js';
import { fromB64, toB64, unwrapOrgKey, ensureDeviceKeypair } from './zk.js';

export async function encryptPrivate(keyBytes, value, orgId, kind, id) {
  if(keyBytes?.byteLength!==32)throw new Error("A 256-bit organization key is required.");
  const key=await crypto.subtle.importKey('raw',keyBytes,{name:'AES-GCM'},false,['encrypt']);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const aad=contentContext(orgId,kind,id);
  const bytes=value instanceof Uint8Array?value:new TextEncoder().encode(JSON.stringify(value));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(aad),tagLength:128},key,bytes);
  return JSON.stringify({v:2,alg:'A256GCM',aad,iv:toB64(iv),ct:toB64(new Uint8Array(ct))});
}
export async function decryptPrivate(keyBytes, value, orgId, kind, id, binary=false) {
  if(keyBytes?.byteLength!==32)throw new Error("A 256-bit organization key is required.");
  const aad=contentContext(orgId,kind,id);
  if(!isCiphertext(value,aad)) throw new Error('Invalid encrypted content or record identity.');
  const b=JSON.parse(value),key=await crypto.subtle.importKey('raw',keyBytes,{name:'AES-GCM'},false,['decrypt']);
  const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromB64(b.iv),additionalData:new TextEncoder().encode(aad),tagLength:128},key,fromB64(b.ct));
  return binary?new Uint8Array(clear):JSON.parse(new TextDecoder().decode(clear));
}
export async function loadPrivateKey(orgId,status,transport) {
  // Always obtain the current account's wrapped key through the role-gated API.
  // A shared browser's old raw-key cache is never authority to open a private org.
  const device=await ensureDeviceKeypair();
  const deviceId=await deviceKeyId(device.pubJwk);
  const response=await transport(`/api/orgs/${encodeURIComponent(orgId)}/crypto?device_id=${deviceId}`);
  if(!response.wrapped_key) throw new Error('This account/device needs an encryption-key invitation from an organization administrator.');
  let key;
  try { key=await unwrapOrgKey(response.wrapped_key); }
  catch { throw new Error('This device cannot unlock the organization. Use recovery in Security, then ask an administrator to wrap the key for this device.'); }
  if(status.keyCheck) {
    try { const check=await decryptPrivate(key,status.keyCheck,orgId,'key-check',orgId); if(check.check!=='bondfire-private-mode') throw new Error(); }
    catch { throw new Error('The organization key does not match. Do not replace it; restore the correct key.'); }
  }
  return key;
}
