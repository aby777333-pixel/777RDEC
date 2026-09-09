import { CorrelationHeatmap } from '@/components/charts/correlation-heatmap'
import { Section, SectionHeader } from '@/components/ui/section'
import { ButtonLink } from '@/components/ui/button'

export function CrossAsset() {
  return (
    <Section className="border-b border-line-1">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
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
