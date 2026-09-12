import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { DISTRIBUTION_SPECS } from '@/lib/copy/app-capabilities'
import { ibAffiliates as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/ib-affiliates',
})

export default function Page() {
  return (
    <StandardPage copy={copy} heroBackdrop="swarm">
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Distribution"
          title="Partners, copiers, allocators and funded traders."
          lead="Four different ways a book grows, all settling against the same fills — so a partner&rsquo;s statement and a trader&rsquo;s history cannot disagree."
        />
        <SpecGroups groups={DISTRIBUTION_SPECS} className="mt-12" columns={3} />
      </Section>
    </StandardPage>
  )
}
