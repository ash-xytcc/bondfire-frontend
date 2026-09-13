import { deviceKeyId } from '../../shared/privateContent.js';
import { api } from '../utils/api.js';
import { ensureDeviceKeypair, randomOrgKey, wrapForMember, cacheOrgKey, wrapOrgKeyForRecovery } from './zk.js';
import { encryptPrivate } from './privateCrypto.js';

// Keep private inputs on the device. Recovery and module selection commit with
// the organization, so a failed backup cannot leave an unrecoverable new org.
export async function createEncryptedOrg({name, passphrase, confirmation, modules}) {
  if(!String(name || '').trim() || passphrase.length < 20 || passphrase !== confirmation)
    throw new Error('Enter a name and matching recovery passphrases of at least 20 characters.');
  const device=await ensureDeviceKeypair(), key=randomOrgKey(), id=crypto.randomUUID();
  const ciphertext=await encryptPrivate(key,{name:name.trim()},id,'organization',id);
  const keyCheck=await encryptPrivate(key,{check:'bondfire-private-mode'},id,'key-check',id);
  const wrappedKey=await wrapForMember(key,device.pubJwk);
  const {salt,iv,ct}=await wrapOrgKeyForRecovery(key,passphrase);
  const result=await api('/api/orgs/create',{method:'POST',body:JSON.stringify({
    private_mode:true,id,ciphertext,keyCheck,wrappedKey,
    device_id:await deviceKeyId(device.pubJwk),recovery:{salt,iv,ct},
    ...(modules===undefined?{}:{enabled_modules:modules}),
  })});
  cacheOrgKey(id,key);
  return result;
}
