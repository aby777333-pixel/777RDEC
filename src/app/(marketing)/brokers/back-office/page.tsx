import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { BACK_OFFICE_SPECS } from '@/lib/copy/app-capabilities'
import { backOffice as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/back-office',
})

export default function Page() {
  return (
    <StandardPage copy={copy} heroBackdrop="drift">
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Administration"
          title="Money movement, and the obligations that come with it."
          lead="The back office is where a brokerage is actually run, and where an audit starts. Both halves work off one ledger rather than a reporting copy of it."
        />
        <SpecGroups groups={BACK_OFFICE_SPECS} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
