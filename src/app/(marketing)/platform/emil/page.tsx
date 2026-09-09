import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { RiskLine } from '@/components/layout/risk-line'
import { EmilPillars } from '@/components/emil/emil-pillars'
import { EmilModes } from '@/components/emil/emil-modes'
import { NotAnEa } from '@/components/emil/not-an-ea'
import { Section, SectionHeader } from '@/components/ui/section'
import { emil as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'
import { EMIL_EXPANSION, EMIL_SHORT } from '@/lib/brand'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/emil',
})

export default function EmilPage() {
  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} imageVariant="emil">
        <div className="max-w-2xl">
          <RiskLine />
        </div>
      </PageHero>

      <AnswerGrid answers={copy.answers} />

      <Section className="border-b border-line-1 pb-0">
        <SectionHeader
          eyebrow={EMIL_EXPANSION}
          title="Observe. Understand. Adapt. Protect. Act."
          lead={`Five things ${EMIL_SHORT} does, in the order it does them. The fifth only happens if you have authorised it.`}
        />
      </Section>

      <EmilPillars />

      <Section className="border-b border-line-1">
        <NotAnEa />
      </Section>

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Operating modes"
          title="Three modes. One of them can act."
          lead="The mode determines what is possible at all. The mandate determines the boundaries within that. Both are yours to set."
        />
        <div className="mt-10">
          <EmilModes />
        </div>
      </Section>

      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
