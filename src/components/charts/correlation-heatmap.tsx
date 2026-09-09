'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'XAGUSD', 'NAS100', 'WTIUSD', 'BTCUSD'] as const

/**
 * Illustrative 8×8 correlation matrix. Values are fixed and plausible rather
 * than computed from a live feed — the footnote says so, because a
 * correlation figure a visitor could mistake for a live reading would be
 * misleading.
 */
const MATRIX: readonly (readonly number[])[] = [
  [1.0, 0.82, -0.44, 0.36, 0.31, 0.18, 0.12, 0.21],
  [0.82, 1.0, -0.38, 0.29, 0.26, 0.22, 0.14, 0.19],
  [-0.44, -0.38, 1.0, -0.52, -0.41, 0.24, 0.08, -0.11],
  [0.36, 0.29, -0.52, 1.0, 0.78, -0.16, 0.22, 0.28],
  [0.31, 0.26, -0.41, 0.78, 1.0, -0.09, 0.26, 0.31],
  [0.18, 0.22, 0.24, -0.16, -0.09, 1.0, 0.19, 0.54],
  [0.12, 0.14, 0.08, 0.22, 0.26, 0.19, 1.0, 0.16],
  [0.21, 0.19, -0.11, 0.28, 0.31, 0.54, 0.16, 1.0],
]

export function CorrelationHeatmap({ className }: { className?: string }) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="scroll-steel w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse font-mono text-[0.6875rem]">
          <caption className="sr-only">
            Illustrative correlation matrix across eight instruments. Values range from minus one to
            one. Hovering a row dims unrelated cells.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-20 px-2 py-2">
                <span className="sr-only">Instrument</span>
              </th>
              {SYMBOLS.map((symbol) => (
                <th
                  key={symbol}
                  scope="col"
                  className="px-1 py-2 text-[0.5625rem] font-normal uppercase tracking-[0.1em] text-steel-500"
                >
                  {symbol.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            onMouseLeave={() => setHoveredRow(null)}
            onBlur={() => setHoveredRow(null)}
          >
            {MATRIX.map((row, rowIndex) => (
              <tr
                key={SYMBOLS[rowIndex]}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onFocus={() => setHoveredRow(rowIndex)}
                tabIndex={0}
                className="focus-visible:outline-none"
              >
                <th
                  scope="row"
                  className={cn(
                    'px-2 py-1 text-right text-[0.625rem] font-normal uppercase tracking-[0.08em] transition-colors duration-200',
                    hoveredRow === rowIndex ? 'text-steel-100' : 'text-steel-500',
                  )}
                >
                  {SYMBOLS[rowIndex]}
                </th>
                {row.map((value, columnIndex) => (
                  <Cell
                    key={columnIndex}
                    value={value}
                    dimmed={hoveredRow !== null && hoveredRow !== rowIndex}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[0.8125rem] leading-relaxed text-steel-500">
        Values are illustrative and fixed for this page, not a live reading. Correlation describes how
        two instruments have moved together over a chosen window. It is not causation, and a
        relationship that held last month may not hold today.
      </p>
    </div>
  )
}

function Cell({ value, dimmed }: { value: number; dimmed: boolean }) {
  const magnitude = Math.min(Math.abs(value), 1)
  const isSelf = value === 1
  // One accent: positive uses the signal blue, negative uses the down red.
  const colour = value >= 0 ? 'var(--signal)' : 'var(--down)'

  return (
    <td className="p-[2px]">
      <div
        className={cn(
          'flex h-8 items-center justify-center rounded-[3px] transition-opacity duration-200',
          dimmed ? 'opacity-25' : 'opacity-100',
        )}
        style={{
          backgroundColor: isSelf
            ? 'var(--bg-3)'
            : `color-mix(in srgb, ${colour} ${Math.round(magnitude * 62)}%, transparent)`,
        }}
      >
        <span className={cn(isSelf ? 'text-steel-500' : 'text-steel-100')} data-numeric>
          {isSelf ? '—' : value.toFixed(2)}
        </span>
      </div>
    </td>
  )
}
