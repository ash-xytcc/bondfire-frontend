const API_URL = '/api/public-site-domains'

export async function fetchPublicSiteDomainState() {
  const response = await fetch(API_URL, {
    method: 'GET',
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to load public site domain state')
  }

  return data?.state || null
}

export async function savePublicSiteDomainState(payload) {
  const response = await fetch(API_URL, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to save public site domain state')
  }

  return data?.state || null
}
