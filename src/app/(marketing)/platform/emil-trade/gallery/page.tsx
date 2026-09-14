import type { Metadata } from 'next'
import { CtaBand, PageHero } from '@/components/layout/page-shell'
import { RiskLine } from '@/components/layout/risk-line'
import { ScreenGallery } from '@/components/platform/screen-gallery'
import { Section, SectionHeader } from '@/components/ui/section'
import { EMIL_TRADE } from '@/lib/brand'
import { EMIL_TRADE_GALLERY, EMIL_TRADE_GALLERY_DATE } from '@/lib/emil-gallery'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: `${EMIL_TRADE} Gallery`,
  description: `The running ${EMIL_TRADE} platform, screen by screen: the terminal, the trade ticket, NEXUS, live TV, video chat, the scanner, the hedging engine, Shield and ABIN — each with a heading and an explanation.`,
  path: '/platform/emil-trade/gallery',
})

export default function EmilTradeGalleryPage() {
  return (
    <>
      <PageHero
        eyebrow={`Gallery · ${EMIL_TRADE}`}
        heading={`${EMIL_TRADE}, screen by screen.`}
        lead={`${EMIL_TRADE_GALLERY.length} captures of the running trading platform, taken ${EMIL_TRADE_GALLERY_DATE}: the terminal and its menus, the one-click ticket and alerts, NEXUS, live TV and video chat, the scanner, the hedging engine, Shield and ABIN.`}
        imageVariant="emil"
      />

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="The trading platform, running"
          title="Every market, one window — shown, not described."
          lead={`${EMIL_TRADE} is the multi-asset platform your traders actually sit in front of. Each capture below carries a heading and a short explanation of what it shows and why it is built that way. The player moves on every ten seconds; click the picture to stop and read it.`}
        />
        <div className="mt-12">
          <ScreenGallery shots={EMIL_TRADE_GALLERY} label={`${EMIL_TRADE} screenshots`} />
        </div>
        <div className="mt-10 flex max-w-3xl flex-col gap-3">
          <RiskLine />
          <p className="text-data text-steel-500">
            Prices, signals and figures in these captures are from demo and research data and are
            illustrative only. Trader and session identifiers are blacked out, and the live broadcast
            frame is blurred.
          </p>
        </div>
      </Section>

      <CtaBand
        heading={`What ${EMIL_TRADE} does, feature by feature.`}
        body="The platform page walks through the AI advisor, NEXUS, automation you arm, the strategy builder, the trading floor and every layer of protection."
        actions={[
          { label: `Read about ${EMIL_TRADE}`, href: '/platform/emil-trade', variant: 'primary' },
          { label: 'Request a demo', href: '/request-demo', variant: 'ghost' },
        ]}
      />
    </>
  )
}
