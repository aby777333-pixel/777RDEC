import { ButtonLink } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import { INDIGENOUS_MODULES, MODULES_SECTION } from '@/lib/copy/modules'
import { cn } from '@/lib/utils'

/**
 * The twenty modules, as a dense grid.
 *
 * Literal class names rather than a template, so they survive Tailwind's
 * content scan — the same reason <Panel> writes its tints out longhand.
 */
const HUES = ['hue-1', 'hue-2', 'hue-3', 'hue-4', 'hue-5', 'hue-6'] as const

/**
 * `section` is the homepage placement: it carries its own heading and links on
 * to the modules page. `page` is that page itself, where the hero already
 * states both and linking here would point at the current route.
 */
export function IndigenousModules({ variant = 'section' }: { variant?: 'section' | 'page' }) {
  const isSection = variant === 'section'

  return (
    <Section className="border-b border-line-1">
      {/*
        The heading renders in both variants. On the page the hero already
        carries the eyebrow and the lead, so only the title repeats — but it
        has to stay, or the module <h3>s follow the page <h1> with no <h2>
        between them and axe's heading-order rule fails.
      */}
      <SectionHeader
        align={isSection ? 'center' : 'left'}
        eyebrow={isSection ? MODULES_SECTION.eyebrow : undefined}
        title={MODULES_SECTION.heading}
        lead={isSection ? MODULES_SECTION.lead : undefined}
      />

      <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {INDIGENOUS_MODULES.map((module) => (
          <li key={module.name} className="flex">
            <Panel
              interactive
              className={cn('flex w-full flex-col gap-1.5 p-5', HUES[module.hue - 1])}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="tint-dot mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full"
                  aria-hidden
                />
                <h3 className="font-display text-[0.9375rem] font-medium leading-snug text-steel-100">
                  {module.name}
                </h3>
              </div>
              <p className="pl-[1rem] text-[0.8125rem] leading-relaxed text-steel-300">
                {module.blurb}
              </p>
            </Panel>
          </li>
        ))}
      </ul>

      {isSection ? (
        <div className="mt-10 flex justify-center">
          <ButtonLink href={MODULES_SECTION.link.href} variant="ghost" size="sm">
            {MODULES_SECTION.link.label}
          </ButtonLink>
        </div>
      ) : null}
    </Section>
  )
}
