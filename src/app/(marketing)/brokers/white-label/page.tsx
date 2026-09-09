import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { BrokersSection } from '@/components/home/brokers-section'
import { whiteLabel as copy } from '@/lib/copy/brokers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/brokers/white-label',
})

export default function WhiteLabelPage() {
  return (
    <StandardPage copy={copy} modulesHeading="What carries your brand">
      <BrokersSection />
    </StandardPage>
  )
}
