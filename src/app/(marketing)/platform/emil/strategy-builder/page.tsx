import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, ModuleGrid, PageHero } from '@/components/layout/page-shell'
import { RiskLine } from '@/components/layout/risk-line'
import { ButtonAnchor, ButtonLink } from '@/components/ui/button'
import { Section, SectionHeader } from '@/components/ui/section'
import { strategyBuilder as copy } from '@/lib/copy/strategy-builder'
import { pageMetadata } from '@/lib/seo'
import { JURISDICTION_NOTE } from '@/lib/brand'
import { emilApp, emilAppHref } from '@/lib/emil-apps'

const APP = emilApp('emil-strategy-builder')
const APP_HREF = emilAppHref('emil-strategy-builder')

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: APP.page,
})

/**
 * The builder is its own app (apps/emil-strategy-builder, served from
 * public/emil-strategy-builder), so it is opened with plain anchors rather
 * than next/link, and previewed here in a same-origin frame.
 */
export default function StrategyBuilderPage() {
  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} backdrop="breach">
        <div className="flex max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonAnchor href={APP_HREF} variant="primary" size="lg" className="w-full sm:w-auto">
              Open the {APP.name}
            </ButtonAnchor>
            <ButtonLink href="/request-demo" size="lg" className="w-full sm:w-auto">
              Request a demo
            </ButtonLink>
          </div>
          <RiskLine />
        </div>
      </PageHero>

      <AnswerGrid answers={copy.answers} />

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Live demo"
          title="Build one yourself."
          lead="This is the builder itself, running on simulated accounts. Open Builder, pick an engine, backtest it on live candles, then download it or attach it to EMIL Trade. Quotes and charts come from the Raptor Market API; nothing you do here places an order."
        />
        <div className="mt-12 hidden overflow-hidden rounded-panel border border-line-2 bg-bg-0 shadow-panel md:block">
          <iframe
            src={APP_HREF}
            title={`${APP.name} — live demo`}
            loading="lazy"
            className="block h-[44rem] w-full border-0"
          />
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ButtonAnchor href={APP_HREF} size="md" className="w-full sm:w-auto">
            Open full screen
          </ButtonAnchor>
          <ButtonAnchor href={`${APP_HREF}#/builder`} variant="quiet" size="md" className="w-full sm:w-auto">
            Go to the builder
          </ButtonAnchor>
          <ButtonAnchor href={`${APP_HREF}#/audit`} variant="quiet" size="md" className="w-full sm:w-auto">
            Go to the audit trail
          </ButtonAnchor>
        </div>
      </Section>

      <ModuleGrid modules={copy.modules} eyebrow="Inside the builder" heading="What each screen does" />

      <div className="container-raptor pt-4">
        <div className="flex max-w-3xl flex-col gap-3">
          <RiskLine />
          <p className="text-data text-steel-500">
            {JURISDICTION_NOTE} Strategies, backtests, positions and results shown in the demo are simulated and
            illustrative. Past performance, including backtested performance, is not indicative of future results.
          </p>
        </div>
      </div>

      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
