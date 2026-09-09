import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { backOffice as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/back-office',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
