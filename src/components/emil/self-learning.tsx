import { Panel } from '@/components/ui/panel'
import { EMIL_SHORT } from '@/lib/brand'
import { cn } from '@/lib/utils'

/**
 * "Learns by itself", stated as the four mechanisms rather than as a claim
 * about intelligence. The re-ranking table is the load-bearing visual: it
 * shows weights actually moving, including one collapsing because the
 * relationship stopped holding.
 */
const MECHANISMS = [
  {
    id: 'score',
    title: 'It scores its own inputs',
    body: `${EMIL_SHORT} tracks how well each input has been describing what subsequently happened. Informative inputs are weighted up; inputs that stop being informative are weighted down. Nobody edits a configuration file to make that happen.`,
  },
  {
    id: 'break',
    title: 'It notices when a relationship breaks',
    body: 'A correlation that held for six months and inverted last week is not averaged into a comfortable middle. Stability is tracked across sub-windows, and a broken relationship is treated as broken.',
  },
  {
    id: 'regime',
    title: 'It classifies the regime first',
    body: 'Trending, ranging, expanding, contracting. The same reading that is useful in one regime is useless in another, so the classification comes first and gates everything after it.',
  },
  {
    id: 'continuous',
    title: 'It re-ranks continuously',
    body: 'There is no quarterly retraining window during which the system is knowingly stale. Adaptation is the normal operating state, not a maintenance event.',
  },
] as const

const WEIGHTS = [
  { label: 'Session behaviour', before: 0.22, after: 0.41, note: 'more informative this month' },
  { label: 'Volatility regime', before: 0.34, after: 0.29, note: 'stable' },
  { label: 'Cross-asset correlation', before: 0.31, after: 0.11, note: 'relationship unstable 9d' },
  { label: 'Spread dynamics', before: 0.13, after: 0.19, note: 'improving' },
] as const

export function SelfLearning({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-10 lg:grid-cols-2 lg:items-start', className)}>
      <ol className="flex flex-col gap-6">
        {MECHANISMS.map((mechanism, index) => (
          <li key={mechanism.id} className="flex gap-4 border-t border-line-2 pt-5">
            <span className="mt-0.5 font-mono text-[0.75rem] text-steel-500" data-numeric>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-[1.0625rem] leading-snug text-steel-100">
                {mechanism.title}
              </h3>
              <p className="text-[0.9375rem] leading-relaxed text-steel-300">{mechanism.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-4">
        <Panel tone="raised" className="p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="text-eyebrow uppercase text-steel-500">Input weights, re-ranked</span>
            <span className="font-mono text-[0.6875rem] text-steel-500">Illustrative</span>
          </div>

          <ul className="mt-5 flex flex-col gap-4">
            {WEIGHTS.map((weight) => {
              const rose = weight.after >= weight.before
              return (
                <li key={weight.label} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 font-mono text-[0.75rem]">
                    <span className="text-steel-300">{weight.label}</span>
                    <span className="flex items-baseline gap-2">
                      <span className="text-steel-700 line-through" data-numeric>
                        {weight.before.toFixed(2)}
                      </span>
                      <span className={rose ? 'text-up' : 'text-down'} data-numeric>
                        {weight.after.toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <span className="h-1.5 overflow-hidden rounded-full bg-bg-3">
                    <span
                      className={cn('block h-full rounded-full', rose ? 'bg-signal/70' : 'bg-down/60')}
                      style={{ width: `${Math.round(weight.after * 100)}%` }}
                    />
                  </span>
                  <span className="font-mono text-[0.625rem] text-steel-500">{weight.note}</span>
                </li>
              )
            })}
          </ul>
        </Panel>

        <Panel className="p-6">
          <span className="text-eyebrow uppercase text-steel-500">Learning is not authority</span>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-300">
            Adaptation changes what {EMIL_SHORT} thinks. It never changes what {EMIL_SHORT} is
            allowed to do. Authority is a mandate you wrote and confirmed; enforcement happens
            outside the intelligence layer, in the risk engine, in the order path. So{' '}
            {EMIL_SHORT} can conclude that a larger position is warranted and still be refused by
            the exposure limit — and the refusal is logged.
          </p>
          <p className="mt-3 text-[0.875rem] leading-relaxed text-steel-500">
            Adaptation reduces the chance of acting on a dead relationship. It does not make a
            system right more often, and it does not remove market risk.
          </p>
        </Panel>
      </div>
    </div>
  )
}
