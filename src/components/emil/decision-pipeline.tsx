import { EMIL_SHORT } from '@/lib/brand'
import { Panel } from '@/components/ui/panel'
import { cn } from '@/lib/utils'

/**
 * The twenty-nine steps a trade has to survive, and the forty agents that
 * argue about it.
 *
 * Both are the application's own. The Control Cockpit shows the pipeline as a
 * single numbered rail with the current candidate's position marked on it, and
 * the council as seven groups that add up to forty. The only thing added here
 * is the grouping of the rail into six phases, because twenty-nine chips in a
 * row is a list and six phases is an argument.
 *
 * The number that matters is where execution sits: step twenty-five. Sizing,
 * risk, the council, the risk engine, the guardian, the permission engine and
 * the broker's own pre-trade checks all happen while there is still no order.
 *
 * Two step names have had a figure removed. The app calls them "0.01 Minimum
 * Risk Validation" and "0.05 Aggregate Exposure Validation" — the minimum lot
 * it will size to, and the aggregate above which raising exposure needs the
 * full override workflow on the risk page. Both are settings in the active
 * risk profile rather than properties of the software, so the steps are named
 * for what they check instead of for one profile's values.
 */

type Phase = {
  label: string
  blurb: string
  steps: readonly string[]
}

const PHASES: readonly Phase[] = [
  {
    label: 'Read the market',
    blurb: 'Before there is an opinion, there is data that has to check out.',
    steps: [
      'Market data validation',
      'Instrument normalisation',
      'Regime classification',
      'Multi-timeframe analysis',
      'Strategy eligibility',
      'Signal generation',
    ],
  },
  {
    label: 'Test the conditions',
    blurb: 'A good signal in the wrong conditions is still a bad trade.',
    steps: [
      'Volatility check',
      'Liquidity check',
      'News check',
      'Correlation check',
      'Portfolio exposure check',
    ],
  },
  {
    label: 'Size it',
    blurb: 'The stop comes first, and the size follows from it.',
    steps: [
      'Stop-loss calculation',
      'Monetary risk calculation',
      'Position size calculation',
      'Minimum risk validation',
      'Aggregate exposure validation',
      'Margin check',
    ],
  },
  {
    label: 'Argue it',
    blurb: 'Four separate reviews, and the last of them holds a veto.',
    steps: ['Agent council', 'Capital protection agent', 'Independent risk engine', 'Guardian'],
  },
  {
    label: 'Permit it',
    blurb: 'Permission, human confirmation where required, then the broker’s own checks.',
    steps: ['Permission engine', 'Confirmation layer', 'Broker pre-trade validation'],
  },
  {
    label: 'Send it, then live with it',
    blurb: 'Execution is step twenty-five of twenty-nine. Four of them come after.',
    steps: [
      'Execution',
      'Fill verification',
      'Live management',
      'Exit',
      'Post-trade analysis, memory and research learning',
    ],
  },
]

/** The council, as the app groups it. Seven groups, forty agents. */
const COUNCIL: readonly { label: string; count: number; blurb: string }[] = [
  { label: 'Market analysis', count: 8, blurb: 'Regime, volatility, liquidity, correlation, session' },
  { label: 'Strategy and signals', count: 8, blurb: 'One agent per approach, arguing its own case' },
  { label: 'Risk and capital protection', count: 6, blurb: 'Sizing, exposure, drawdown, protected capital' },
  { label: 'Execution and broker', count: 4, blurb: 'Spread, slippage, fills, venue behaviour' },
  { label: 'Learning and metacognition', count: 7, blurb: 'Scoring its own past calls and re-ranking inputs' },
  { label: 'Knowledge and teaching', count: 4, blurb: 'Explaining decisions in language, and being taught' },
  { label: 'Guardian layer', count: 3, blurb: 'Outside the council, holding the veto' },
]

const TOTAL = COUNCIL.reduce((sum, group) => sum + group.count, 0)

export function DecisionPipeline({ className }: { className?: string }) {
  let step = 0

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="grid gap-4 lg:grid-cols-3">
        {PHASES.map((phase, index) => (
          <Panel key={phase.label} tintIndex={index} className="flex flex-col gap-4 p-6">
            <div>
              <p className="text-eyebrow uppercase text-steel-500">{phase.label}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-steel-300">{phase.blurb}</p>
            </div>
            <ol className="flex flex-col">
              {phase.steps.map((name) => {
                step += 1
                const isExecution = name === 'Execution'
                return (
                  <li
                    key={name}
                    className="flex items-baseline gap-3 border-t border-line-2 py-2.5"
                  >
                    <span
                      className={cn(
                        'font-mono text-[0.6875rem] tabular-nums',
                        isExecution ? 'text-armed' : 'text-steel-500',
                      )}
                    >
                      {String(step).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'text-[0.9375rem] leading-snug',
                        isExecution ? 'text-steel-100' : 'text-steel-300',
                      )}
                    >
                      {name}
                    </span>
                  </li>
                )
              })}
            </ol>
          </Panel>
        ))}
      </div>

      <Panel tone="raised" size="panel" className="overflow-hidden">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line-1 px-6 py-4">
          <span className="font-display text-[1.125rem] uppercase tracking-tight text-steel-100">
            The council
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-500">
            {TOTAL} agents · {COUNCIL.length} groups · one veto
          </span>
        </div>
        <ul className="grid gap-px bg-line-1 sm:grid-cols-2 lg:grid-cols-4">
          {COUNCIL.map((group) => (
            <li key={group.label} className="flex flex-col gap-1.5 bg-bg-2 px-5 py-4">
              <span className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'font-mono text-[1.25rem] tabular-nums',
                    group.label === 'Guardian layer' ? 'text-armed' : 'text-signal',
                  )}
                >
                  {group.count}
                </span>
                <span className="text-[0.9375rem] leading-snug text-steel-100">{group.label}</span>
              </span>
              <span className="text-data leading-relaxed text-steel-500">{group.blurb}</span>
            </li>
          ))}
        </ul>
        <p className="border-t border-line-1 px-6 py-4 text-data text-steel-500">
          A decision is the position the council reaches, not the output of one model. The guardian
          layer sits outside it, and {EMIL_SHORT} cannot argue with a veto — there is no confidence
          score that overrides one.
        </p>
      </Panel>
    </div>
  )
}
