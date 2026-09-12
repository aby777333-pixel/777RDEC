import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { AppShotFrame } from '@/components/platform/app-shot-frame'
import { BROKER_DESK_SPECS } from '@/lib/copy/app-capabilities'
import { brokerPlatform as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/platform',
})

export default function Page() {
  /* The blooming circles live here and nowhere else on the site. */
  return (
    <StandardPage copy={copy} heroBackdrop="bloom">
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="The control room"
          title="What the desk gets on day one."
          lead="A broker does not buy a trading screen. They buy the room behind it: the book, the clients, the partners, the liquidity, and the record a regulator will ask for."
        />
        <AppShotFrame id="desk" eyebrow="The desk, running" className="mt-12" />
        <SpecGroups groups={BROKER_DESK_SPECS} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
