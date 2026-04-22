import { resolvePublicSitePermission } from './_lib/publicSiteAuth.js'
import { ensureMediaAssetsTable, listMediaAssets, upsertMediaAsset, deleteMediaAsset } from './_lib/mediaAssets.js'
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
    const url = new URL(context.request.url)
    const mediaType = url.searchParams.get('mediaType') || ''

    if (!hasDb(context)) {
      return jsonOk({
        mode: 'scaffold',
        data: { items: [] },
        items: [],
      })
    }

    const db = await ensureDb(context)
    await ensureMediaAssetsTable(db)
    const items = await listMediaAssets(db, { mediaType: mediaType || undefined })

    return jsonOk({
      mode: 'd1',
      data: { items },
      items,
      schemaVersion: APP_SCHEMA_VERSION,
    })
  })
}

export async function onRequestPost(context) {
  return withApiHandler(async () => {
    const permission = await resolvePublicSitePermission(context)

    if (!permission.canEdit) {
      throw forbidden(permission.reason, { details: { canEdit: false, authMode: permission.mode } })
    }

    const body = await parseJsonBody(context.request)
    const asset = body?.asset || body || {}

    if (!hasDb(context)) {
      return jsonOk({
        mode: 'scaffold',
        data: { asset },
        asset,
      })
    }

    const db = await ensureDb(context)
    const saved = await upsertMediaAsset(db, asset)

    return jsonOk({
      mode: 'd1',
      data: { asset: saved },
      asset: saved,
      schemaVersion: APP_SCHEMA_VERSION,
    })
  }, { status: 400 })
}

export async function onRequestDelete(context) {
  return withApiHandler(async () => {
    const permission = await resolvePublicSitePermission(context)

    if (!permission.canEdit) {
      throw forbidden(permission.reason, { details: { canEdit: false, authMode: permission.mode } })
    }

    const url = new URL(context.request.url)
    const id = url.searchParams.get('id') || ''

    if (!id) {
      throw badRequest('missing id')
    }

    if (!hasDb(context)) {
      return jsonOk({
        mode: 'scaffold',
        data: { deleted: id },
        deleted: id,
      })
    }

    const db = await ensureDb(context)
    const result = await deleteMediaAsset(db, id)

    return jsonOk({
      mode: 'd1',
      data: result,
      ...result,
      schemaVersion: APP_SCHEMA_VERSION,
    })
  })
}
