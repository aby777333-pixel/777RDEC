import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { security as copy } from '@/lib/copy/technology'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/technology/security',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
