import type { Metadata } from 'next'
import {
  HQ_ADDRESS_LINES,
  HQ_COUNTRY_CODE,
  PHONE_E164,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from './brand'

/**
 * Section labels for the Open Graph card, derived from the path so every page
 * gets a card that says where in the site it sits without any call site having
 * to pass it. A path with no entry simply falls back to the tagline.
 */
const OG_SECTIONS: readonly (readonly [string, string])[] = [
  ['/platform', 'Platform'],
  ['/brokers', 'Broker Solutions'],
  ['/technology', 'Technology'],
  ['/intelligence', 'Intelligence'],
  ['/developers', 'Developers'],
  ['/company', 'Company'],
  ['/blog', 'Blog'],
  ['/legal', 'Legal'],
  ['/request-demo', 'Get started'],
]

/** Per-page Open Graph image, rendered on demand by /api/og. */
export function ogImageUrl(title: string, path: string): string {
  const section = OG_SECTIONS.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))
  const params = new URLSearchParams({ title })
  if (section) params.set('kicker', section[1])
  return `/api/og?${params.toString()}`
}

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string
  description: string
  path: string
  noindex?: boolean
}): Metadata {
  const url = `${SITE_URL}${path === '/' ? '' : path}`
  const ogTitle = title
  const ogImage = ogImageUrl(title, path)
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: `${ogTitle} — ${SITE_NAME}`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ogTitle} — ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    slogan: SITE_TAGLINE,
    description:
      'Trading technology provider: terminal, CRM, client portal, risk engine, API hub and an intelligence layer for brokers, institutions and professional desks.',
    telephone: PHONE_E164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${HQ_ADDRESS_LINES[0]}, ${HQ_ADDRESS_LINES[1]}`,
      addressLocality: 'Ruislip',
      postalCode: 'HA4 7AE',
      addressCountry: HQ_COUNTRY_CODE,
    },
  }
}

export function articleJsonLd({
  title,
  description,
  path,
  datePublished,
  author,
}: {
  title: string
  description: string
  path: string
  datePublished: string
  author: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished,
    author: { '@type': 'Organization', name: author },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${path}` },
  }
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Raptor Terminal',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: `${SITE_URL}/platform/terminal`,
    publisher: { '@type': 'Organization', name: SITE_NAME },
  }
}
