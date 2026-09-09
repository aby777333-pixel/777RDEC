import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { EcosystemDiagram } from '@/components/diagrams/ecosystem-diagram'
import { Section, SectionHeader } from '@/components/ui/section'
import { architecture as copy } from '@/lib/copy/technology'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/technology/architecture',
})

export default function ArchitecturePage() {
  return (
    <StandardPage copy={copy} modulesHeading="Tier by tier">
      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Topology"
          title="The flow, end to end."
          lead="Hover a tier to see what it owns. The intelligence layer spans the lower three — it observes them, it does not sit above them."
        />
        <div className="mt-12">
          <EcosystemDiagram />
        </div>
      </Section>
    </StandardPage>
  )
}
