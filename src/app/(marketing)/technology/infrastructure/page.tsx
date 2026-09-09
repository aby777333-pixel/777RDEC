import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { infrastructure as copy } from '@/lib/copy/technology'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/technology/infrastructure',
})

export default function Page() {
  return <StandardPage copy={copy} />
}
