function resolvePublicPath(pathname = '') {
  const direct = String(pathname || '').trim()
  if (direct) return direct

  if (typeof window === 'undefined') return ''

  const hashPath = String(window.location?.hash || '').replace(/^#/, '')
  if (hashPath) return hashPath

  return String(window.location?.pathname || '')
}

export function getPublicSiteSlug(pathname = '') {
  const path = resolvePublicPath(pathname)
  const match = path.match(/^\/(?:p|site)\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function getPublicSiteBasePath(pathname = '') {
  const slug = getPublicSiteSlug(pathname)
  return slug ? `/p/${encodeURIComponent(slug)}` : ''
}

export function usePublicSiteBasePath() {
  try {
    return getPublicSiteBasePath(resolvePublicPath())
  } catch {
    return ''
  }
}

export function buildPublicSitePath(basePath = '', path = '/') {
  const base = String(basePath || '').replace(/\/+$/, '')
  const next = String(path || '/')
  if (!base) return next.startsWith('/') ? next : `/${next}`
  if (next === '/' || next === '') return base || '/'
  return `${base}/${next.replace(/^\/+/, '')}`
}

export function isPublicSiteRoute(pathname = '') {
  const path = resolvePublicPath(pathname)
  return /^\/(?:p|site)\//.test(path)
}
