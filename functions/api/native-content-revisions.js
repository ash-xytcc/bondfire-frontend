import { ensureNativeRevisionTable, getExistingNativeEntry, listRevisionSnapshots, restoreRevisionSnapshot } from './_lib/nativePublicContent.js'
import { resolvePublicSitePermission } from './_lib/publicSiteAuth.js'
import { jsonOk, withApiHandler, ensureDb, hasDb, parseJsonBody } from './_lib/api.js'
import { badRequest, forbidden } from './_lib/errors.js'
import { APP_SCHEMA_VERSION } from './_lib/migrations.js'

export async function onRequestOptions(context) {
  const permission = await resolvePublicSitePermission(context)

  return jsonOk({
    canEdit: permission.canEdit,
    authMode: permission.mode,
    authReason: permission.reason,
    mode: hasDb(context) ? 'd1' : 'scaffold',
    schemaVersion: APP_SCHEMA_VERSION,
  })
}

export async function onRequestGet(context) {
  return withApiHandler(async () => {
    const permission = await resolvePublicSitePermission(context)

    if (!permission.canEdit) {
      throw forbidden(permission.reason, { details: { canEdit: false, authMode: permission.mode } })
    }

    if (!hasDb(context)) {
      return jsonOk({ mode: 'scaffold', data: { items: [] }, items: [] })
    }

    const db = await ensureDb(context)
    const url = new URL(context.request.url)
    const nativeId = url.searchParams.get('nativeId') || ''
    const slug = url.searchParams.get('slug') || ''

    let resolvedId = nativeId
    if (!resolvedId && slug) {
      const item = await getExistingNativeEntry(db, slug)
      resolvedId = item?.id || ''
    }

    if (!resolvedId) {
      throw badRequest('missing nativeId or slug')
    }

    await ensureNativeRevisionTable(db)
    const items = await listRevisionSnapshots(db, resolvedId)

    return jsonOk({ mode: 'd1', data: { items }, items, schemaVersion: APP_SCHEMA_VERSION })
  })
}

export async function onRequestPost(context) {
  return withApiHandler(async () => {
    const permission = await resolvePublicSitePermission(context)

    if (!permission.canEdit) {
      throw forbidden(permission.reason, { details: { canEdit: false, authMode: permission.mode } })
    }

    if (!hasDb(context)) {
      return jsonOk({ mode: 'scaffold', data: {}, schemaVersion: APP_SCHEMA_VERSION })
    }

    const db = await ensureDb(context)
    const body = await parseJsonBody(context.request)
    const revisionId = String(body?.revisionId || '')

    if (!revisionId) {
      throw badRequest('missing revisionId')
    }

    const restored = await restoreRevisionSnapshot(db, revisionId)

    return jsonOk({ mode: 'd1', data: { item: restored }, item: restored, schemaVersion: APP_SCHEMA_VERSION })
  }, { status: 400 })
}
