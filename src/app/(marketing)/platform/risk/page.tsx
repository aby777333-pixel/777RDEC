import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { RiskSection } from '@/components/home/risk-section'
import { CapitalArchitecture } from '@/components/emil/capital-architecture'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { RISK_SPECS } from '@/lib/copy/app-capabilities'
import { risk as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/risk',
})

export default function RiskPage() {
  return (
    <StandardPage copy={copy} modulesHeading="Controls in the order path" heroBackdrop="exploder">
      <RiskSection />

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow="Capital protection"
          title="Structure the account, not just the position."
          lead="Protected capital, a profit floor that only ratchets upward, a drawdown guard measured from the high-water mark, and a daily loss budget. Three horizons, because a bad hour and a structural decline are different problems."
        />
        <div className="mt-12">
          <CapitalArchitecture />
        </div>
      </Section>
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Enforcement"
          title="Checked in the path, not in the morning report."
          lead="A control that runs after the order has gone is a record, not a control. These run where the order is, and on the book as a whole."
        />
        <SpecGroups groups={RISK_SPECS} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
