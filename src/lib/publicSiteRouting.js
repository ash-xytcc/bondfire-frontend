export function getPublicSiteSlug(pathname = '') {
  const match = String(pathname || '').match(/^\/site\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function getPublicSiteBasePath(pathname = '') {
  const slug = getPublicSiteSlug(pathname || window.location.pathname || '/')
  return slug ? `/site/${encodeURIComponent(slug)}` : ''
}

export function usePublicSiteBasePath() {
  try { return getPublicSiteBasePath(window.location.pathname || '/') } catch { return '' }
}

export function buildPublicSitePath(basePath = '', path = '/') {
  const base = String(basePath || '').replace(/\/+$/, '')
  const next = String(path || '/')
  if (!base) return next.startsWith('/') ? next : `/${next}`
  if (next === '/' || next === '') return base || '/'
  return `${base}/${next.replace(/^\/+/, '')}`
}

export function isPublicSiteRoute(pathname = '') {
  return String(pathname || '').startsWith('/site/')
}
