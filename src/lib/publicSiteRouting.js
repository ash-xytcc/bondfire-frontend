import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

export function normalizePublicSiteSlug(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'main'
}

export function buildPublicSiteBasePath(siteSlug = 'main') {
  return `/site/${normalizePublicSiteSlug(siteSlug)}`
}

export function buildPublicSitePath(siteSlug = 'main', nextPath = '/') {
  const base = buildPublicSiteBasePath(siteSlug)
  const cleaned = String(nextPath || '/').trim() || '/'
  return cleaned === '/' ? base : `${base}${cleaned.startsWith('/') ? cleaned : `/${cleaned}`}`
}

export function usePublicSiteSlug() {
  const params = useParams()
  const location = useLocation()

  return useMemo(() => {
    if (params.siteSlug) {
      return normalizePublicSiteSlug(params.siteSlug)
    }

    const match = location.pathname.match(/^\/site\/([^/]+)/)
    if (match?.[1]) {
      return normalizePublicSiteSlug(match[1])
    }

    return 'main'
  }, [params.siteSlug, location.pathname])
}
