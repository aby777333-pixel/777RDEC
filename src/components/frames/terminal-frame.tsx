'use client'

import { useRef } from 'react'
import { LwChart } from '@/components/charts/lw-chart'
import { DepthLadder } from '@/components/charts/depth-ladder'
import { EmilStrip } from '@/components/emil/emil-strip'
import { INSTRUMENT_MAP, formatPrice } from '@/lib/sim/instruments'
import { usePriceFeed, useInViewport } from '@/lib/sim/use-price-feed'
import { useRollingSeries } from '@/lib/sim/use-rolling-series'
import type { Tick } from '@/lib/sim/priceEngine'
import { cn } from '@/lib/utils'

const HERO_SYMBOLS = ['EURUSD', 'XAUUSD', 'NAS100', 'BTCUSD'] as const

type Position = { symbol: string; side: 'Buy' | 'Sell'; lots: number; entry: number }

const POSITIONS: readonly Position[] = [
  { symbol: 'EURUSD', side: 'Buy', lots: 0.4, entry: 1.0842 },
  { symbol: 'XAUUSD', side: 'Buy', lots: 0.1, entry: 4402.18 },
  { symbol: 'NAS100', side: 'Sell', lots: 0.2, entry: 17798.4 },
]

/**
 * The product, recreated as live components. Never a screenshot (§3).
 * Feeds itself from the seeded price engine and pauses when off-screen.
 */
export function TerminalFrame({ seed = 7770, className }: { seed?: number; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInViewport(rootRef)
  const ticks = usePriceFeed(HERO_SYMBOLS, seed, inView)

  return (
    <div
      ref={rootRef}
      className={cn(
        'overflow-hidden rounded-panel border border-line-2 bg-bg-1 shadow-panel',
        className,
      )}
    >
      <FrameChrome />

      <div className="grid gap-px bg-line-1 lg:grid-cols-[1fr_13rem]">
        <div className="grid gap-px bg-line-1 sm:grid-cols-2">
          {HERO_SYMBOLS.map((symbol) => (
            <ChartCell key={symbol} symbol={symbol} tick={ticks[symbol]} seed={seed} />
          ))}
        </div>

        <div className="flex flex-col gap-px bg-line-1">
          <div className="bg-bg-1 px-3 py-2.5">
            <p className="text-[0.625rem] uppercase tracking-[0.16em] text-steel-500">Depth · EURUSD</p>
          </div>
          <div className="flex-1 bg-bg-1 pb-2">
            {INSTRUMENT_MAP.get('EURUSD') ? (
              <DepthLadder instrument={INSTRUMENT_MAP.get('EURUSD')!} tick={ticks['EURUSD']} />
            ) : null}
          </div>
        </div>
      </div>

      <PositionsPanel ticks={ticks} />
      <EmilStrip active={inView} />
    </div>
  )
}

function FrameChrome() {
  return (
    <div className="flex items-center justify-between border-b border-line-1 bg-bg-2 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-500">
          Raptor Terminal
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-up" aria-hidden />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel-500">
            Feed healthy
          </span>
        </span>
      </div>
      <span className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel-500">
        Simulated
      </span>
    </div>
  )
}

function ChartCell({ symbol, tick, seed }: { symbol: string; tick: Tick | undefined; seed: number }) {
  const instrument = INSTRUMENT_MAP.get(symbol)
  const { history, latest } = useRollingSeries(symbol, tick, seed)
  if (!instrument) return null

  const price = tick?.mid ?? instrument.base
  const change = price - instrument.base
  const changePct = (change / instrument.base) * 100
  const up = change >= 0

  return (
    <div className="bg-bg-1 pb-1">
      <div className="flex items-baseline justify-between px-3 pb-1 pt-2.5">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-steel-300">
          {instrument.symbol}
        </span>
        <span className="flex items-baseline gap-2 font-mono text-[0.6875rem]">
          <span className="text-steel-100" data-numeric>
            {formatPrice(price, instrument.digits)}
          </span>
          <span className={up ? 'text-up' : 'text-down'} data-numeric>
            {up ? '+' : ''}
            {changePct.toFixed(2)}%
          </span>
        </span>
      </div>
      <LwChart
        data={history}
        latest={latest}
        height={112}
        tone={up ? 'up' : 'down'}
        label={`${instrument.name} price chart`}
        summary={`${instrument.symbol} simulated at ${formatPrice(price, instrument.digits)}, ${changePct.toFixed(2)} per cent from the session anchor.`}
      />
    </div>
  )
}

function PositionsPanel({ ticks }: { ticks: Readonly<Record<string, Tick>> }) {
  const rows = POSITIONS.map((position) => {
    const instrument = INSTRUMENT_MAP.get(position.symbol)
    const price = ticks[position.symbol]?.mid ?? instrument?.base ?? position.entry
    const direction = position.side === 'Buy' ? 1 : -1
    // Display-only P&L. Contract-size modelling belongs in the platform.
    const pnl = (price - position.entry) * direction * position.lots * 100
    return { ...position, price, pnl, digits: instrument?.digits ?? 2 }
  })

  const total = rows.reduce((sum, row) => sum + row.pnl, 0)

  return (
    <div className="border-t border-line-1 bg-bg-1">
      <div className="flex items-center justify-between border-b border-line-1 px-4 py-2">
        <span className="text-[0.625rem] uppercase tracking-[0.16em] text-steel-500">
          Open positions
        </span>
        <span className="flex items-baseline gap-2 font-mono text-[0.6875rem]">
          <span className="text-steel-500">Floating</span>
          <span className={total >= 0 ? 'text-up' : 'text-down'} data-numeric>
            {total >= 0 ? '+' : '−'}
            {Math.abs(total).toFixed(2)} USD
          </span>
        </span>
      </div>
      <table className="w-full font-mono text-[0.6875rem]">
        <caption className="sr-only">
          Simulated open positions with floating profit and loss
        </caption>
        <thead>
          <tr className="text-[0.5625rem] uppercase tracking-[0.14em] text-steel-500">
            <th scope="col" className="px-4 py-1.5 text-left font-normal">Symbol</th>
            <th scope="col" className="px-2 py-1.5 text-left font-normal">Side</th>
            <th scope="col" className="px-2 py-1.5 text-right font-normal">Lots</th>
            <th scope="col" className="px-2 py-1.5 text-right font-normal">Entry</th>
            <th scope="col" className="px-4 py-1.5 text-right font-normal">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className="border-t border-line-1">
              <td className="px-4 py-1.5 text-steel-300">{row.symbol}</td>
              <td className={cn('px-2 py-1.5', row.side === 'Buy' ? 'text-up' : 'text-down')}>
                {row.side}
              </td>
              <td className="px-2 py-1.5 text-right text-steel-300" data-numeric>
                {row.lots.toFixed(2)}
              </td>
              <td className="px-2 py-1.5 text-right text-steel-500" data-numeric>
                {formatPrice(row.entry, row.digits)}
              </td>
              <td
                className={cn('px-4 py-1.5 text-right', row.pnl >= 0 ? 'text-up' : 'text-down')}
                data-numeric
              >
                {row.pnl >= 0 ? '+' : '−'}
                {Math.abs(row.pnl).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
