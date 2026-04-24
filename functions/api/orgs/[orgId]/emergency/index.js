import { readEmergencyStatus } from '../../../_lib/emergency.js';

export async function onRequestGet(ctx) {
  const { orgId } = ctx.params;

  const res = await readEmergencyStatus({
    env: ctx.env,
    request: ctx.request,
    orgId
  });

  if (!res.ok) return res.resp;

  return new Response(JSON.stringify({
    status: res.status,
    orgLockdown: res.orgLockdown
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
