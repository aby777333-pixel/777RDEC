import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { ENGAGEMENT_SPECS, RESPONSIBLE_SPECS } from '@/lib/copy/app-capabilities'
import { clientPortal as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/client-portal',
})

export default function Page() {
  return (
    <StandardPage copy={copy} heroBackdrop="morph">
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Responsible trading"
          title="Limits a client sets, and the platform keeps."
          lead="A limit a client can lift the moment it binds is not a limit. These are enforced where the orders are, and the ones meant to hold cannot be shortened once they have started."
        />
        <SpecGroups groups={RESPONSIBLE_SPECS} className="mt-12" />
      </Section>

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Beyond the terminal"
          title="What else the portal can carry."
          lead="Education, standing and community are optional, and every one of them is the broker&rsquo;s to switch on. The coach is the part worth reading twice."
        />
        <SpecGroups groups={ENGAGEMENT_SPECS} className="mt-12" columns={3} />
      </Section>
    </StandardPage>
  )
}
