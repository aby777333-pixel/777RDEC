import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { SECURITY_SPECS } from '@/lib/copy/app-capabilities'
import { security as copy } from '@/lib/copy/technology'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/technology/security',
})

export default function Page() {
  return (
    <StandardPage copy={copy}>
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Specification"
          title="Where the boundaries are enforced."
          lead="Isolation and retention are the two questions a due-diligence pack asks in different words on every page. Both are answered below the application, which is the only place an answer holds."
        />
        <SpecGroups groups={SECURITY_SPECS} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
