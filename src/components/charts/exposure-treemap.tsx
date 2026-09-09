'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Node = { label: string; value: number; children?: readonly Node[] }

/** Illustrative book shape: asset class → instrument, in notional USD. */
const BOOK: readonly Node[] = [
  {
    label: 'FX',
    value: 486_000,
    children: [
      { label: 'EURUSD', value: 214_000 },
      { label: 'GBPUSD', value: 148_000 },
      { label: 'USDJPY', value: 124_000 },
    ],
  },
  {
    label: 'Metals',
    value: 312_000,
    children: [
      { label: 'XAUUSD', value: 246_000 },
      { label: 'XAGUSD', value: 66_000 },
    ],
  },
  {
    label: 'Indices',
    value: 198_000,
    children: [
      { label: 'NAS100', value: 132_000 },
      { label: 'US30', value: 66_000 },
    ],
  },
  { label: 'Energy', value: 84_000, children: [{ label: 'WTIUSD', value: 84_000 }] },
  { label: 'Crypto', value: 62_000, children: [{ label: 'BTCUSD', value: 62_000 }] },
]

const TOTAL = BOOK.reduce((sum, node) => sum + node.value, 0)

export function ExposureTreemap({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        className="flex h-56 gap-1"
        role="img"
        aria-label={`Exposure by asset class. ${BOOK.map((n) => `${n.label} ${Math.round((n.value / TOTAL) * 100)} per cent`).join(', ')}.`}
      >
        {BOOK.map((node) => (
          <div
            key={node.label}
            className="flex flex-col gap-1"
            style={{ flexGrow: node.value, flexBasis: 0 }}
            onMouseEnter={() => setActive(node.label)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-1">
              {(node.children ?? [node]).map((child) => (
                <div
                  key={child.label}
                  style={{ flexGrow: child.value, flexBasis: 0 }}
                  className={cn(
                    'flex min-h-0 flex-col justify-end overflow-hidden rounded-[4px] border px-2 py-1.5 transition-colors duration-200',
                    active === node.label
                      ? 'border-signal/50 bg-signal/[0.1]'
                      : 'border-line-2 bg-bg-2',
                  )}
                >
                  <span className="truncate font-mono text-[0.625rem] text-steel-300">
                    {child.label}
                  </span>
                  <span className="truncate font-mono text-[0.5625rem] text-steel-500" data-numeric>
                    {(child.value / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
            <span
              className={cn(
                'truncate text-center text-[0.625rem] uppercase tracking-[0.1em] transition-colors duration-200',
                active === node.label ? 'text-steel-100' : 'text-steel-500',
              )}
            >
              {node.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[0.75rem] text-steel-500">
        Illustrative notional exposure, {(TOTAL / 1000).toFixed(0)}k USD total. Simulated book.
      </p>
    </div>
  )
}
