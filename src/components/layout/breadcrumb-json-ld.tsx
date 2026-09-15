'use client'

import { usePathname } from 'next/navigation'
import { SITE_URL } from '@/lib/brand'
import { LEGAL_LINKS, NAV_GROUPS, NAV_MENUS, FOOTER_PRODUCT_LINKS } from '@/lib/navigation'

/**
 * Path → label for every page the navigation already names. Groups go in
 * first so their label wins ("Blog", not "All posts"; "EMIL Gallery", not the
 * short menu label).
 */
const LABELS: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>([['/request-demo', 'Request a demo']])
  const add = (href: string, label: string) => {
    if (!map.has(href)) map.set(href, label)
  }
  for (const group of NAV_GROUPS) add(group.href, group.label)
  for (const group of NAV_GROUPS) for (const link of group.links) add(link.href, link.label)
  for (const menu of NAV_MENUS) for (const link of menu.links) add(link.href, link.label)
  for (const link of LEGAL_LINKS) add(link.href, link.label)
  for (const link of FOOTER_PRODUCT_LINKS) add(link.href, link.label)
  return map
})()

/** Words that keep their capitals when a slug is turned back into a label. */
const UPPERCASE_WORDS = new Set(['emil', 'api', 'crm', 'ib', 'fix', 'ai', 'cfd', 'fx', 'kyc', 'uk'])

/** `how-emil-learns` → `How EMIL Learns`. */
function humanise(segment: string): string {
  let decoded = segment
  try {
    decoded = decodeURIComponent(segment)
  } catch {
    // A malformed escape: fall back to the raw segment.
  }
  return decoded
    .split('-')
    .filter(Boolean)
    .map((word) =>
      UPPERCASE_WORDS.has(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
}

/**
 * BreadcrumbList structured data for the current page, derived from the URL.
 *
 * Intermediate segments that are not pages in their own right (/legal,
 * /blog/category) are skipped, so every item in the trail is a URL that
 * resolves. Renders nothing on the homepage. Server-rendered into the HTML like
 * any client component, so crawlers see it without running JavaScript.
 */
export function BreadcrumbJsonLd() {
  const pathname = usePathname()
  if (!pathname || pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  const items: { name: string; url: string }[] = [{ name: 'Home', url: SITE_URL }]

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    const isLeaf = index === segments.length - 1
    const label = LABELS.get(href)
    if (!isLeaf && !label) return
    items.push({ name: label ?? humanise(segment), url: `${SITE_URL}${href}` })
  })

  if (items.length < 2) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      // Built from the pathname and static navigation labels; `<` is escaped so
      // no value can close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
