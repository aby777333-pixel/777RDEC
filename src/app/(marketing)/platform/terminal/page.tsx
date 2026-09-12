import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { WorkspaceMap } from '@/components/platform/workspace-map'
import { AppShotFrame } from '@/components/platform/app-shot-frame'
import { Section, SectionHeader } from '@/components/ui/section'
import { SpecGroups } from '@/components/ui/spec-groups'
import { TERMINAL_SPECS } from '@/lib/copy/app-capabilities'
import { terminal as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/terminal',
})

export default function TerminalPage() {
  return (
    <StandardPage copy={copy} modulesHeading="Inside the terminal" heroBackdrop="tunnel">
      <WorkspaceMap />

      <Section grid className="border-b border-line-1">
        <SectionHeader
          eyebrow="Specification"
          title="What the terminal actually carries."
          lead="Every count here is the platform&rsquo;s own. They are worth stating because an evaluator is not asking whether there are charts &mdash; they are asking which chart types, which order types, and whether the strategy they already own will run without being rewritten."
        />
        <AppShotFrame id="terminal" eyebrow="The terminal, running" className="mt-12" />
        <SpecGroups groups={TERMINAL_SPECS} className="mt-12" />
      </Section>
    </StandardPage>
  )
}
