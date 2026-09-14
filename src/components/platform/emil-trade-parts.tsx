import { Panel } from '@/components/ui/panel'
import { Chip } from '@/components/ui/chip'
import {
  EMIL_TRADE_AUTHORITY,
  EMIL_TRADE_BUILD_STEPS,
  EMIL_TRADE_FIGURES,
} from '@/lib/copy/emil-trade'
import { cn } from '@/lib/utils'

/**
 * The three pieces of `/platform/emil-trade` that are a shape rather than a
 * list. Everything else on that page is <SpecGroups>. Content lives in
 * `@/lib/copy/emil-trade`; these only lay it out.
 */

/** The platform's own counts, as a strip under the hero. */
export function EmilTradeFigures({ className }: { className?: string }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line-2 bg-line-2 sm:grid-cols-3 lg:grid-cols-6',
        className,
      )}
    >
      {EMIL_TRADE_FIGURES.map((figure) => (
        <div key={figure.label} className="flex flex-col gap-2 bg-bg-1 px-5 py-6">
          <dt className="text-eyebrow uppercase text-steel-500">{figure.label}</dt>
          <dd className="font-display text-[2rem] leading-none text-steel-100" data-numeric>
            {figure.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Four levels of authority, left to right from none to full. Only the last can
 * reach the market by itself, and the badge says so rather than the colour
 * alone.
 */
export function AuthorityLadder({ className }: { className?: string }) {
  return (
    <ol className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {EMIL_TRADE_AUTHORITY.map((step, index) => (
        <li key={step.label} className="flex">
          <Panel tintIndex={index} className="flex w-full flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="tint-ink font-mono text-[0.75rem] font-medium" data-numeric>
                Level {step.level}
              </span>
              {step.acts ? (
                <Chip tone="armed" dot>
                  Acts when armed
                </Chip>
              ) : (
                <Chip tone="steel">Places nothing</Chip>
              )}
            </div>
            <h3 className="font-display text-[1.375rem] leading-snug text-steel-100">{step.label}</h3>
            <p className="text-[0.9375rem] leading-relaxed text-steel-300">{step.body}</p>
          </Panel>
        </li>
      ))}
    </ol>
  )
}

/** From a file or an idea to a strategy on the chart you can trade from. */
export function BuildSteps({ className }: { className?: string }) {
  return (
    <ol className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {EMIL_TRADE_BUILD_STEPS.map((step, index) => (
        <li key={step.title} className="flex">
          <Panel tintIndex={index} className="flex w-full flex-col gap-3 p-6">
            <span className="tint-ink font-mono text-[0.75rem] font-medium" data-numeric>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-[1.1875rem] leading-snug text-steel-100">{step.title}</h3>
            <p className="text-[0.9375rem] leading-relaxed text-steel-300">{step.body}</p>
          </Panel>
        </li>
      ))}
    </ol>
  )
}
