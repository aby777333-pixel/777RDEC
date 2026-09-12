import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { RiskLine } from '@/components/layout/risk-line'
import { EmilPillars } from '@/components/emil/emil-pillars'
import { EmilModes } from '@/components/emil/emil-modes'
import { SelfLearning } from '@/components/emil/self-learning'
import { CapitalArchitecture } from '@/components/emil/capital-architecture'
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
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} backdrop="dancers">
        <div className="max-w-2xl">
          <RiskLine />
        </div>
      </PageHero>

      <AnswerGrid answers={copy.answers} />

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Self-adjusting"
          title="It learns without being retuned."
          lead={`${EMIL_SHORT} adjusts its own inputs from what the market is actually doing. Not on a quarterly schedule — continuously, as the normal operating state. Here are the four mechanisms, and the line they are not allowed to cross.`}
        />
        <div className="mt-12">
          <SelfLearning />
        </div>
      </Section>

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Capital protection"
          title="It protects the capital you ring-fenced."
          lead="An account does not have to be one number. Declare a portion untouchable, set a floor that ratchets up as profit is banked, and automation is refused before it can reach either."
        />
        <div className="mt-12">
          <CapitalArchitecture />
        </div>
      </Section>

      <Section className="border-b border-line-1 pb-0">
        <SectionHeader
          eyebrow={EMIL_EXPANSION}
          title="Observe. Understand. Adapt. Protect. Act."
          lead={`Five things ${EMIL_SHORT} does, in the order it does them. The fifth only happens once you have armed it.`}
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
