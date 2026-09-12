import { deviceKeyId } from '../../shared/privateContent.js';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { ensureDeviceKeypair, randomOrgKey, wrapForMember, cacheOrgKey, wrapOrgKeyForRecovery, saveRecoveryToServer } from '../lib/zk.js';
import { encryptPrivate } from '../lib/privateCrypto.js';

export default function CreatePrivateOrg() {
  const navigate=useNavigate(),[open,setOpen]=React.useState(false),[name,setName]=React.useState(''),[pass,setPass]=React.useState(''),[again,setAgain]=React.useState(''),[busy,setBusy]=React.useState(false),[error,setError]=React.useState('');
  async function create(e) {
    e.preventDefault();setBusy(true);setError('');
    let createdId='';
    try {
      if(!name.trim()||pass.length<20||pass!==again) throw new Error('Enter a name and matching recovery passphrases of at least 20 characters.');
      const device=await ensureDeviceKeypair(),key=randomOrgKey(),id=crypto.randomUUID();
      const ciphertext=await encryptPrivate(key,{name:name.trim()},id,'organization',id);
      const keyCheck=await encryptPrivate(key,{check:'bondfire-private-mode'},id,'key-check',id);
      const wrappedKey=await wrapForMember(key,device.pubJwk);
      await api('/api/orgs/create',{method:'POST',body:JSON.stringify({private_mode:true,id,ciphertext,keyCheck,wrappedKey,device_id:await deviceKeyId(device.pubJwk)})});
      createdId=id;cacheOrgKey(id,key);
      await saveRecoveryToServer(id,await wrapOrgKeyForRecovery(key,pass));
      navigate(`/org/${id}`);
    } catch(e) {
      if(createdId) {setError('Organization created, but saving the recovery backup failed. Open Security to save it before clearing this device.');navigate(`/org/${createdId}/settings?tab=security`);}
      else setError(e.message);
    } finally {setBusy(false);}
  }
  if(!open)return <button type="button" onClick={()=>setOpen(true)}>Create a member-only encrypted org</button>;
  return <form onSubmit={create} style={{display:'grid',gap:8,marginTop:12}}>
    <p>The name and content are encrypted on this device before upload. This mode includes private records, Drive, events, and native chat. Public publishing and external integrations are unavailable. Account and membership metadata remain server-visible.</p>
    <label>Organization name<input required value={name} onChange={e=>setName(e.target.value)} disabled={busy}/></label>
    <label>Separate recovery passphrase<input required minLength={20} type="password" autoComplete="new-password" value={pass} onChange={e=>setPass(e.target.value)} disabled={busy}/></label>
    <label>Confirm recovery passphrase<input required type="password" autoComplete="new-password" value={again} onChange={e=>setAgain(e.target.value)} disabled={busy}/></label>
    <p>Keep the recovery passphrase somewhere safe. The server cannot recover it or decrypt your content.</p>
    <button disabled={busy}>{busy?'Creating encrypted organization…':'Create encrypted organization'}</button>
    {error&&<p role="alert">{error}</p>}
  </form>;
}
