import { Panel } from '@/components/ui/panel'
import { EMIL_SHORT } from '@/lib/brand'
import { cn } from '@/lib/utils'

type Bucket = {
  id: string
  label: string
  amount: string
  share: number
  tone: 'protected' | 'profit' | 'working'
  detail: string
}

/** Illustrative figures, chosen to be recognisable rather than typical. */
const BUCKETS: readonly Bucket[] = [
  {
    id: 'protected',
    label: 'Protected',
    amount: '10,000',
    share: 70,
    tone: 'protected',
    detail: `Declared untouchable. ${EMIL_SHORT} may not put it at risk — an order that would draw on it is refused before it becomes an order.`,
  },
  {
    id: 'profit',
    label: 'Banked profit',
    amount: '2,841',
    share: 20,
    tone: 'profit',
    detail:
      'Gains moved above the profit floor. Once banked they join the protected side rather than funding larger positions.',
  },
  {
    id: 'working',
    label: 'Working',
    amount: '1,420',
    share: 10,
    tone: 'working',
    detail:
      'The portion actually deployed. Exposure limits, loss budgets and drawdown guards all measure against this.',
  },
]

const TONE_BAR: Record<Bucket['tone'], string> = {
  protected: 'bg-up',
  profit: 'bg-signal',
  working: 'bg-warn',
}

const TONE_TEXT: Record<Bucket['tone'], string> = {
  protected: 'text-up',
  profit: 'text-signal',
  working: 'text-warn',
}

/**
 * The capital architecture: an account as three buckets rather than one
 * number. This is the concrete answer to "how does it protect capital" —
 * boundaries enforced in the order path, not a promise about outcomes.
 */
export function CapitalArchitecture({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Panel tone="raised" size="panel" className="p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-eyebrow uppercase text-steel-500">Capital architecture</span>
          <span className="font-mono text-[0.75rem] text-steel-500">
            Illustrative · <span data-numeric>14,261</span> USD total
          </span>
        </div>

        {/* One stacked bar: the whole point is that the buckets are one account. */}
        <div
          className="mt-5 flex h-3 overflow-hidden rounded-full bg-bg-3"
          role="img"
          aria-label={`Account split: ${BUCKETS.map((b) => `${b.label} ${b.share} per cent`).join(', ')}.`}
        >
          {BUCKETS.map((bucket) => (
            <span
              key={bucket.id}
              className={cn('h-full first:rounded-l-full last:rounded-r-full', TONE_BAR[bucket.tone])}
              style={{ width: `${bucket.share}%` }}
            />
          ))}
        </div>

        <dl className="mt-7 grid gap-6 md:grid-cols-3">
          {BUCKETS.map((bucket) => (
            <div key={bucket.id} className="flex flex-col gap-2 border-t border-line-2 pt-4">
              <dt className="flex items-center gap-2">
                <span className={cn('h-1.5 w-1.5 rounded-full', TONE_BAR[bucket.tone])} aria-hidden />
                <span className="text-eyebrow uppercase text-steel-500">{bucket.label}</span>
              </dt>
              <dd className="flex flex-col gap-2">
                <span className={cn('font-mono text-[1.25rem]', TONE_TEXT[bucket.tone])} data-numeric>
                  {bucket.amount}
                  <span className="ml-1.5 text-[0.625rem] text-steel-500">USD</span>
                </span>
                <span className="text-[0.875rem] leading-relaxed text-steel-300">{bucket.detail}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 grid gap-4 border-t border-line-1 pt-6 sm:grid-cols-3">
          <Guard
            label="Profit floor"
            value="11,400"
            detail="Equity may not fall below this while armed. Ratchets up as profit is banked, never down."
          />
          <Guard
            label="Drawdown guard"
            value="8%"
            detail="Measured from the high-water mark, not from the start of the day. On breach EMIL disarms itself."
          />
          <Guard
            label="Daily loss budget"
            value="2%"
            detail="Consumed for the session and EMIL stops acting, while continuing to observe and log."
          />
        </div>
      </Panel>

      <p className="max-w-3xl text-[0.875rem] leading-relaxed text-steel-500">
        Three controls at three horizons, because a bad hour, a bad fortnight and a structural
        decline are different problems. All three are enforced in the order path, outside the
        intelligence layer, so nothing {EMIL_SHORT} concludes can widen them. None of it removes
        market risk: structure changes what automation can reach, not what the market can do.
      </p>
    </div>
  )
}

function Guard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-eyebrow uppercase text-steel-500">{label}</span>
      <span className="font-mono text-[1.0625rem] text-steel-100" data-numeric>
        {value}
      </span>
      <span className="text-[0.8125rem] leading-relaxed text-steel-500">{detail}</span>
    </div>
  )
}
