import { getPublicSiteDomainState, updatePublicSiteDomainState } from './_lib/publicSiteDomains.js'
import { resolvePublicSitePermission } from './_lib/publicSiteAuth.js'

export async function onRequestOptions(context) {
  const permission = await resolvePublicSitePermission(context)

  return json({
    ok: true,
    canEdit: permission.canEdit,
    authMode: permission.mode,
    authReason: permission.reason,
    mode: hasDb(context) ? 'd1' : 'scaffold',
    note: hasDb(context)
      ? 'D1-backed public site domain route available.'
      : 'No BF_DB binding detected. Using scaffold mode.',
  })
}

export async function onRequestGet(context) {
  try {
    const permission = await resolvePublicSitePermission(context)

    if (!hasDb(context)) {
      return json({
        ok: true,
        mode: 'scaffold',
        canEdit: permission.canEdit,
        authMode: permission.mode,
        authReason: permission.reason,
        state: {
          scope: 'global',
          siteSlug: 'main',
          slugPath: '/site/main',
          domains: [],
          resolvedDomain: null,
        },
      })
    }

    const requestHost = context.request.headers.get('x-forwarded-host') || context.request.headers.get('host') || ''
    const state = await getPublicSiteDomainState(context.env.BF_DB, 'global', requestHost)

    return json({
      ok: true,
      mode: 'd1',
      canEdit: permission.canEdit,
      authMode: permission.mode,
      authReason: permission.reason,
      state,
    })
  } catch (error) {
    return json({ ok: false, error: String(error?.message || error) }, 500)
  }
}

export async function onRequestPut(context) {
  try {
    const permission = await resolvePublicSitePermission(context)

    if (!permission.canEdit) {
      return json({
        ok: false,
        error: permission.reason,
        canEdit: false,
        authMode: permission.mode,
      }, 403)
    }

    const body = await context.request.json()

    if (!hasDb(context)) {
      return json({
        ok: true,
        mode: 'scaffold',
        saved: true,
        canEdit: true,
        authMode: permission.mode,
        authReason: permission.reason,
        state: {
          scope: 'global',
          siteSlug: body?.siteSlug || 'main',
          slugPath: `/site/${body?.siteSlug || 'main'}`,
          domains: [],
          resolvedDomain: null,
        },
        note: 'BF_DB binding missing. Save accepted in scaffold mode only.',
      })
    }

    const state = await updatePublicSiteDomainState(context.env.BF_DB, body || {}, 'global')

    return json({
      ok: true,
      mode: 'd1',
      saved: true,
      canEdit: true,
      authMode: permission.mode,
      authReason: permission.reason,
      state,
    })
  } catch (error) {
    return json({ ok: false, error: String(error?.message || error) }, 400)
  }
}

function hasDb(context) {
  return Boolean(context?.env?.BF_DB)
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
