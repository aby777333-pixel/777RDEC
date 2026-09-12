import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { Panel } from '@/components/ui/panel'
import { Chip } from '@/components/ui/chip'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { INTEGRATION_SPECS } from '@/lib/copy/app-capabilities'
import { integrations as copy } from '@/lib/copy/technology'
import {
  INTEGRATION_CATEGORIES,
  STATUS_LABEL,
  type IntegrationStatus,
} from '@/lib/copy/integrations-directory'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/technology/integrations',
})

const STATUS_TONE: Record<IntegrationStatus, 'up' | 'signal' | 'steel'> = {
  live: 'up',
  available: 'signal',
  request: 'steel',
}

export default function IntegrationsPage() {
  const all = INTEGRATION_CATEGORIES.flatMap((c) => c.vendors)
  const live = all.filter((v) => v.status === 'live').length
  const available = all.filter((v) => v.status === 'available').length

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} />
      <AnswerGrid answers={copy.answers} />

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow={`${INTEGRATION_CATEGORIES.length} categories`}
          title="What Raptor speaks to."
          lead="Grouped by category, with the protocol-level facts separated from the vendor list. Nothing is marked as in production unless it is running for a client today."
        />

        <div className="mt-8 flex flex-wrap gap-2">
          <Chip tone="up" dot>
            {live} in production
          </Chip>
          <Chip tone="signal" dot>
            {available} adapter available
          </Chip>
          <Chip dot>{all.length - live - available} on request</Chip>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {INTEGRATION_CATEGORIES.map((category) => (
            <Panel key={category.id} tintIndex={category.tint} className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <h3 className="tint-ink font-display text-[1.1875rem] uppercase tracking-tight">
                  {category.label}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-steel-300">{category.blurb}</p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-eyebrow uppercase text-steel-500">
                  How it connects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {category.standards.map((standard) => (
                    <span
                      key={standard}
                      className="rounded-ui border border-line-2 px-2 py-1 font-mono text-[0.6875rem] text-steel-300"
                    >
                      {standard}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-eyebrow uppercase text-steel-500">Providers</span>
                <ul className="flex flex-col">
                  {category.vendors.map((vendor) => (
                    <li
                      key={vendor.name}
                      className="flex flex-wrap items-baseline justify-between gap-2 border-t border-line-1 py-2.5 first:border-t-0"
                    >
                      <span className="text-[0.9375rem] text-steel-300">
                        {vendor.name}
                        {vendor.note ? (
                          <span className="ml-2 font-mono text-[0.6875rem] text-steel-500">
                            {vendor.note}
                          </span>
                        ) : null}
                      </span>
                      <Chip tone={STATUS_TONE[vendor.status]}>{STATUS_LABEL[vendor.status]}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-[0.875rem] leading-relaxed text-steel-500">
          Provider names describe categories of integration rather than endorsements or existing
          commercial relationships. Send us the specific vendors you use and we will tell you
          plainly which adapters exist today and which would be development work.
        </p>
      </Section>

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Connectivity"
          title="What it talks to, and what it does not depend on."
          lead="The bridges to MT5 and cTrader are how a broker arrives, not how the platform works once they have."
        />
        <SpecGroups groups={INTEGRATION_SPECS} className="mt-12" />
      </Section>

      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
