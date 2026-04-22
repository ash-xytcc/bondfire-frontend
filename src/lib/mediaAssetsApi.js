import { getSavedAdminToken } from './publicConfigApi'
import { safeJson, requireOk } from './apiClient'

function authHeaders() {
  const token = getSavedAdminToken()
  if (!token) return {}
  return {
    authorization: `Bearer ${token}`,
    'x-sabot-admin-token': token,
  }
}

export async function fetchMediaAssets(params = {}) {
  const url = new URL('/api/media-assets', window.location.origin)

  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const res = await fetch(url.pathname + url.search, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      ...authHeaders(),
    },
  })

  const data = await safeJson(res)
  return requireOk(data, res, `media fetch failed: ${res.status}`)
}

export async function saveMediaAsset(asset) {
  const res = await fetch('/api/media-assets', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ asset }),
  })

  const data = await safeJson(res)
  return requireOk(data, res, `media save failed: ${res.status}`)
}

export async function removeMediaAsset(id) {
  const url = new URL('/api/media-assets', window.location.origin)
  url.searchParams.set('id', id)

  const res = await fetch(url.pathname + url.search, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      ...authHeaders(),
    },
  })

  const data = await safeJson(res)
  return requireOk(data, res, `media delete failed: ${res.status}`)
}
