import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import { status as copy } from '@/lib/copy/developers'
import { pageMetadata } from '@/lib/seo'
import { STATE_LABELS, getStatus, type ComponentState } from '@/lib/status'
import { cn } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/developers/status',
})

export const dynamic = 'force-dynamic'

const STATE_TONE: Record<ComponentState, string> = {
  operational: 'text-up',
  degraded: 'text-warn',
  outage: 'text-down',
  maintenance: 'text-signal',
}

export default function StatusPage() {
  const payload = getStatus()

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} backdrop="uptime" />

      <Section className="border-b border-line-1">
        <SectionHeader
          eyebrow="Current state"
          title={STATE_LABELS[payload.overall]}
          lead={`All components below, read from the same source as /api/status. Last read ${new Date(payload.updatedAt).toUTCString()}.`}
        />

        <Panel className="mt-10 overflow-hidden p-0">
          <ul>
            {payload.components.map((component) => (
              <li
                key={component.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line-1 px-5 py-4 last:border-b-0"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.9375rem] text-steel-100">{component.name}</span>
                  <span className="text-[0.8125rem] text-steel-500">{component.description}</span>
                </div>
                <span className={cn('flex items-center gap-2 text-[0.8125rem]', STATE_TONE[component.state])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                  {STATE_LABELS[component.state]}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <p className="mt-4 text-[0.8125rem] text-steel-500">
          Machine-readable at{' '}
          <a href="/api/status" className="text-signal underline underline-offset-4">
            /api/status
          </a>
          .
        </p>
      </Section>

      <AnswerGrid answers={copy.answers} />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
