import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { technologyHub as copy } from '@/lib/copy/technology'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/technology',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
