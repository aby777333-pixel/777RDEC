import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { riskIntelligence as copy } from '@/lib/copy/intelligence'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/intelligence/risk',
})

export default function Page() {
  return <StandardPage copy={copy} heroBackdrop="tension" />
}
