import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/brand'
import { NAV_GROUPS, NAV_MENUS } from '@/lib/navigation'
import { LEGAL_DOCUMENTS } from '@/lib/copy/legal'
import { BLOG_CATEGORIES, listContent, type ContentCollection } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPaths = [
    '/',
    '/request-demo',
    '/company/contact',
    '/company/news',
    '/blog',
    '/intelligence/research',
    '/developers/sandbox',
    '/developers/status',
  ]

  // /intelligence/emil redirects to /platform/emil, so it is excluded.
  const navPaths = NAV_GROUPS.flatMap((group) => [
    group.href,
    ...group.links.map((link) => link.href),
  ])
    .concat(NAV_MENUS.flatMap((menu) => menu.links.map((link) => link.href)))
    .filter((href) => href !== '/intelligence/emil')

  const legalPaths = LEGAL_DOCUMENTS.map((doc) => `/legal/${doc.slug}`)

  // Articles carry a real publication date; use it rather than the build time,
  // so lastmod only moves when the article does.
  const published = new Map<string, Date>()
  const articlePaths = (collection: ContentCollection, base: string) =>
    listContent(collection).map((entry) => {
      const path = `${base}/${entry.slug}`
      const date = new Date(entry.frontmatter.date)
      if (!Number.isNaN(date.getTime()) && date.getTime() > 0) published.set(path, date)
      return path
    })
  const researchPaths = articlePaths('research', '/intelligence/research')
  const newsPaths = articlePaths('news', '/company/news')
  const blogPaths = articlePaths('blog', '/blog')
  const blogCategoryPaths = BLOG_CATEGORIES.map((c) => `/blog/category/${c.slug}`)

  const all = Array.from(
    new Set([
      ...staticPaths,
      ...navPaths,
      ...legalPaths,
      ...researchPaths,
      ...newsPaths,
      ...blogPaths,
      ...blogCategoryPaths,
    ]),
  )

  return all.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: published.get(path) ?? now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/legal') ? 0.3 : 0.7,
  }))
}
