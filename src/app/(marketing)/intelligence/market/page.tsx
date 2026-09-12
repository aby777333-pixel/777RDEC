import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { CorrelationHeatmap } from '@/components/charts/correlation-heatmap'
import { Section, SectionHeader } from '@/components/ui/section'
import { marketIntelligence as copy } from '@/lib/copy/intelligence'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/intelligence/market',
})

export default function MarketIntelligencePage() {
  return (
    <StandardPage copy={copy} modulesHeading="What it tells you" heroBackdrop="answer">
      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Cross-asset"
          title="Positions that behave as one position."
          lead="Hover a row to isolate it. A book spread across eight instruments can still be a single exposure once you group what actually moves together."
        />
        <div className="mt-10">
          <CorrelationHeatmap />
        </div>
      </Section>
    </StandardPage>
  )
}
