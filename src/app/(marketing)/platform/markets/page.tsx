import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SessionGlobe } from '@/components/diagrams/session-globe'
import { sessionImages } from '@/lib/brand-assets'
import { markets as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/markets',
})

export default function Page() {
  return (
    <StandardPage copy={copy}>
      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Sessions"
          title="One clock, three sessions"
          lead="Liquidity is not evenly distributed across the day. The globe reads the current UTC clock and shows which of the three primary sessions are open, and roughly where each one sits in its own arc. Session hours describe market convention, not exchange calendars."
        />
        <SessionGlobe images={sessionImages()} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
