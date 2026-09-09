import { Activity, Brain, Gauge, Shield, Zap } from 'lucide-react'
import { EMIL_SHORT } from '@/lib/brand'
import { cn } from '@/lib/utils'

const TINT_CYCLE = ['tint-1', 'tint-2', 'tint-3', 'tint-4', 'tint-5', 'tint-6'] as const

type Pillar = {
  id: string
  label: string
  headline: string
  body: string
  Icon: typeof Activity
  visual: React.ReactNode
}

/** Five full-width modules, each with a live micro-visual (§6). */
export function EmilPillars() {
  return (
    <div className="flex flex-col">
      {PILLARS.map((pillar, index) => (
        <section
          key={pillar.id}
          className={cn('border-b border-line-1 py-16 md:py-20', index === 0 && 'border-t')}
        >
          <div className="container-raptor">
            <div
              className={cn(
                'grid gap-10 lg:grid-cols-2 lg:items-center',
                index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
              )}
            >
              <div className="flex flex-col gap-4">
                <div className={cn('flex items-center gap-3', TINT_CYCLE[index % TINT_CYCLE.length])}>
                  <pillar.Icon size={18} strokeWidth={1.5} aria-hidden className="tint-ink" />
                  <span className="tint-ink text-eyebrow uppercase">
                    {String(index + 1).padStart(2, '0')} · {pillar.label}
                  </span>
                </div>
                <h3 className="font-display text-[1.75rem] uppercase leading-tight tracking-tight text-steel-100 md:text-[2.25rem]">
                  {pillar.headline}
                </h3>
                <p className="max-w-xl text-body text-steel-300">{pillar.body}</p>
              </div>
              <div className="min-w-0 rounded-panel border border-line-2 bg-bg-1 p-6">{pillar.visual}</div>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

const PILLARS: readonly Pillar[] = [
  {
    id: 'observe',
    label: 'Observe',
    Icon: Activity,
    headline: 'It watches what you cannot watch continuously.',
    body: `${EMIL_SHORT} streams price, spread, volatility, session state, exposure and cross-asset relationships. Not to predict them — to notice when they change.`,
    visual: <StreamVisual />,
  },
  {
    id: 'understand',
    label: 'Understand',
    Icon: Brain,
    headline: 'Conditions, stated as a reading.',
    body: 'Trending, ranging, expanding, contracting. A classification of what is happening now, with the inputs that produced it, and an explicit note when confidence is low.',
    visual: <RegimeVisual />,
  },
  {
    id: 'adapt',
    label: 'Adapt',
    Icon: Gauge,
    headline: 'A stale relationship stops driving the reading.',
    body: 'Input weighting is re-ranked as conditions change. A correlation that held for six months and broke last week is weighted as broken, not as history.',
    visual: <WeightsVisual />,
  },
  {
    id: 'protect',
    label: 'Protect',
    Icon: Shield,
    headline: 'The boundary is enforced outside the strategy.',
    body: 'Exposure limits, concentration limits and drawdown guards are evaluated in the order path. Nothing inside the intelligence layer can widen them.',
    visual: <BoundaryVisual />,
  },
  {
    id: 'act',
    label: 'Act',
    Icon: Zap,
    headline: 'Only through the permissions gate.',
    body: `Only inside a mandate you wrote and confirmed by typing ${'ARM'}, only with the trading permissions you granted, and only while armed. Every action passes the same pre-trade checks as an order you place yourself.`,
    visual: <GateVisual />,
  },
]

function StreamVisual() {
  const inputs = [
    { label: 'price · EURUSD', fill: 0.82 },
    { label: 'spread · XAUUSD', fill: 0.44 },
    { label: 'volatility · NAS100', fill: 0.66 },
    { label: 'exposure · account', fill: 0.31 },
    { label: 'session · London', fill: 0.94 },
  ]
  return (
    <div className="flex flex-col gap-2.5" aria-hidden>
      {inputs.map((input) => (
        <div key={input.label} className="flex items-center gap-3">
          <span className="w-[9.5rem] shrink-0 font-mono text-[0.6875rem] text-steel-500">
            {input.label}
          </span>
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-bg-3">
            <span
              className="block h-full rounded-full bg-signal/60"
              style={{ width: `${input.fill * 100}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

function RegimeVisual() {
  const states = ['Trending', 'Ranging', 'Expanding', 'Contracting'] as const
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {states.map((state, index) => (
        <div
          key={state}
          className={cn(
            'flex items-center justify-between rounded-card border px-4 py-3 font-mono text-[0.75rem]',
            index === 1 ? 'border-signal/50 bg-signal/[0.08] text-steel-100' : 'border-line-2 text-steel-500',
          )}
        >
          <span>{state}</span>
          <span data-numeric>{[0.18, 0.61, 0.14, 0.07][index]?.toFixed(2)}</span>
        </div>
      ))}
      <p className="mt-1 font-mono text-[0.625rem] text-steel-500">
        Illustrative classification weights.
      </p>
    </div>
  )
}

function WeightsVisual() {
  const weights = [
    { label: 'Session behaviour', before: 0.22, after: 0.41 },
    { label: 'Volatility regime', before: 0.34, after: 0.29 },
    { label: 'Cross-asset correlation', before: 0.31, after: 0.11 },
    { label: 'Spread dynamics', before: 0.13, after: 0.19 },
  ]
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {weights.map((weight) => (
        <div key={weight.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between font-mono text-[0.6875rem]">
            <span className="text-steel-500">{weight.label}</span>
            <span className="flex items-baseline gap-2">
              <span className="text-steel-700 line-through" data-numeric>
                {weight.before.toFixed(2)}
              </span>
              <span
                className={weight.after >= weight.before ? 'text-up' : 'text-down'}
                data-numeric
              >
                {weight.after.toFixed(2)}
              </span>
            </span>
          </div>
          <span className="h-1 overflow-hidden rounded-full bg-bg-3">
            <span
              className="block h-full rounded-full bg-signal/60"
              style={{ width: `${weight.after * 100}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

function BoundaryVisual() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="relative h-40 rounded-card border border-line-2 bg-bg-2 p-3">
        <span className="absolute inset-3 rounded-[6px] border border-dashed border-warn/50" />
        <span className="absolute left-3 top-1 bg-bg-1 px-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-warn">
          Mandate boundary
        </span>
        <span
          className="absolute h-2 w-2 rounded-full bg-signal"
          style={{ left: '38%', top: '48%' }}
        />
        <span
          className="absolute h-2 w-2 rounded-full bg-signal"
          style={{ left: '62%', top: '31%' }}
        />
        <span
          className="absolute h-2 w-2 rounded-full border border-down bg-transparent"
          style={{ left: '86%', top: '72%' }}
        />
      </div>
      <p className="font-mono text-[0.625rem] leading-relaxed text-steel-500">
        Two positions inside the boundary. One request outside it, refused before it became an
        order.
      </p>
    </div>
  )
}

function GateVisual() {
  const checks = [
    { label: 'Mandate active', pass: true },
    { label: 'Instrument in scope', pass: true },
    { label: 'Trading permission granted', pass: true },
    { label: 'Exposure within limit', pass: true },
    { label: 'Concentration limit', pass: false },
  ]
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {checks.map((check) => (
        <div
          key={check.label}
          className="flex items-center justify-between rounded-card border border-line-2 px-4 py-2.5 font-mono text-[0.75rem]"
        >
          <span className="text-steel-300">{check.label}</span>
          <span className={check.pass ? 'text-up' : 'text-down'}>
            {check.pass ? 'PASS' : 'REFUSE'}
          </span>
        </div>
      ))}
      <p className="mt-1 font-mono text-[0.625rem] leading-relaxed text-steel-500">
        One refusal stops the order. The reason is logged and shown, never swallowed.
      </p>
    </div>
  )
}
