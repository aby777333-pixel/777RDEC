import type { Metadata } from 'next'
import {
  COMPANY_NUMBER,
  CONTACT_EMAIL,
  HQ_ADDRESS_LINES,
  HQ_COUNTRY_CODE,
  LEGAL_ENTITY_NAME,
  PHONE_E164,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from './brand'

/** Language of every page on the site. Also used for og:locale. */
export const SITE_LOCALE = 'en_GB'
export const SITE_LANGUAGE = 'en-GB'

/** Stable JSON-LD node ids, so pages can reference the entity rather than repeat it. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

/** The lockup, used as the Organization logo in structured data. */
const LOGO_PATH = '/brand/raptor-logo.png'

/** `/` → the bare origin; anything else → origin + path. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path === '/' ? '' : path}`
}

/**
 * Directives for every indexable page. Set explicitly on each page rather than
 * inherited: Next replaces (not merges) `robots` when a page sets the key, so a
 * page that passed `undefined` would silently drop the root layout's value.
 */
export const INDEXABLE_ROBOTS: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}

const NOINDEX_ROBOTS: NonNullable<Metadata['robots']> = { index: false, follow: false }

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

export type ArticleMeta = {
  publishedTime: string
  authors?: readonly string[]
  section?: string
  tags?: readonly string[]
}

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  article,
}: {
  title: string
  description: string
  path: string
  noindex?: boolean
  /** Marks the page as an article for Open Graph (og:type article + dates). */
  article?: ArticleMeta
}): Metadata {
  const url = absoluteUrl(path)
  const ogTitle = `${title} — ${SITE_NAME}`
  const ogImage = ogImageUrl(title, path)
  const image = { url: ogImage, width: 1200, height: 630, alt: ogTitle }
  const common = {
    url,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: ogTitle,
    description,
    images: [image],
  }
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS,
    openGraph: article
      ? {
          ...common,
          type: 'article',
          publishedTime: article.publishedTime,
          authors: article.authors ? [...article.authors] : undefined,
          section: article.section,
          tags: article.tags ? [...article.tags] : undefined,
        }
      : { ...common, type: 'website' },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: LEGAL_ENTITY_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(LOGO_PATH),
      width: 492,
      height: 238,
    },
    slogan: SITE_TAGLINE,
    description:
      'Trading technology provider: terminal, CRM, client portal, risk engine, API hub and an intelligence layer for brokers, institutions and professional desks.',
    email: CONTACT_EMAIL,
    telephone: PHONE_E164,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'UK Companies House company number',
      value: COMPANY_NUMBER,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${HQ_ADDRESS_LINES[0]}, ${HQ_ADDRESS_LINES[1]}`,
      addressLocality: 'Ruislip',
      postalCode: 'HA4 7AE',
      addressCountry: HQ_COUNTRY_CODE,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: CONTACT_EMAIL,
        telephone: PHONE_E164,
        url: absoluteUrl('/request-demo'),
        availableLanguage: ['English'],
      },
    ],
  }
}

/** The site itself, published by the organization above. */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: SITE_LANGUAGE,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

export function articleJsonLd({
  title,
  description,
  path,
  datePublished,
  author,
  type = 'BlogPosting',
  section,
  keywords,
}: {
  title: string
  description: string
  path: string
  datePublished: string
  author: string
  type?: 'BlogPosting' | 'NewsArticle' | 'Article'
  section?: string
  keywords?: readonly string[]
}) {
  const url = absoluteUrl(path)
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#article`,
    headline: title,
    description,
    datePublished,
    dateModified: datePublished,
    inLanguage: SITE_LANGUAGE,
    url,
    image: absoluteUrl(ogImageUrl(title, path)),
    articleSection: section,
    keywords: keywords && keywords.length > 0 ? keywords.join(', ') : undefined,
    author:
      author === SITE_NAME
        ? { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL }
        : { '@type': 'Organization', name: author },
    publisher: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Raptor Terminal',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: absoluteUrl('/platform/terminal'),
    publisher: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME },
  }
}

/** Serialise JSON-LD for a <script> tag, escaping `<` so no string can close it. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
