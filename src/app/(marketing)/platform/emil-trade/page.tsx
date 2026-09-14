import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { RiskLine } from '@/components/layout/risk-line'
import { AppShotFrame } from '@/components/platform/app-shot-frame'
import { AppShotGallery } from '@/components/platform/app-shot-gallery'
import { AuthorityLadder, BuildSteps, EmilTradeFigures } from '@/components/platform/emil-trade-parts'
import { ButtonLink } from '@/components/ui/button'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import {
  EMIL_TRADE_AI,
  EMIL_TRADE_BUILD,
  EMIL_TRADE_BUSINESS,
  EMIL_TRADE_FLOOR,
  EMIL_TRADE_MARKETS,
  EMIL_TRADE_PROTECTION,
  EMIL_TRADE_TERMINAL,
  emilTrade as copy,
} from '@/lib/copy/emil-trade'
import { pageMetadata } from '@/lib/seo'
import { EMIL_SHORT, EMIL_TRADE, JURISDICTION_NOTE } from '@/lib/brand'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/emil-trade',
})

/**
 * Composed rather than <StandardPage>, for the reason `/platform/modules` is:
 * `copy.modules` exists for search, and StandardPage would render it as a
 * second, thinner version of what the sections below already say.
 */
export default function EmilTradePage() {
  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        heading={copy.heading}
        lead={copy.lead}
        actions={copy.heroActions}
        imageVariant="emil"
      >
        <div className="flex flex-col gap-4">
          <EmilTradeFigures />
          <RiskLine className="max-w-2xl" />
        </div>
      </PageHero>

      <AnswerGrid answers={copy.answers} />

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="AI advisor · trend detector · warnings"
          title="An AI that reads the market beside you."
          lead={`${EMIL_SHORT} sits inside every chart, every ticket and every risk decision. It explains before it suggests, detects the trend and the regime before you have to ask, and warns you — about the market, your margin and your own habits — while there is still time to act on it.`}
        />
        <SpecGroups groups={EMIL_TRADE_AI} className="mt-12" />
      </Section>

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Autonomous, when allowed"
          title="It trades on its own only after you say so."
          lead="Automation you arm, not automation that arms itself. You choose how much authority the AI has, one level at a time, and you can take all of it back in a single tap. Nothing moves up a level by itself."
        />
        <AuthorityLadder className="mt-12" />
        <AppShotGallery ids={['arm', 'cards']} eyebrow="Arming, and a trade card" className="mt-16" />
      </Section>

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="EA and indicator converter · strategy builder"
          title="From an idea, or an MT5 file, to a strategy you trade from."
          lead="Bring the Expert Advisors and indicators you already own, or build new ones with no code at all. The AI converts them to native code, backtests them against the original, attaches them to the chart, and lets you trade straight from their signals."
        />
        <BuildSteps className="mt-12" />
        <SpecGroups groups={EMIL_TRADE_BUILD} className="mt-12" />
        <AppShotGallery
          ids={['strategylab', 'backtest']}
          eyebrow="The strategy lab, and a backtest"
          className="mt-16"
        />
      </Section>

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="TV · radio · chat · video · training"
          title="The trading floor, inside the terminal."
          lead="The broadcast, the room, the call and the classroom — without leaving the chart. Watch live financial television picture-in-picture, keep the radio on, talk in topic rooms, share your screen on a video call, and join a live training module between sessions."
        />
        <SpecGroups groups={EMIL_TRADE_FLOOR} className="mt-12" />
      </Section>

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="The terminal"
          title="Every market, one window."
          lead="Forex, metals, energies, indices and crypto from one account and one interface. Two chart engines, twenty-three order types, and the account’s real state pinned where you cannot miss it."
        />
        <AppShotFrame id="terminal" eyebrow="The terminal, running" className="mt-12" />
        <SpecGroups groups={EMIL_TRADE_TERMINAL} className="mt-12" />
      </Section>

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Research · alerts · social · money"
          title="Everything around the trade."
          lead="The calendar and the central banks, alerts on anything that moves, providers to follow, challenges to take, a marketplace of strategies, and your money in and out — all under the same login."
        />
        <SpecGroups groups={EMIL_TRADE_MARKETS} className="mt-12" />
      </Section>

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Protection"
          title="Rules set in calm moments. Enforced in bad ones."
          lead="Three layers that neither the AI nor your own automation can talk around. Every rule is yours, set while you are thinking clearly — and once armed, it is enforced without negotiation."
        />
        <SpecGroups groups={EMIL_TRADE_PROTECTION} className="mt-12" columns={3} />
        <AppShotGallery
          ids={['risk', 'capital']}
          eyebrow="The breakers, and capital in layers"
          className="mt-16"
        />
      </Section>

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Built on Raptor"
          title="Your brand on it. Your code against it."
          lead={`${EMIL_TRADE} is the trader-facing surface of the same stack brokers run on. Put it in front of your own clients under your own name, or integrate with it directly.`}
        />
        <SpecGroups groups={EMIL_TRADE_BUSINESS} className="mt-12" />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/brokers/white-label" variant="ghost" size="lg">
            White label
          </ButtonLink>
          <ButtonLink href="/developers" variant="ghost" size="lg">
            Developers
          </ButtonLink>
        </div>
        <div className="mt-12 flex max-w-3xl flex-col gap-3">
          <RiskLine />
          <p className="text-data text-steel-500">
            {JURISDICTION_NOTE} Figures and screens shown are illustrative or from demo accounts. Past
            performance, including the scanner’s own graded record, is not indicative of future results.
          </p>
        </div>
      </Section>

      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
