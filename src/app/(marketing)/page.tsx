import type { Metadata } from 'next'
import { Hero } from '@/components/home/hero'
import { NotAnotherPlatform } from '@/components/home/not-another-platform'
import { EcosystemFlow } from '@/components/home/ecosystem-flow'
import { EmilReveal } from '@/components/home/emil-reveal'
import { AudienceSwitcher } from '@/components/home/audience-switcher'
import { CrossAsset } from '@/components/home/cross-asset'
import { RiskSection } from '@/components/home/risk-section'
import { BrokersSection } from '@/components/home/brokers-section'
import { ApiSection } from '@/components/home/api-section'
import { Closing } from '@/components/home/closing'
import { pageMetadata, softwareApplicationJsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Trading Technology. Evolved.',
  description:
    'The market does not stand still. Neither should your technology. Terminal, CRM, client portal, risk engine, API and an intelligence layer — one connected ecosystem for brokers, institutions and professional desks.',
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <Hero />
      <NotAnotherPlatform />
      <EcosystemFlow />
      <EmilReveal />
      <AudienceSwitcher />
      <CrossAsset />
      <RiskSection />
      <BrokersSection />
      <ApiSection />
      <Closing />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd()) }}
      />
    </>
  )
}
