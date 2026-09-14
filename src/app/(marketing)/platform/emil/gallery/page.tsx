import type { Metadata } from 'next'
import { CtaBand, PageHero } from '@/components/layout/page-shell'
import { ScreenGallery } from '@/components/platform/screen-gallery'
import { Section, SectionHeader } from '@/components/ui/section'
import { EMIL_SHORT, EMIL_TRADE } from '@/lib/brand'
import { EMIL_GALLERY, EMIL_GALLERY_DATE } from '@/lib/emil-gallery'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: `${EMIL_SHORT} Gallery`,
  description: `The running ${EMIL_SHORT} Control Cockpit, screen by screen — every surface with a heading and an explanation of what it shows — captured ${EMIL_GALLERY_DATE}.`,
  path: '/platform/emil/gallery',
})

export default function EmilGalleryPage() {
  return (
    <>
      <PageHero
        eyebrow={`Gallery · ${EMIL_SHORT}`}
        heading={`${EMIL_SHORT}, screen by screen.`}
        backdrop="colorburst"
        lead={`${EMIL_GALLERY.length} captures of the running ${EMIL_SHORT} Control Cockpit, taken ${EMIL_GALLERY_DATE}: from the morning brief and the markets it reads, through arming, the decision pipeline and the strategy lab, to the settings a team runs it by.`}
      />

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="The Control Cockpit, running"
          title="Where the intelligence layer is operated."
          lead={`${EMIL_SHORT} is the intelligence inside the terminal, and the Control Cockpit is where you watch it think, set its limits and decide whether it may act. Each capture below carries a heading and a short explanation of what to look at. The player moves on every ten seconds; click the picture to stop and read it.`}
        />
        <div className="mt-12">
          <ScreenGallery shots={EMIL_GALLERY} label={`${EMIL_SHORT} screenshots`} />
        </div>
      </Section>

      <CtaBand
        heading={`What ${EMIL_SHORT} is, not just what it looks like.`}
        body={`The platform page explains each of these surfaces — what it reads, what it is forbidden from doing, and where the controls sit. The ${EMIL_TRADE} gallery shows the trading platform it lives inside.`}
        actions={[
          { label: `Read about ${EMIL_SHORT}`, href: '/platform/emil', variant: 'primary' },
          { label: `${EMIL_TRADE} gallery`, href: '/platform/emil-trade/gallery', variant: 'ghost' },
        ]}
      />
    </>
  )
}
