import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { INTELLIGENCE_ROLES } from '@/lib/copy/app-capabilities'
import { intelligenceHub as copy } from '@/lib/copy/intelligence'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/intelligence',
})

export default function Page() {
  return (
    <StandardPage copy={copy}>
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Where it shows up"
          title="Four places it does something, not one place it lives."
          lead="An intelligence layer that sits in its own tab is a second product to remember. This one appears at the ticket, at the trader, at the market and at the desk &mdash; the same layer, answering a different question in each."
        />
        <SpecGroups groups={INTELLIGENCE_ROLES} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
