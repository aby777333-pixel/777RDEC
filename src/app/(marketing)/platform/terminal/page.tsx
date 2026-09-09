import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { terminal as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/terminal',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
