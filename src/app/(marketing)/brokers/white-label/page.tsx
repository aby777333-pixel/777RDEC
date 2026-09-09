import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { whiteLabel as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/white-label',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
