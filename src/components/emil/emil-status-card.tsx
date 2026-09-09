'use client'

import { useEffect, useState } from 'react'
import { EMIL_SHORT } from '@/lib/brand'
import { Panel } from '@/components/ui/panel'
import { cn } from '@/lib/utils'

const STREAM = [
  'price · EURUSD',
  'volatility · XAUUSD',
  'exposure · account',
  'session · London',
  'spread · NAS100',
  'correlation · cluster',
] as const

/**
 * The minimal status card that "wakes up" on the homepage: DISARMED, observing.
 * A card that shows a system paying attention, not a system promising returns.
 */
export function EmilStatusCard({ awake, className }: { awake: boolean; className?: string }) {
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    if (!awake) return
    const timer = setInterval(() => setCursor((c) => c + 1), 1100)
    return () => clearInterval(timer)
  }, [awake])

  return (
    <Panel tone="glass" size="panel" className={cn('overflow-hidden p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center" aria-hidden>
            {awake ? (
              <span className="absolute inset-0 rounded-full bg-signal opacity-30 motion-safe:animate-pulse-signal" />
            ) : null}
            <span className={cn('h-1.5 w-1.5 rounded-full', awake ? 'bg-signal' : 'bg-steel-700')} />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-[1.125rem] uppercase tracking-tight text-steel-100">
              {EMIL_SHORT}
            </span>
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-steel-500">
              {awake ? 'Observing' : 'Standby'}
            </span>
          </div>
        </div>
        <span className="rounded-full border border-line-2 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel-500">
          Disarmed
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-1.5" aria-hidden>
        {STREAM.map((item, index) => {
          const lit = awake && (cursor + index) % STREAM.length < 3
          return (
            <div key={item} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'h-px flex-1 transition-colors duration-700',
                  lit ? 'bg-signal/45' : 'bg-line-1',
                )}
              />
              <span
                className={cn(
                  'w-[11rem] shrink-0 font-mono text-[0.625rem] transition-colors duration-700',
                  lit ? 'text-steel-300' : 'text-steel-700',
                )}
              >
                {item}
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-6 border-t border-line-1 pt-4 text-[0.8125rem] leading-relaxed text-steel-500">
        Observing does not mean acting. {EMIL_SHORT} cannot place, modify or close anything until you
        write a mandate and confirm it deliberately.
      </p>
    </Panel>
  )
}
