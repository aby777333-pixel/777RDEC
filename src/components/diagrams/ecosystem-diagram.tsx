'use client'

import { useState } from 'react'
import { EMIL_SHORT } from '@/lib/brand'
import { cn } from '@/lib/utils'

type Tier = { id: string; label: string; detail: string; emilSpan: boolean }

const TIERS: readonly Tier[] = [
  { id: 'client', label: 'Client', detail: 'A trader, an institution, or a partner arriving at your brand.', emilSpan: false },
  { id: 'portal', label: 'Client Portal', detail: 'Registration, verification, funding and account management.', emilSpan: false },
  { id: 'crm', label: 'CRM & Back Office', detail: 'Owns the client record, the permissions and the operational workflow.', emilSpan: true },
  { id: 'execution', label: 'Trading & Execution Infrastructure', detail: 'Order management, the risk engine in the order path, and position keeping.', emilSpan: true },
  { id: 'market', label: 'Global Market & Liquidity Connectivity', detail: 'Market data handlers and provider sessions, isolated per venue.', emilSpan: true },
]

/**
 * The ecosystem flow. Reused on the homepage and /technology/architecture.
 * EMIL is drawn as a translucent band spanning the lower three tiers — it
 * observes them, it does not sit above them.
 */
export function EcosystemDiagram({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className={cn('relative', className)}>
      <div className="relative grid gap-3 lg:grid-cols-[1fr_11rem]">
        <ol className="flex flex-col gap-3">
          {TIERS.map((tier, index) => (
            <li key={tier.id} className="relative">
              {index > 0 ? <Connector /> : null}
              <button
                type="button"
                onMouseEnter={() => setActive(tier.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(tier.id)}
                onBlur={() => setActive(null)}
                aria-describedby={`tier-detail-${tier.id}`}
                className={cn(
                  'w-full rounded-card border bg-bg-1 px-5 py-4 text-left transition-all duration-200 ease-raptor',
                  active === tier.id ? 'border-signal/60 bg-bg-2' : 'border-line-2',
                )}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-[1rem] uppercase tracking-tight text-steel-100">
                    {tier.label}
                  </span>
                  <span className="font-mono text-[0.625rem] text-steel-500" data-numeric>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p
                  id={`tier-detail-${tier.id}`}
                  className={cn(
                    'mt-1 text-[0.8125rem] leading-snug transition-colors duration-200',
                    active === tier.id ? 'text-steel-300' : 'text-steel-500',
                  )}
                >
                  {tier.detail}
                </p>
              </button>
            </li>
          ))}
        </ol>

        <div className="relative hidden lg:block">
          <div className="absolute inset-x-0 bottom-0 top-[calc(50%-1.25rem)] rounded-card border border-signal/30 bg-signal/[0.06]">
            <div className="sticky top-1/2 flex flex-col items-center gap-2 px-3 py-6 text-center">
              <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-signal opacity-40 motion-safe:animate-pulse-signal" />
                <span className="h-1 w-1 rounded-full bg-signal" />
              </span>
              <span className="font-display text-[0.875rem] uppercase tracking-tight text-signal">
                {EMIL_SHORT}
              </span>
              <span className="text-[0.6875rem] leading-snug text-steel-500">
                Observes the lower tiers. No privileged path to market.
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[0.8125rem] text-steel-500 lg:hidden">
        {EMIL_SHORT} observes the CRM, execution and connectivity tiers. Anything it proposes passes
        the same risk checks as a human order.
      </p>
    </div>
  )
}

/** Animated particle travelling the connector between tiers. */
function Connector() {
  return (
    <div className="relative mx-auto -mt-3 mb-0 h-3 w-px bg-line-2" aria-hidden>
      <span className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-signal opacity-60 motion-safe:animate-pulse-signal" />
    </div>
  )
}
