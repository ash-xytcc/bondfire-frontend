import { setOrgLockdownState } from '../../../_lib/emergency.js';

export async function onRequestPost(ctx) {
  const { orgId } = ctx.params;

  const body = await ctx.request.json().catch(() => ({}));

  const res = await setOrgLockdownState({
    env: ctx.env,
    request: ctx.request,
    orgId,
    enabled: typeof body.enabled === 'boolean' ? body.enabled : !!body.locked,
    reason: body.reason || '',
    rotateKeys: !!body.rotateKeys
  });

  if (!res.ok) return res.resp;

  return new Response(JSON.stringify(res), {
    headers: { 'Content-Type': 'application/json' }
  });
}
