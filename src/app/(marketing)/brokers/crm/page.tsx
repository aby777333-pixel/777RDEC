import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { CRM_SPECS } from '@/lib/copy/app-capabilities'
import { crm as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/crm',
})

export default function Page() {
  return (
    <StandardPage copy={copy} heroBackdrop="city">
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="The record"
          title="One profile, carrying what the client actually did."
          lead="A CRM that knows the contact details and not the trading is a mailing list. This one is built on the same record the terminal writes to, which is why it can notice things."
        />
        <SpecGroups groups={CRM_SPECS} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
