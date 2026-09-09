import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import { WingMark } from '@/components/ui/wing-mark'
import { RiskLine } from './risk-line'
import type { FiveAnswers, Module, NextStep, PageCopy } from '@/lib/copy/types'
import { cn } from '@/lib/utils'

export function PageHero({
  eyebrow,
  heading,
  lead,
  children,
}: {
  eyebrow: string
  heading: string
  lead: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-line-1 pb-16 pt-20 md:pb-24 md:pt-28">
      <div className="grid-field pointer-events-none absolute inset-0" aria-hidden />
      <WingMark
        className="pointer-events-none absolute -right-24 top-0 h-[22rem] w-[38rem] text-steel-700 opacity-40"
        strokeWidth={1}
      />
      <div className="container-raptor relative">
        <div className="flex max-w-4xl flex-col gap-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-h1 uppercase text-chrome">{heading}</h1>
          <p className="max-w-2xl text-body text-steel-300">{lead}</p>
        </div>
        {children ? <div className="mt-12">{children}</div> : null}
      </div>
    </section>
  )
}

const ANSWER_ROWS: readonly { key: keyof FiveAnswers; label: string }[] = [
  { key: 'what', label: 'What it is' },
  { key: 'who', label: 'Who it is for' },
  { key: 'why', label: 'Why it matters' },
  { key: 'connects', label: 'How it connects' },
  { key: 'next', label: 'What happens next' },
]

export function AnswerGrid({ answers }: { answers: FiveAnswers }) {
  return (
    <Section className="border-b border-line-1">
      <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {ANSWER_ROWS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-2.5 border-t border-line-2 pt-5">
            <dt className="text-eyebrow uppercase text-steel-500">{label}</dt>
            <dd className="text-[1rem] leading-relaxed text-steel-300">{answers[key]}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

export function ModuleGrid({
  modules,
  eyebrow,
  heading,
  lead,
}: {
  modules: readonly Module[]
  eyebrow?: string
  heading: React.ReactNode
  lead?: string
}) {
  return (
    <Section className="border-b border-line-1">
      <SectionHeader eyebrow={eyebrow} title={heading} lead={lead} />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => (
          <Panel key={module.title} className="flex flex-col gap-3 p-6">
            <span className="font-mono text-[0.75rem] text-steel-500" data-numeric>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-[1.1875rem] leading-snug text-steel-100">
              {module.title}
            </h3>
            <p className="text-[0.9375rem] leading-relaxed text-steel-300">{module.body}</p>
          </Panel>
        ))}
      </div>
    </Section>
  )
}

export function CtaBand({
  heading,
  body,
  actions,
}: {
  heading: string
  body: string
  actions: readonly NextStep[]
}) {
  return (
    <Section grid>
      <Panel tone="raised" size="panel" className="flex flex-col gap-6 p-8 md:p-12">
        <h2 className="max-w-3xl text-h2 uppercase text-steel-100">{heading}</h2>
        <p className="max-w-2xl text-body text-steel-300">{body}</p>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <ButtonLink
              key={action.href}
              href={action.href}
              variant={action.variant ?? 'ghost'}
              size="lg"
            >
              {action.label}
            </ButtonLink>
          ))}
        </div>
      </Panel>
    </Section>
  )
}

/**
 * Standard product/company page. Bespoke sections are passed in as `children`
 * and render between the answer grid and the module grid, so every page can
 * carry at least one live component without duplicating the shell.
 */
export function StandardPage({
  copy,
  modulesHeading,
  children,
  className,
}: {
  copy: PageCopy
  modulesHeading?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} />
      <AnswerGrid answers={copy.answers} />
      {children}
      {copy.modules.length > 0 ? (
        <ModuleGrid modules={copy.modules} heading={modulesHeading ?? 'What is inside'} />
      ) : null}
      {copy.showRiskLine ? (
        <div className="container-raptor pt-4">
          <RiskLine />
        </div>
      ) : null}
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </div>
  )
}
