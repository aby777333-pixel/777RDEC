import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, ModuleGrid, PageHero } from '@/components/layout/page-shell'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import { CASE_STUDIES, proof as copy } from '@/lib/copy/proof'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/company/proof',
})

export default function ProofPage() {
  const published = CASE_STUDIES.filter((study) => study.approved)

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} />
      <AnswerGrid answers={copy.answers} />

      {published.length > 0 ? (
        <Section className="wash border-b border-line-1">
          <SectionHeader
            eyebrow="Case studies"
            title="Deployments we are permitted to describe."
            lead="Published with the client's written agreement, using figures they confirmed."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {published.map((study, index) => (
              <Panel key={study.slug} tintIndex={index} className="flex flex-col gap-4 p-6">
                <div className="flex flex-col gap-1">
                  <span className="tint-ink text-eyebrow uppercase">{study.sector}</span>
                  <h3 className="font-display text-[1.1875rem] text-steel-100">{study.client}</h3>
                </div>
                <dl className="flex flex-col gap-3 text-[0.9375rem] leading-relaxed">
                  <div>
                    <dt className="text-eyebrow uppercase text-steel-500">Challenge</dt>
                    <dd className="mt-1 text-steel-300">{study.challenge}</dd>
                  </div>
                  <div>
                    <dt className="text-eyebrow uppercase text-steel-500">Approach</dt>
                    <dd className="mt-1 text-steel-300">{study.approach}</dd>
                  </div>
                  <div>
                    <dt className="text-eyebrow uppercase text-steel-500">Outcome</dt>
                    <dd className="mt-1 text-steel-300">{study.outcome}</dd>
                  </div>
                </dl>
              </Panel>
            ))}
          </div>
        </Section>
      ) : (
        <Section className="wash border-b border-line-1">
          <Panel tone="raised" size="panel" className="flex flex-col gap-4 p-8 md:p-12">
            <span className="text-eyebrow uppercase text-steel-500">Case studies</span>
            <h2 className="max-w-3xl text-h2 uppercase text-steel-100">
              None published, deliberately.
            </h2>
            <p className="max-w-2xl text-body text-steel-300">
              We have not published anonymised metrics, because a figure you cannot verify is not
              evidence — and we have not published client names, because our clients did not agree
              to that. What we will do is put you on a call with one of them.
            </p>
          </Panel>
        </Section>
      )}

      <ModuleGrid modules={copy.modules} heading="What we can give you instead" />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
