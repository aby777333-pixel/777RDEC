import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/brand'
import { NAV_GROUPS } from '@/lib/navigation'
import { LEGAL_DOCUMENTS } from '@/lib/copy/legal'
import { listContent } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPaths = [
    '/',
    '/request-demo',
    '/company/contact',
    '/company/news',
    '/intelligence/research',
    '/developers/sandbox',
    '/developers/status',
  ]

  // /intelligence/emil redirects to /platform/emil, so it is excluded.
  const navPaths = NAV_GROUPS.flatMap((group) => [
    group.href,
    ...group.links.map((link) => link.href),
  ]).filter((href) => href !== '/intelligence/emil')

  const legalPaths = LEGAL_DOCUMENTS.map((doc) => `/legal/${doc.slug}`)
  const researchPaths = listContent('research').map((e) => `/intelligence/research/${e.slug}`)
  const newsPaths = listContent('news').map((e) => `/company/news/${e.slug}`)

  const all = Array.from(
    new Set([...staticPaths, ...navPaths, ...legalPaths, ...researchPaths, ...newsPaths]),
  )

  return all.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/legal') ? 0.3 : 0.7,
  }))
}
