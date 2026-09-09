import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { marketIntelligence as copy } from '@/lib/copy/intelligence'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/intelligence/market',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
