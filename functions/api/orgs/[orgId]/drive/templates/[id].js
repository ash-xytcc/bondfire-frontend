import { bad } from "../../../../_lib/http.js";
import { requireOrgRole } from "../../../../_lib/auth.js";
import { ensureDriveSchema, getDb, json, now } from "../../../../_lib/drive.js";

export async function onRequestPatch({ env, request, params }) {
  const orgId=params.orgId,templateId=params.id;
  const auth=await requireOrgRole({env,request,orgId,minRole:"member"});
  if(!auth.ok) return auth.resp;
  await ensureDriveSchema(env);
  const body=await request.json().catch(()=>({}));
  const db=getDb(env);
  const existing=await db.prepare(`SELECT * FROM drive_templates WHERE org_id=? AND id=?`).bind(orgId,templateId).first();
  if(!existing) return bad(404,"NOT_FOUND");
  const encryptedBlob=String(body.encryptedBlob||existing.encrypted_blob||"").trim();
  if(!encryptedBlob) return bad(400,"CIPHERTEXT_REQUIRED");
  await db.prepare(`UPDATE drive_templates SET name='encrypted template',title='encrypted template',content='',encrypted_blob=?,updated_at=? WHERE org_id=? AND id=?`).bind(encryptedBlob,now(),orgId,templateId).run();
  const row=await db.prepare(`SELECT id,encrypted_blob,created_at,updated_at FROM drive_templates WHERE org_id=? AND id=?`).bind(orgId,templateId).first();
  return json({ok:true,template:{id:row.id,name:"encrypted template",title:"encrypted template",body:"",encryptedBlob:row.encrypted_blob||"",createdAt:Number(row.created_at||0),updatedAt:Number(row.updated_at||0)}});
}

export async function onRequestDelete({ env, request, params }) {
  const orgId=params.orgId,templateId=params.id;
  const auth=await requireOrgRole({env,request,orgId,minRole:"member"});
  if(!auth.ok) return auth.resp;
  await ensureDriveSchema(env);
  await getDb(env).prepare(`DELETE FROM drive_templates WHERE org_id=? AND id=?`).bind(orgId,templateId).run();
  return json({ok:true,deleted:true,id:templateId});
}
