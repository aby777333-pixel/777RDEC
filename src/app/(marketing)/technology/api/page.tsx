import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { ApiSection } from '@/components/home/api-section'
import { api as copy } from '@/lib/copy/technology'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/technology/api',
})

export default function ApiPage() {
  return (
    <StandardPage copy={copy} modulesHeading="Four transports" heroBackdrop="river">
      <ApiSection />
    </StandardPage>
  )
}
