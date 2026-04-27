import { getPublicSiteDomainState, normalizeSiteSlug, updatePublicSiteDomainState } from './_lib/publicSiteDomains.js'
import { resolvePublicSitePermission } from './_lib/publicSiteAuth.js'
import { jsonOk, jsonError, parseJsonBody } from './_lib/api.js'
import { forbidden, badRequest } from './_lib/errors.js'

export async function onRequestOptions(context) {
  const permission = await resolvePublicSitePermission(context)

  return jsonOk({
    canEdit: permission.canEdit,
    authMode: permission.mode,
    authReason: permission.reason,
    mode: hasBfDb(context) ? 'd1' : 'scaffold',
    note: hasBfDb(context)
      ? 'D1-backed public site domain route available.'
      : 'No BF_DB binding detected. Using scaffold mode.',
  })
}

export async function onRequestGet(context) {
  try {
    const permission = await resolvePublicSitePermission(context)

    if (!hasBfDb(context)) {
      return jsonOk({
        mode: 'scaffold',
        canEdit: permission.canEdit,
        authMode: permission.mode,
        authReason: permission.reason,
        state: {
          scope: 'global',
          siteSlug: 'main',
          slugPath: '/p/main',
          domains: [],
          resolvedDomain: null,
        },
      })
    }

    const requestHost = context.request.headers.get('x-forwarded-host') || context.request.headers.get('host') || ''
    const state = await getPublicSiteDomainState(context.env.BF_DB, 'global', requestHost)

    return jsonOk({
      mode: 'd1',
      canEdit: permission.canEdit,
      authMode: permission.mode,
      authReason: permission.reason,
      state,
    })
  } catch (error) {
    return jsonError(error)
  }
}

export async function onRequestPut(context) {
  try {
    const permission = await resolvePublicSitePermission(context)

    if (!permission.canEdit) {
      throw forbidden(permission.reason, {
        details: { canEdit: false, authMode: permission.mode },
      })
    }

    const body = await parseJsonBody(context.request)

    if (!hasBfDb(context)) {
      return jsonOk({
        mode: 'scaffold',
        saved: true,
        canEdit: true,
        authMode: permission.mode,
        authReason: permission.reason,
        state: {
          scope: 'global',
          siteSlug: normalizeSiteSlug(body?.siteSlug || 'main') || 'main',
          slugPath: `/p/${normalizeSiteSlug(body?.siteSlug || 'main') || 'main'}`,
          domains: [],
          resolvedDomain: null,
        },
        note: 'BF_DB binding missing. Save accepted in scaffold mode only.',
      })
    }

    const state = await updatePublicSiteDomainState(context.env.BF_DB, body || {}, 'global')

    return jsonOk({
      mode: 'd1',
      saved: true,
      canEdit: true,
      authMode: permission.mode,
      authReason: permission.reason,
      state,
    })
  } catch (error) {
    const message = String(error?.message || '')
    if (message.toUpperCase().includes('JSON')) {
      return jsonError(badRequest('Invalid JSON payload'))
    }
    return jsonError(error, { status: 400 })
  }
}

function hasBfDb(context) {
  return Boolean(context?.env?.BF_DB)
}
