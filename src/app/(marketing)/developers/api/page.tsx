import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { apiReference as copy } from '@/lib/copy/developers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/developers/api',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
