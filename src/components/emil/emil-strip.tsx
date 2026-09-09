'use client'

import { useEffect, useState } from 'react'
import { EMIL_SHORT } from '@/lib/brand'
import { createRng } from '@/lib/utils'

const OBSERVATIONS = [
  'Observing 4 instruments · spread stable',
  'Volatility: normal · session London',
  'Exposure 0.7 lots · 8% of mandate',
  'Correlation cluster: XAUUSD / EURUSD',
  'Regime: EURUSD trending → ranging',
  'Feed latency 42ms · within tolerance',
] as const

/**
 * The thin intelligence strip along the bottom of the terminal. It pulses at
 * irregular intervals — a system that is watching, not a progress bar.
 */
export function EmilStrip({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) return
    const rng = createRng(4242)
    let timer: ReturnType<typeof setTimeout>

    const schedule = () => {
      // Irregular cadence: 2.4s–6.0s.
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % OBSERVATIONS.length)
        schedule()
      }, 2400 + rng() * 3600)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [active])

  return (
    <div className="flex items-center gap-3 border-t border-line-1 bg-bg-2 px-4 py-2">
      <span className="relative flex h-2 w-2 shrink-0 items-center justify-center" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-signal opacity-30 motion-safe:animate-pulse-signal" />
        <span className="h-1 w-1 rounded-full bg-signal" />
      </span>
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-signal">
        {EMIL_SHORT}
      </span>
      <span className="h-3 w-px bg-line-2" aria-hidden />
      <p
        key={index}
        aria-live="polite"
        className="truncate font-mono text-[0.625rem] text-steel-500 motion-safe:animate-ticker-in"
      >
        {OBSERVATIONS[index]}
      </p>
      <span className="ml-auto hidden shrink-0 rounded-full border border-line-2 px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-500 sm:inline">
        Disarmed
      </span>
    </div>
  )
}
