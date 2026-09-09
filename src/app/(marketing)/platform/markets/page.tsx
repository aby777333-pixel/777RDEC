import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { markets as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/markets',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
