import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { about as copy } from '@/lib/copy/company'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/company/about',
})

export default function Page() {
  return <StandardPage copy={copy} heroBackdrop="instruments" />
}
