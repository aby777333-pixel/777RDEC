import {
  BROCHURE,
  CONTACT_EMAIL,
  DEVELOPERS_EMAIL,
  EMIL_EXPANSION,
  EMIL_SHORT,
  LEGAL_ENTITY_NAME,
  LIVE_SOCIAL_PROFILES,
  RETAIL_PARTNER,
  REGISTERED_ADDRESS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  TECHNOLOGY_PROVIDER_DISCLOSURE,
} from '@/lib/brand'
import { listContent, type ContentCollection } from '@/lib/content'
import { LEGAL_LINKS, NAV_GROUPS, NAV_MENUS } from '@/lib/navigation'

/**
 * /llms.txt — a plain-Markdown map of the site for language-model tools
 * (https://llmstxt.org). A companion to robots.txt, sitemap.xml and the
 * structured data, not a replacement for any of them.
 *
 * Generated from the same navigation and content the site renders, so it
 * cannot drift from the pages it describes. Static at build time.
 */
export const dynamic = 'force-static'

const url = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`

function link(label: string, path: string, description?: string): string {
  return `- [${label}](${url(path)})${description ? `: ${description}` : ''}`
}

function articles(collection: ContentCollection, base: string): string[] {
  return listContent(collection).map((entry) =>
    link(entry.frontmatter.title, `${base}/${entry.slug}`, entry.frontmatter.description || undefined),
  )
}

export function GET() {
  const seen = new Set<string>()
  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} is a trading technology provider. It builds one connected ecosystem for brokers, institutions and professional trading desks: the Raptor Terminal, a CRM, a client portal, a back office, a risk engine, an API hub (REST, WebSocket, FIX, webhooks) and ${EMIL_SHORT}, the ${EMIL_EXPANSION}. ${SITE_TAGLINE}`,
    '',
    TECHNOLOGY_PROVIDER_DISCLOSURE,
    '',
    `Operated by ${LEGAL_ENTITY_NAME}, ${REGISTERED_ADDRESS}.`,
    '',
  ]

  for (const group of NAV_GROUPS) {
    lines.push(`## ${group.label}`, '', group.blurb, '')
    if (!seen.has(group.href)) {
      lines.push(link(`${group.label} overview`, group.href))
      seen.add(group.href)
    }
    for (const item of group.links) {
      if (seen.has(item.href)) continue
      seen.add(item.href)
      lines.push(link(item.label, item.href, item.description))
    }
    lines.push('')
  }

  const galleryLinks = NAV_MENUS.flatMap((menu) => menu.links).filter((item) => !seen.has(item.href))
  if (galleryLinks.length > 0) {
    lines.push('## Gallery', '')
    for (const item of galleryLinks) {
      seen.add(item.href)
      lines.push(link(item.label, item.href, item.description))
    }
    lines.push('')
  }

  const sections: readonly [string, string[]][] = [
    ['Blog posts', articles('blog', '/blog')],
    ['Research', articles('research', '/intelligence/research')],
    ['Company news', articles('news', '/company/news')],
  ]
  for (const [heading, items] of sections) {
    if (items.length === 0) continue
    lines.push(`## ${heading}`, '', ...items, '')
  }

  lines.push(
    '## Contact',
    '',
    link('Request a demo', '/request-demo', 'Scoped walkthrough for brokers and institutions.'),
    link('Contact', '/company/contact'),
    link('Product brochure (PDF)', BROCHURE.href, `${BROCHURE.pages} pages.`),
    `- Retail traders: EMIL is available through ${RETAIL_PARTNER.name}, ${RETAIL_PARTNER.url}`,
    `- General enquiries: ${CONTACT_EMAIL}`,
    `- Developers: ${DEVELOPERS_EMAIL}`,
    ...LIVE_SOCIAL_PROFILES.map((profile) => `- ${profile.label}: ${profile.url}`),
    '',
    '## Optional',
    '',
    ...LEGAL_LINKS.map((item) => link(item.label, item.href)),
    link('Sitemap', '/sitemap.xml'),
    '',
  )

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
