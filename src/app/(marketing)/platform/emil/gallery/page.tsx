import type { Metadata } from 'next'
import { CtaBand, PageHero } from '@/components/layout/page-shell'
import { EmilGallery } from '@/components/platform/emil-gallery'
import { Section } from '@/components/ui/section'
import { EMIL_SHORT } from '@/lib/brand'
import { EMIL_GALLERY, EMIL_GALLERY_DATE } from '@/lib/emil-gallery'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: `${EMIL_SHORT} Gallery`,
  description: `The running ${EMIL_SHORT} applications, screen by screen: the Control Cockpit and the EMIL Trade terminal, captured ${EMIL_GALLERY_DATE}.`,
  path: '/platform/emil/gallery',
})

export default function EmilGalleryPage() {
  return (
    <>
      <PageHero
        eyebrow={`Platform · ${EMIL_SHORT} · Gallery`}
        heading={`${EMIL_SHORT}, screen by screen.`}
        backdrop="colorburst"
        lead={`${EMIL_GALLERY.length} captures of the running applications, taken ${EMIL_GALLERY_DATE}: every surface of the Control Cockpit, from the morning brief to the organisation settings, and the EMIL Trade terminal. It moves on every ten seconds; click the picture to stop and read it.`}
      />

      <Section className="border-b border-line-1">
        <EmilGallery />
      </Section>

      <CtaBand
        heading={`What ${EMIL_SHORT} is, not just what it looks like.`}
        body="The platform page explains each of these surfaces — what it reads, what it is forbidden from doing, and where the controls sit."
        actions={[
          { label: `Read about ${EMIL_SHORT}`, href: '/platform/emil', variant: 'primary' },
          { label: 'Request a demo', href: '/request-demo', variant: 'ghost' },
        ]}
      />
    </>
  )
}
