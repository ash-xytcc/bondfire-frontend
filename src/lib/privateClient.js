import { decryptWithOrgKey } from './zk.js';
import { PRIVATE_CONTENT, privateRoute } from '../../shared/privateContent.js';
import { encryptPrivate, decryptPrivate, loadPrivateKey } from './privateCrypto.js';

function parseBody(body) {
  if(body==null) return {};
  if(typeof body==='string') return JSON.parse(body);
  if(typeof body==='object'&&!(body instanceof Blob)&&!(body instanceof FormData)) return body;
  throw new Error('Unsupported encrypted request body.');
}
export function normalizePrivateRecord(kind,row) {
  const clear={...row};
  if(kind.startsWith('drive/')) {
    if(clear.parent_id!==undefined) clear.parentId=clear.parent_id;
    if(kind==='drive/notes'||kind==='drive/templates') { clear.body=clear.body??clear.content??''; if(typeof clear.tags==='string') clear.tags=clear.tags.split(',').filter(Boolean); }
  }
  if(kind==='chat/messages') {clear.roomId=clear.roomId??clear.room_id;clear.authorLabel=clear.authorLabel??clear.author_label??'';}
  if(kind==='events'||kind==='witness') {try {clear.tags=clear.tags??JSON.parse(clear.tags_json||'[]');}catch{clear.tags=[];}}
  if(kind==='pledges') {
    clear.type=clear.type??clear.title??'';clear.amount=clear.amount??clear.qty??'';clear.note=clear.note??clear.description??'';
    clear.pledger_name=clear.pledger_name??'';clear.pledger_email=clear.pledger_email??'';
  }
  return clear;
}
export async function decodeLegacyRecord(key,kind,row) {
  let clear={...row};
  const legacy={};
  if(row.encrypted_blob) {
    const value=JSON.parse(await decryptWithOrgKey(key,row.encrypted_blob));
    if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Unsupported legacy encrypted record. Original data was preserved.');
    clear={...clear,...value};legacy.encrypted_blob=row.encrypted_blob;
  }
  for(const [field,target]of [['encrypted_description','description'],['encrypted_notes','notes']]) {
    if(!row[field])continue;
    const text=await decryptWithOrgKey(key,row[field]);
    let value=text;
    let parsedObject=null;
    try {const parsed=JSON.parse(text);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))parsedObject=parsed;else value=parsed;}catch{}
    if(!row.encrypted_blob) {
      if(parsedObject)clear={...clear,...parsedObject};
      else clear[target]=value;
    }
    legacy[field]=row[field];
  }
  for(const [field,value]of Object.entries(clear)) {
    if(typeof value==='string'&&value.startsWith('bfzk1:'))clear[field]=await decryptWithOrgKey(key,value.slice(6));
  }
  if(Object.keys(legacy).length)clear._legacyEncryptedFields=legacy;
  return normalizePrivateRecord(kind,clear);
}
async function reveal(key,orgId,kind,row,transport,hydrate=false) {
  if(!row) return row;
  if(!row.ciphertext) throw new Error('Private storage returned an unencrypted record.');
  const clear=normalizePrivateRecord(kind,await decryptPrivate(key,row.ciphertext,orgId,kind,row.id));
  const result={...clear,id:row.id,revision:row.revision,deleting:!!row.deleting,createdAt:clear.createdAt??row.createdAt,updatedAt:row.updatedAt,
    created_at:clear.created_at??row.created_at,updated_at:row.updated_at,encrypted:true};
  const contract=PRIVATE_CONTENT[kind];
  if(contract?.parent) result[contract.parent]=row.parentId||null;
  // Public URLs are never synthesized for private files. Binary previews are
  // populated only after authenticated ciphertext retrieval and local decryption.
  if(kind==='drive/files') {
    delete result.storage_key;delete result.storageKey;
    result.url='';result.downloadUrl='';result.previewUrl='';
    if(hydrate&&result.payloadId) {
      const payload=await transport(`/api/orgs/${encodeURIComponent(orgId)}/privacy/blob/${result.payloadId}`);
      const bytes=await decryptPrivate(key,payload.ciphertext,orgId,'drive/blob',result.payloadId,true);
      const blob=new Blob([bytes],{type:result.mime||'application/octet-stream'});
      result.dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});
      if(String(result.mime||'').startsWith('text/')||/\.(bfform|bfsheet|json|md|csv)$/i.test(result.name||'')) result.textContent=new TextDecoder().decode(bytes);
    }
  }
  return result;
}
async function uploadPayload(key,orgId,bytes,transport,fileId) {
  const payloadId=crypto.randomUUID();
  const ciphertext=await encryptPrivate(key,bytes,orgId,'drive/blob',payloadId);
  await transport(`/api/orgs/${encodeURIComponent(orgId)}/privacy/blob/${payloadId}`,{method:'POST',body:JSON.stringify({ciphertext,fileId})});
  const check=await transport(`/api/orgs/${encodeURIComponent(orgId)}/privacy/blob/${payloadId}`);
  if(check.ciphertext!==ciphertext) throw new Error('Encrypted upload verification failed.');
  return payloadId;
}
export { uploadPayload };
export async function dispatchPrivate(path,opts,transport) {
  const url=new URL(path,window.location.origin);
  const m=url.pathname.match(/^\/api\/orgs\/([^/]+)\/(.*)$/);
  if(!m||['create','index'].includes(m[1])) return null;
  const orgId=decodeURIComponent(m[1]), tail=m[2];
  if(/^(privacy|crypto|zk|emergency|members|modules|invites)(\/|$)/.test(tail)) return null;
  const status=await transport(`/api/orgs/${encodeURIComponent(orgId)}/privacy`);
  if(status.state==='off') return null;
  if(status.state!=='enabled') throw new Error('Finish the encrypted-data conversion in Settings → Security before editing this organization.');
  const key=await loadPrivateKey(orgId,status,transport);
  const method=String(opts.method||'GET').toUpperCase();
  if(tail==='organization'&&method==='GET') {
    const data=await transport(path,opts);
    return {handled:true,data:{...data,organization:await reveal(key,orgId,'organization',data.organization,transport)}};
  }
  if(tail==='drive'&&method==='GET') {
    const data=await transport(path,opts),next={...data};
    for(const type of ['folders','notes','files','templates']) next[type]=await Promise.all((data[type]||[]).map(row=>reveal(key,orgId,`drive/${type}`,row,transport)));
    return {handled:true,data:next};
  }
  if(tail==='drive/import') {
    const data=parseBody(opts.body);
    for(const type of ['folders','notes','files','templates']) for(const row of data[type]||[]) await dispatchPrivate(`/api/orgs/${encodeURIComponent(orgId)}/drive/${type}`,{method:'POST',body:JSON.stringify(row)},transport);
    return {handled:true,data:{ok:true}};
  }
  const route=privateRoute(path);
  if(!route) throw new Error('This feature is unavailable in member-only encrypted mode because it processes readable content on a server.');
  const {kind}=route,contract=PRIVATE_CONTENT[kind];
  let data;
  if(method==='GET') data=await transport(path,opts);
  else {
    let clear;
    if(opts.body instanceof Blob) {
      if(kind!=='drive/files') throw new Error('Binary uploads must use encrypted Drive.');
      const headers=new Headers(opts.headers||{});
      clear={name:opts.body.name||headers.get('x-drive-name')||'file',mime:opts.body.type||headers.get('x-drive-mime')||'application/octet-stream',size:opts.body.size,parentId:headers.get('x-drive-parent-id')||null};
      clear.id=route.id||crypto.randomUUID();
      clear.payloadId=await uploadPayload(key,orgId,new Uint8Array(await opts.body.arrayBuffer()),transport,clear.id);
    } else {
      clear=parseBody(opts.body);
      if(kind==='drive/files'&&(clear.textContent!==undefined||clear.dataUrl!==undefined)) {
        let bytes;
        if(clear.dataUrl) {
          const u=String(clear.dataUrl);if(!u.startsWith('data:')) throw new Error('File data must be local.');
          bytes=new Uint8Array(await (await fetch(u)).arrayBuffer());
        } else bytes=new TextEncoder().encode(String(clear.textContent||''));
        clear.id=route.id||clear.id||crypto.randomUUID();
        clear.payloadId=await uploadPayload(key,orgId,bytes,transport,clear.id);
        delete clear.dataUrl;delete clear.textContent;
      }
    }
    const id=route.id||clear.id||crypto.randomUUID();
    let previous=null;
    if(method!=='POST') {
      const current=await transport(`/api/orgs/${encodeURIComponent(orgId)}/${kind}/${encodeURIComponent(id)}`);
      previous=await reveal(key,orgId,kind,current[contract.one],transport);
    }
    if(method==='DELETE') {
      data=await transport(path,{method,body:JSON.stringify({id,revision:previous.revision})});
    } else {
      const combined={...(previous||{}),...clear};
      // Content is authoritative inside the envelope. IDs and revisions are checked
      // independently; never merge decrypted content over these protocol fields.
      for(const k of ['ciphertext','encrypted_blob','encryptedBlob','revision','encrypted','previewUrl','downloadUrl','url','storage_key','storageKey']) delete combined[k];
      const ciphertext=await encryptPrivate(key,combined,orgId,kind,id);
      data=await transport(path,{method,body:JSON.stringify({id,ciphertext,revision:previous?.revision||0,...(contract.parent?{parentId:combined[contract.parent]||null}:{})})});
    }
  }
  const next={...data,private_mode:true};
  if(data[contract.one]) next[contract.one]=await reveal(key,orgId,kind,data[contract.one],transport,kind==='drive/files'&&!!route.id&&method==='GET');
  if(Array.isArray(data[contract.list])) next[contract.list]=await Promise.all(data[contract.list].map(row=>reveal(key,orgId,kind,row,transport)));
  if(kind==='witness') next.records=next.items;
  return {handled:true,data:next};
}
