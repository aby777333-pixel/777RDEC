import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PageHero } from '@/components/layout/page-shell'
import { LeadForm } from '@/components/forms/lead-form'
import { submitDemoRequest } from '@/lib/forms/actions'
import { Panel } from '@/components/ui/panel'
import { Section } from '@/components/ui/section'
import { AUDIENCE_COOKIE } from '@/components/home/audience-switcher'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Request a demo',
  description:
    'Request a demonstration of the Raptor ecosystem, configured against your own instruments, onboarding flow and risk policy.',
  path: '/request-demo',
})

const EXPECT = [
  'A technical conversation first. Architecture, data model and risk policy before commercials.',
  'A demo instance configured with your instruments, sessions and margin profiles.',
  'Straight answers about what exists today and what would be development work.',
  'No obligation, and no pressure from a sales sequence afterwards.',
]

export default function RequestDemoPage() {
  // The homepage audience switcher stores the visitor's role so this form can
  // default to something sensible rather than an empty select.
  const audience = cookies().get(AUDIENCE_COOKIE)?.value

  return (
    <>
      <PageHero
        eyebrow="Request a demo"
        heading="Bring your own requirements."
        lead="The most useful demo is the one configured against your desk: your instruments, your onboarding flow, your commission structures, your risk limits. Tell us what matters and we will set it up before the call."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start">
          <LeadForm
            action={submitDemoRequest}
            defaultAudience={audience}
            submitLabel="Request a demo"
            messageLabel="What would you like to see?"
            messagePlaceholder="Instruments, onboarding requirements, commission structures, risk policy, integrations you need to keep…"
          />

          <Panel className="flex flex-col gap-5 p-6">
            <h2 className="text-eyebrow uppercase text-steel-500">What to expect</h2>
            <ul className="flex flex-col gap-4">
              {EXPECT.map((item) => (
                <li
                  key={item}
                  className="border-t border-line-2 pt-3.5 text-[0.9375rem] leading-relaxed text-steel-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Section>
    </>
  )
}
