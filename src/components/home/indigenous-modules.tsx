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

export function IndigenousModules() {
  return (
    <Section className="border-b border-line-1">
      <SectionHeader
        align="center"
        eyebrow={MODULES_SECTION.eyebrow}
        title={MODULES_SECTION.heading}
        lead={MODULES_SECTION.lead}
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
    </Section>
  )
}
