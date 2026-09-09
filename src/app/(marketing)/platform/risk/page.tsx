import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { RiskSection } from '@/components/home/risk-section'
import { risk as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/risk',
})

export default function RiskPage() {
  return (
    <StandardPage copy={copy} modulesHeading="Controls in the order path">
      <RiskSection />
    </StandardPage>
  )
}
