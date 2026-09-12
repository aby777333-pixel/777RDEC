import { Panel } from '@/components/ui/panel'
import { cn } from '@/lib/utils'

/**
 * The nine breakers, and what each one does when it trips.
 *
 * Taken from the Risk Management surface, where every breaker shows three
 * things at once: what it is watching, the limit it is watching against, and
 * the action it will take. Eight stop automation. One — the open-position
 * count — only raises an alert, because hitting the cap means no new entries
 * rather than something having gone wrong.
 *
 * The limits themselves are the operator's risk profile and are not reproduced
 * here. What is worth publishing is the list, the actions, and the thing the
 * surface says underneath: a trip stops automation and touches nothing that is
 * already open.
 */

type Breaker = {
  label: string
  watching: string
  /** What the surface says it does on trip. */
  action: 'Stops automation' | 'Alert only'
}

const BREAKERS: readonly Breaker[] = [
  {
    label: 'Daily loss limit',
    watching: 'Today’s realised and floating loss against a share of the balance',
    action: 'Stops automation',
  },
  {
    label: 'Weekly loss limit',
    watching: 'The same measure over the week, against its own budget',
    action: 'Stops automation',
  },
  {
    label: 'Drawdown from high-water mark',
    watching: 'Equity below the account’s own high-water mark, not below the session open',
    action: 'Stops automation',
  },
  {
    label: 'Margin utilisation',
    watching: 'Margin used as a share of equity',
    action: 'Stops automation',
  },
  {
    label: 'Open positions',
    watching: 'The count against the profile maximum — at the cap, no new entries',
    action: 'Alert only',
  },
  {
    label: 'Consecutive losses',
    watching: 'Closed trades newest first, until the first winner',
    action: 'Stops automation',
  },
  {
    label: 'High-impact news window',
    watching: 'A window either side of a scheduled high-impact event',
    action: 'Stops automation',
  },
  {
    label: 'Broker connection',
    watching: 'Whether the venue link is up, and its latency',
    action: 'Stops automation',
  },
  {
    label: 'Market-data health',
    watching: 'Whether the primary quote feed is healthy, including its rate budget',
    action: 'Stops automation',
  },
]

export function CircuitBreakers({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Panel tone="raised" size="panel" className="overflow-hidden">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line-1 px-6 py-4">
          <span className="font-display text-[1.125rem] uppercase tracking-tight text-steel-100">
            Circuit breakers
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-500">
            {BREAKERS.length} · each with its action declared in advance
          </span>
        </div>

        <ul className="grid gap-px bg-line-1 sm:grid-cols-2 lg:grid-cols-3">
          {BREAKERS.map((breaker) => (
            <li key={breaker.label} className="flex flex-col gap-2 bg-bg-2 px-5 py-4">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[0.9375rem] leading-snug text-steel-100">
                  {breaker.label}
                </span>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em]',
                    breaker.action === 'Alert only'
                      ? 'border-line-2 text-steel-500'
                      : 'border-warn/40 text-warn',
                  )}
                >
                  {breaker.action}
                </span>
              </span>
              <span className="text-data leading-relaxed text-steel-500">{breaker.watching}</span>
            </li>
          ))}
        </ul>

        <p className="border-t border-line-1 px-6 py-4 text-data text-steel-500">
          A tripped breaker stops automation and nothing else — open positions and broker-side stops
          are untouched. The trip is written to a history with the event that caused it, and
          re-arming goes back through activation with the acknowledgements again.
        </p>
      </Panel>
    </div>
  )
}
