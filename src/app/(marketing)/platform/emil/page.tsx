import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { RiskLine } from '@/components/layout/risk-line'
import { ActivationGate } from '@/components/emil/activation-gate'
import { CircuitBreakers } from '@/components/emil/circuit-breakers'
import { DecisionPipeline } from '@/components/emil/decision-pipeline'
import { PromotionPipeline } from '@/components/emil/promotion-pipeline'
import { TrustVsConfidence } from '@/components/emil/trust-vs-confidence'
import { EmilPillars } from '@/components/emil/emil-pillars'
import { EmilModes } from '@/components/emil/emil-modes'
import { SelfLearning } from '@/components/emil/self-learning'
import { CapitalArchitecture } from '@/components/emil/capital-architecture'
import { NotAnEa } from '@/components/emil/not-an-ea'
import { AppShotFrame } from '@/components/platform/app-shot-frame'
import { AppShotGallery } from '@/components/platform/app-shot-gallery'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import {
  COCKPIT_OPERATIONS,
  COCKPIT_SPECS,
  COCKPIT_SURFACES,
  EVIDENCE_SPECS,
  EXECUTION_ROUTE_SPECS,
  LEARNING_SPECS,
  PROVENANCE_SPECS,
  RISK_CONTROL_SPECS,
  STRATEGY_LIFECYCLE_SPECS,
} from '@/lib/copy/app-capabilities'
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
      <PageHero
        eyebrow={copy.eyebrow}
        heading={copy.heading}
        lead={copy.lead}
        actions={copy.heroActions}
        backdrop="dancers"
      >
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

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Risk, enforced"
          title="Nine breakers, each with its action declared first."
          lead="Sizing starts at the stop and is cut to the exposure ceiling when the arithmetic exceeds it. Around that sit nine circuit breakers, each showing what it watches, the limit it watches against, and what it does when it trips — and a trip stops automation without touching a single open position."
        />
        <div className="mt-12">
          <CircuitBreakers />
        </div>
        <SpecGroups groups={RISK_CONTROL_SPECS} className="mt-12" columns={2} />
        <AppShotGallery
          ids={['risk', 'capital']}
          eyebrow="The breaker grid, and capital in layers"
          className="mt-16"
        />
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

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="The cockpit"
          title="One state under every surface."
          lead={`The Control Cockpit is where ${EMIL_SHORT} is operated: research boards, the symbol layer everything resolves through, fundamentals from the filings, the book and what a shock would do to it. Every surface reads the same account, the same instrument master and the same limits.`}
        />
        <AppShotFrame id="cockpit" eyebrow="The cockpit, running" className="mt-12" priority />
        <SpecGroups groups={COCKPIT_SURFACES} className="mt-12" columns={3} />
        <AppShotGallery
          ids={['markets', 'instruments', 'heatmap', 'charts', 'company', 'screener']}
          eyebrow="Research, fundamentals and the symbol layer"
          className="mt-16"
        />
      </Section>

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Provenance"
          title="Nothing here is an execution price."
          lead="Every board prints its provider, its freshness and the time it was fetched. Delayed, a daily fixing and live from the venue are three different labels, and the cockpit uses them precisely — including when the honest label is stale."
        />
        <SpecGroups groups={PROVENANCE_SPECS} className="mt-12" columns={3} />
        <AppShotGallery
          ids={['news', 'alerts', 'portfolio', 'scenario']}
          eyebrow="Context, alerts, the book and the shock"
          className="mt-16"
        />
      </Section>

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Every decision, in the open"
          title="Execution is step twenty-five of twenty-nine."
          lead="A proposal has to survive the whole pipeline before an order exists, and each step can stop it. Nothing here is a confidence score standing in for a check."
        />
        <div className="mt-12">
          <DecisionPipeline />
        </div>
        <AppShotGallery
          ids={['council', 'cards']}
          eyebrow="The pipeline, and a proposal that did not pass"
          className="mt-16"
        />
      </Section>

      <Section grid className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Inside the cockpit"
          title="A desk of forty, and one that can say no."
          lead={`${EMIL_SHORT} is not one model with a long prompt. It is a coordinated desk of specialists, and an independent risk engine that sits outside that desk holding a veto the desk cannot argue with.`}
        />
        <SpecGroups groups={COCKPIT_SPECS} className="mt-12" columns={3} />
      </Section>

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Operating modes"
          title="Nine modes. Five of them can act."
          lead="The mode determines what is possible at all. The mandate determines the boundaries within that. Both are yours to set, and one of the four that cannot act can still prepare a complete trade and then not send it."
        />
        <div className="mt-10">
          <EmilModes />
        </div>
      </Section>

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Activation"
          title="It cannot turn itself on."
          lead="Arming is a deliberate act with three parts: a disclosure of what the system cannot do, a review of every limit that will be in force, and acknowledgements that have to be ticked. Disarming is one button, always visible, and needs no confirmation at all."
        />
        <div className="mt-12">
          <ActivationGate />
        </div>
        <AppShotGallery ids={['arm']} eyebrow="The activation screen" className="mt-16" />
      </Section>

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Strategies"
          title="Nothing gains live permission automatically."
          lead="Twelve stages in the lab before a person looks at a candidate, then five promotion gates it has to earn. A challenger beats the champion across regimes in paper and restricted live, or it does not replace it — and while no historical engine is connected, the lab labels its own results as estimates."
        />
        <div className="mt-12">
          <PromotionPipeline />
        </div>
        <SpecGroups groups={STRATEGY_LIFECYCLE_SPECS} className="mt-12" columns={3} />
        <AppShotGallery
          ids={['strategycenter', 'strategylab']}
          eyebrow="Champion against challenger, and the lab"
          className="mt-16"
        />
      </Section>

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Its own judgement"
          title="Confidence in a setup is not trust in the environment."
          lead="Two separate numbers, and a rule between them that only goes one way. It grades its own process rather than its outcomes, stores everything it reads as an untested hypothesis, and refuses a setup it rates highly when it does not trust the conditions around it."
        />
        <div className="mt-12">
          <TrustVsConfidence />
        </div>
        <SpecGroups groups={LEARNING_SPECS} className="mt-12" columns={3} />
        <AppShotGallery
          ids={['trust', 'journal', 'teach']}
          eyebrow="Trust, the journal that grades process, and teaching it"
          className="mt-16"
        />
      </Section>

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Reaching a market"
          title="Paper first, and it says so."
          lead="Connect a broker you already have, or use the native terminal. Either way the same risk pipeline applies, the sandbox desks sit in front of the live ones, and the parts that are not finished are labelled rather than implied."
        />
        <SpecGroups groups={EXECUTION_ROUTE_SPECS} className="mt-12" columns={2} />
        <AppShotGallery
          ids={['apihub', 'terminal', 'paper', 'agentdesk']}
          eyebrow="The API hub, the terminal, and the two paper desks"
          className="mt-16"
        />
      </Section>

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Evidence"
          title="A backtest that grades itself weak."
          lead="The engine runs on real public history with fees and slippage as inputs, reports the buy-and-hold it was measured against, and says plainly when there is not enough out-of-sample data to judge. Options analytics sit alongside it for reading volatility rather than predicting it."
        />
        <SpecGroups groups={EVIDENCE_SPECS} className="mt-12" columns={3} />
        <AppShotGallery
          ids={['backtest', 'options']}
          eyebrow="The backtest verdict, and the volatility surface"
          className="mt-16"
        />
      </Section>

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Around the trading"
          title="Scheduling, your own platform, the API, and who may do what."
          lead="Ten central banks with the series each rate came from, a read-only bridge that mirrors the platform you already trade on, a scoped API that reaches paper venues only, and permission grants that are individual switches with every change consent-logged."
        />
        <SpecGroups groups={COCKPIT_OPERATIONS} className="mt-12" columns={2} />
        <AppShotGallery
          ids={['calendar', 'connect', 'developers', 'integrations', 'datafeed', 'settings', 'organization']}
          eyebrow="The operating surfaces"
          className="mt-16"
          columns={3}
        />
      </Section>

      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
