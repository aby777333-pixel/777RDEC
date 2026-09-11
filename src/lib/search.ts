import 'server-only'
import type { PageCopy } from './copy/types'
import type { SearchDoc } from './search-types'
import { listContent } from './content'
import { LEGAL_DOCUMENTS } from './copy/legal'
import { FAQ_GROUPS } from './copy/engage'
import * as platform from './copy/platform'
import { modulesPage } from './copy/modules'
import * as brokers from './copy/brokers'
import * as technology from './copy/technology'
import * as intelligence from './copy/intelligence'
import * as company from './copy/company'
import * as developers from './copy/developers'
import * as engage from './copy/engage'
import { proof } from './copy/proof'
import { blogIndex } from './copy/blog'

/**
 * Site search index.
 *
 * Built on the server at build time and handed to the client as props, so
 * there is no search API, no runtime index build and no third-party service.
 * It is small enough (a title, a summary and a keyword blob per document) that
 * shipping it to /search costs less than a round trip would.
 */

/**
 * Path → page copy. Written out rather than derived, because the route tree is
 * file-based and there is no registry to read it from. A page missing here is
 * simply not searchable, never broken.
 */
const PAGES: readonly (readonly [string, PageCopy])[] = [
  ['/platform', platform.platformHub],
  ['/platform/terminal', platform.terminal],
  ['/platform/modules', modulesPage],
  ['/platform/emil', platform.emil],
  ['/platform/markets', platform.markets],
  ['/platform/trading-tools', platform.tradingTools],
  ['/platform/risk', platform.risk],
  ['/brokers', brokers.brokersHub],
  ['/brokers/platform', brokers.brokerPlatform],
  ['/brokers/crm', brokers.crm],
  ['/brokers/client-portal', brokers.clientPortal],
  ['/brokers/back-office', brokers.backOffice],
  ['/brokers/white-label', brokers.whiteLabel],
  ['/brokers/liquidity', brokers.liquidity],
  ['/brokers/ib-affiliates', brokers.ibAffiliates],
  ['/technology', technology.technologyHub],
  ['/technology/architecture', technology.architecture],
  ['/technology/api', technology.api],
  ['/technology/integrations', technology.integrations],
  ['/technology/security', technology.security],
  ['/technology/infrastructure', technology.infrastructure],
  ['/intelligence', intelligence.intelligenceHub],
  ['/intelligence/market', intelligence.marketIntelligence],
  ['/intelligence/risk', intelligence.riskIntelligence],
  ['/intelligence/emil-lab', intelligence.emilLab],
  ['/intelligence/research', intelligence.research],
  ['/company', company.companyHub],
  ['/company/about', company.about],
  ['/company/partners', company.partners],
  ['/company/careers', company.careers],
  ['/company/engagement', engage.engagement],
  ['/company/proof', proof],
  ['/company/faq', engage.faq],
  ['/company/news', company.news],
  ['/developers', developers.developersHub],
  ['/developers/docs', developers.docs],
  ['/developers/api', developers.apiReference],
  ['/developers/sandbox', developers.sandboxAccess],
  ['/developers/status', developers.status],
  ['/blog', blogIndex],
]

function normalise(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Enough body text to match on without shipping whole articles. */
function excerpt(body: string, limit = 600): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit)
}

export function buildSearchIndex(): readonly SearchDoc[] {
  const docs: SearchDoc[] = []

  for (const [path, copy] of PAGES) {
    if (copy.noindex === true) continue
    docs.push({
      path,
      title: copy.title,
      summary: copy.description,
      kind: 'page',
      keywords: normalise(
        [
          copy.title,
          copy.heading,
          copy.eyebrow,
          copy.description,
          copy.lead,
          ...Object.values(copy.answers),
          ...copy.modules.flatMap((m) => [m.title, m.body]),
        ].join(' '),
      ),
    })
  }

  const collections = [
    { collection: 'blog', kind: 'post', prefix: '/blog' },
    { collection: 'research', kind: 'research', prefix: '/intelligence/research' },
    { collection: 'news', kind: 'news', prefix: '/company/news' },
  ] as const

  for (const { collection, kind, prefix } of collections) {
    for (const entry of listContent(collection)) {
      docs.push({
        path: `${prefix}/${entry.slug}`,
        title: entry.frontmatter.title,
        summary: entry.frontmatter.description,
        kind,
        keywords: normalise(
          [
            entry.frontmatter.title,
            entry.frontmatter.description,
            entry.frontmatter.tags.join(' '),
            excerpt(entry.body),
          ].join(' '),
        ),
      })
    }
  }

  for (const doc of LEGAL_DOCUMENTS) {
    docs.push({
      path: `/legal/${doc.slug}`,
      title: doc.title,
      summary: doc.description,
      kind: 'legal',
      keywords: normalise(
        [
          doc.title,
          doc.description,
          doc.intro,
          ...doc.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
        ].join(' '),
      ),
    })
  }

  for (const group of FAQ_GROUPS) {
    for (const item of group.items) {
      docs.push({
        path: `/company/faq#${group.id}`,
        title: item.q,
        summary: item.a,
        kind: 'faq',
        keywords: normalise([group.label, item.q, item.a].join(' ')),
      })
    }
  }

  return docs
}

export type { SearchDoc, SearchKind } from './search-types'
export { kindLabel } from './search-types'
