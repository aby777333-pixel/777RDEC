import { Panel } from '@/components/ui/panel'
import { cn } from '@/lib/utils'

/**
 * What a strategy has to walk before it is allowed near live money.
 *
 * Two rails from two surfaces, in the order they actually happen. The Strategy
 * Lab is the twelve stages a candidate passes through before a person looks at
 * it; the Strategy Center is the five-stage promotion it then has to earn, in
 * which a challenger only replaces a champion by beating it across regimes in
 * paper and restricted live.
 *
 * The sentence that matters is on both surfaces and is repeated here: a
 * backtest is not proof of future profitability, and nothing gains live
 * permission automatically.
 */

/** The lab's own twelve stages, in its own order. */
const LAB: readonly string[] = [
  'Learned idea',
  'Structured rules',
  'Data validation',
  'Backtest',
  'Out-of-sample',
  'Walk-forward',
  'Stress',
  'Regime',
  'Risk',
  'Score',
  'Paper',
  'Human review',
]

/** Then the five promotion stages, which are gates rather than steps. */
const PROMOTION: readonly { label: string; note: string }[] = [
  { label: 'Research', note: 'An idea with rules, not yet a candidate' },
  { label: 'Backtest', note: 'Measured, and never sufficient on its own' },
  { label: 'Paper', note: 'Forward, on live conditions, with no money at risk' },
  { label: 'Restricted live', note: 'Real, and deliberately small' },
  { label: 'Production', note: 'Champion, until a challenger beats it' },
]

export function PromotionPipeline({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Panel tintIndex={0} className="p-6">
        <p className="text-eyebrow uppercase text-steel-500">
          In the lab · {LAB.length} stages before a person looks
        </p>
        <ol className="mt-4 flex flex-wrap gap-2">
          {LAB.map((stage, index) => (
            <li
              key={stage}
              className="flex items-baseline gap-2 rounded-ui border border-line-2 bg-bg-1 px-3 py-2"
            >
              <span className="font-mono text-[0.625rem] tabular-nums text-steel-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-[0.875rem] leading-none text-steel-300">{stage}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-data leading-relaxed text-steel-500">
          A candidate missing a rule is marked incomplete and the missing rule is named. It is not
          filled in by guesswork, and the run does not proceed as though it had been.
        </p>
      </Panel>

      <Panel tone="raised" size="panel" className="overflow-hidden">
        <div className="border-b border-line-1 px-6 py-4">
          <span className="font-display text-[1.125rem] uppercase tracking-tight text-steel-100">
            Then promotion has to be earned
          </span>
        </div>
        <ol className="grid gap-px bg-line-1 sm:grid-cols-2 lg:grid-cols-5">
          {PROMOTION.map((stage, index) => (
            <li key={stage.label} className="flex flex-col gap-2 bg-bg-2 px-5 py-4">
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-[0.625rem] tabular-nums text-signal">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[0.9375rem] leading-snug text-steel-100">{stage.label}</span>
              </span>
              <span className="text-data leading-relaxed text-steel-500">{stage.note}</span>
            </li>
          ))}
        </ol>
        <p className="border-t border-line-1 px-6 py-4 text-data text-steel-500">
          A challenger replaces a champion only after outperforming it across regimes in paper and
          restricted-live evaluation — never on backtest results alone, and never automatically. A
          strategy that degrades is downgraded, its live sizing halved, then suspended from new
          entries.
        </p>
      </Panel>
    </div>
  )
}
