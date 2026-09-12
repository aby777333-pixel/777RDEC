import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { docs as copy } from '@/lib/copy/developers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/developers/docs',
})

export default function Page() {
  return <StandardPage copy={copy} heroBackdrop="machines" />
}
