import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { crm as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/crm',
})

export default function Page() {
  return <StandardPage copy={copy} heroBackdrop="torus" />
}
