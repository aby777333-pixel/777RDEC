import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, ModuleGrid, PageHero } from '@/components/layout/page-shell'
import { RiskLine } from '@/components/layout/risk-line'
import { EmilModes } from '@/components/emil/emil-modes'
import { CapitalArchitecture } from '@/components/emil/capital-architecture'
import { Section, SectionHeader } from '@/components/ui/section'
import { emilLab as copy } from '@/lib/copy/intelligence'
import { pageMetadata } from '@/lib/seo'
import { EMIL_SHORT } from '@/lib/brand'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/intelligence/emil-lab',
})

export default function EmilLabPage() {
  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} imageVariant="emil">
        <div className="max-w-2xl">
          <RiskLine />
        </div>
      </PageHero>

      <AnswerGrid answers={copy.answers} />

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Operating modes"
          title="Three modes. One of them can act."
          lead={`The mode decides what is possible at all. The mandate decides the boundaries within that. Both are set by you, and ${EMIL_SHORT} cannot widen either.`}
        />
        <div className="mt-10">
          <EmilModes />
        </div>
      </Section>

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="The boundaries"
          title="What the mandate ring-fences."
          lead="Every limit below is enforced in the order path, outside the intelligence layer. Nothing EMIL concludes can widen them."
        />
        <div className="mt-12">
          <CapitalArchitecture />
        </div>
      </Section>

      <ModuleGrid modules={copy.modules} heading="What you configure" />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
