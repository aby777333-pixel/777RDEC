import { EcosystemDiagram } from '@/components/diagrams/ecosystem-diagram'
import { Section, SectionHeader } from '@/components/ui/section'
import { ButtonLink } from '@/components/ui/button'

export function EcosystemFlow() {
  return (
    <Section grid className="border-b border-line-1">
      <SectionHeader
        eyebrow="Architecture"
        title="One connected ecosystem."
        lead="Not a suite of products that were integrated later. One system with several surfaces, sharing one client record, one instrument master and one permission model."
      />
      <div className="mt-12">
        <EcosystemDiagram />
      </div>
      <div className="mt-10">
        <ButtonLink href="/technology/architecture" variant="ghost">
          See the full architecture
        </ButtonLink>
      </div>
    </Section>
  )
}
