import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PageHero } from '@/components/layout/page-shell'
import { LeadForm } from '@/components/forms/lead-form'
import { submitContactMessage } from '@/lib/forms/actions'
import { Panel } from '@/components/ui/panel'
import { Section } from '@/components/ui/section'
import { AUDIENCE_COOKIE } from '@/components/home/audience-switcher'
import { pageMetadata } from '@/lib/seo'
import {
  CONTACT_EMAIL,
  DEVELOPERS_EMAIL,
  LEGAL_ENTITY_NAME,
  COMPANY_NUMBER,
  HQ_ADDRESS_LINES,
  HQ_COUNTRY_LONG,
  PHONE_DISPLAY,
  PHONE_E164,
} from '@/lib/brand'

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: 'Talk to 777 Raptor about the platform, an integration, security due diligence or a partnership.',
  path: '/company/contact',
})

export default function ContactPage() {
  const audience = cookies().get(AUDIENCE_COOKIE)?.value

  return (
    <>
      <PageHero
        eyebrow="Company · Contact"
        heading="Talk to a human."
        lead="Technical questions get technical answers. If your enquiry is about security due diligence, an integration or a partnership, say so and it goes straight to the right person."
        backdrop="reach"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start">
          <LeadForm
            action={submitContactMessage}
            defaultAudience={audience}
            submitLabel="Send message"
            messageLabel="Your message"
            messagePlaceholder="What would you like to discuss?"
          />

          <div className="flex flex-col gap-4">
            <Panel className="flex flex-col gap-4 p-6">
              <h2 className="text-eyebrow uppercase text-steel-500">Direct</h2>
              <dl className="flex flex-col gap-3 text-[0.9375rem]">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-steel-500">General</dt>
                  <dd>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-signal underline underline-offset-4">
                      {CONTACT_EMAIL}
                    </a>
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-steel-500">Developers</dt>
                  <dd>
                    <a href={`mailto:${DEVELOPERS_EMAIL}`} className="text-signal underline underline-offset-4">
                      {DEVELOPERS_EMAIL}
                    </a>
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-steel-500">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${PHONE_E164}`}
                      className="text-signal underline underline-offset-4"
                      data-numeric
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </dd>
                </div>
              </dl>
            </Panel>

            <Panel className="flex flex-col gap-3 p-6">
              <h2 className="text-eyebrow uppercase text-steel-500">Headquarters</h2>
              <address className="text-[0.9375rem] leading-relaxed text-steel-300 not-italic">
                {HQ_ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="mt-1 block text-steel-500">{HQ_COUNTRY_LONG}</span>
              </address>
            </Panel>

            <Panel className="flex flex-col gap-3 p-6 text-[0.8125rem] leading-relaxed text-steel-500">
              <h2 className="text-eyebrow uppercase text-steel-500">Registered entity</h2>
              <p>
                {LEGAL_ENTITY_NAME}
                <br />
                Company No. {COMPANY_NUMBER}
              </p>
            </Panel>
          </div>
        </div>
      </Section>
    </>
  )
}
