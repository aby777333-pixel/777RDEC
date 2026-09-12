import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, ModuleGrid, PageHero } from '@/components/layout/page-shell'
import { LeadForm } from '@/components/forms/lead-form'
import { submitContactMessage } from '@/lib/forms/actions'
import { Section, SectionHeader } from '@/components/ui/section'
import { sandboxAccess as copy } from '@/lib/copy/developers'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/developers/sandbox',
})

export default function SandboxAccessPage() {
  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} backdrop="sandbox" />
      <AnswerGrid answers={copy.answers} />
      <ModuleGrid modules={copy.modules} heading="What the sandbox gives you" />

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Request keys"
          title="Tell us what you are building."
          lead="Scopes are least-privilege, so it helps to know roughly what you need to call. We will confirm the scope with the credentials."
        />
        <div className="mt-10 max-w-3xl">
          <LeadForm
            action={submitContactMessage}
            defaultAudience="developer"
            submitLabel="Request sandbox keys"
            messageLabel="What are you building?"
            messagePlaceholder="Which transports and endpoints you expect to use, and roughly what the integration does…"
          />
        </div>
      </Section>

      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
