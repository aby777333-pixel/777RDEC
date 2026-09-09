import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { engagement as copy } from '@/lib/copy/engage'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/company/engagement',
})

export default function EngagementPage() {
  return <StandardPage copy={copy} modulesHeading="What drives the number" />
}
