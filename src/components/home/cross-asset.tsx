import { CorrelationHeatmap } from '@/components/charts/correlation-heatmap'
import { Section, SectionHeader } from '@/components/ui/section'
import { ButtonLink } from '@/components/ui/button'

export function CrossAsset() {
  return (
    <Section className="border-b border-line-1">
      {/* minmax(0,1fr): a one-column grid otherwise widens to its widest
          child — here the matrix — and pushes the page past a phone's width. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Cross-asset"
            title={
              <>
                One market moves.
                <br />
                Another market answers.
              </>
            }
            lead="Currencies, metals, indices, energy and crypto are not separate stories. A book that looks diversified by instrument is often one position by exposure."
          />
          <ButtonLink href="/intelligence/market" variant="ghost" className="self-start">
            Market intelligence
          </ButtonLink>
        </div>
        <CorrelationHeatmap />
      </div>
    </Section>
  )
}
