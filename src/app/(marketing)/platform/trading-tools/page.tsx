import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { CONVERTER_STEPS } from '@/lib/copy/app-capabilities'
import { tradingTools as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/trading-tools',
})

export default function Page() {
  return (
    <StandardPage copy={copy} heroBackdrop="pyramids">
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Migration"
          title="Bring the strategy you already wrote."
          lead="The hardest thing about leaving a platform is not the platform &mdash; it is the years of work that only runs there. An expert advisor written for MT5 goes through a pipeline rather than a rewrite, and the conversion is tested against the original before anyone trusts it."
        />
        <SpecGroups groups={CONVERTER_STEPS} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
