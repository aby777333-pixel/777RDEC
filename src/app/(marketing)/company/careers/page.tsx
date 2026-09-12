import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, ModuleGrid, PageHero } from '@/components/layout/page-shell'
import { Panel } from '@/components/ui/panel'
import { Chip } from '@/components/ui/chip'
import { Section, SectionHeader } from '@/components/ui/section'
import { careers as copy } from '@/lib/copy/company'
import { APPLY_TO, ROLES } from '@/lib/copy/roles'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/company/careers',
})

export default function CareersPage() {
  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} backdrop="open" />
      <AnswerGrid answers={copy.answers} />

      <Section className="wash border-b border-line-1">
        <SectionHeader
          eyebrow={`${ROLES.length} open roles`}
          title="What we are hiring for."
          lead="Small teams owning whole surfaces, including the operational consequences. No role here is a ticket queue."
        />

        <div className="mt-12 flex flex-col gap-4">
          {ROLES.map((role, index) => (
            <Panel key={role.slug} tintIndex={role.tint} className="p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                <div className="flex flex-col gap-3 lg:w-[22rem] lg:shrink-0">
                  <span className="tint-ink font-mono text-[0.75rem] font-medium" data-numeric>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-[1.375rem] leading-tight tracking-tight text-steel-100">
                    {role.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Chip>{role.team}</Chip>
                    <Chip>{role.type}</Chip>
                  </div>
                  <p className="text-[0.8125rem] text-steel-500">{role.location}</p>
                  <p className="text-[0.9375rem] leading-relaxed text-steel-300">{role.summary}</p>
                  <a
                    href={`mailto:${APPLY_TO}?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                    className="tint-ink self-start text-[0.9375rem] underline underline-offset-4"
                  >
                    Apply for this role
                  </a>
                </div>

                <div className="grid min-w-0 flex-1 gap-8 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <span className="text-eyebrow uppercase text-steel-500">What you would do</span>
                    <ul className="flex flex-col gap-2.5">
                      {role.doing.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-steel-300"
                        >
                          <span className="tint-dot mt-[0.55rem] h-1 w-1 shrink-0 rounded-full" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-eyebrow uppercase text-steel-500">
                      What we are looking for
                    </span>
                    <ul className="flex flex-col gap-2.5">
                      {role.looking.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-steel-300"
                        >
                          <span className="tint-dot mt-[0.55rem] h-1 w-1 shrink-0 rounded-full" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      <ModuleGrid modules={copy.modules} heading="Where the work sits" />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
