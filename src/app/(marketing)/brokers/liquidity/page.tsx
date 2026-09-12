import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { LIQUIDITY_SPECS } from '@/lib/copy/app-capabilities'
import { liquidity as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/liquidity',
})

export default function Page() {
  return (
    <StandardPage copy={copy} heroBackdrop="knot">
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="The plumbing"
          title="Your venues, measured."
          lead="Raptor does not price or provide liquidity. It connects to the providers you have contracted with, aggregates them, routes on your rules, and tells you which of them is actually filling you well."
        />
        <SpecGroups groups={LIQUIDITY_SPECS} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
