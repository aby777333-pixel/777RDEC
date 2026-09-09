'use client'

import { formatPrice, type Instrument } from '@/lib/sim/instruments'
import type { Tick } from '@/lib/sim/priceEngine'
import { createRng } from '@/lib/utils'
import { cn } from '@/lib/utils'

const LEVELS = 5

/**
 * Aggregated book. Sizes are derived from the tick so the ladder moves with
 * price rather than animating independently of it.
 */
export function DepthLadder({
  instrument,
  tick,
  className,
}: {
  instrument: Instrument
  tick: Tick | undefined
  className?: string
}) {
  const mid = tick?.mid ?? instrument.base
  const step = instrument.spread * 1.6
  const rng = createRng(Math.floor(mid * 1000))

  const asks = Array.from({ length: LEVELS }, (_, i) => ({
    price: mid + instrument.spread / 2 + step * i,
    size: 0.4 + rng() * 3.6,
  })).reverse()

  const bids = Array.from({ length: LEVELS }, (_, i) => ({
    price: mid - instrument.spread / 2 - step * i,
    size: 0.4 + rng() * 3.6,
  }))

  const maxSize = Math.max(...asks.map((a) => a.size), ...bids.map((b) => b.size))

  return (
    <div
      className={cn('flex flex-col gap-px font-mono text-[0.6875rem]', className)}
      role="img"
      aria-label={`${instrument.symbol} market depth, five levels each side around ${formatPrice(mid, instrument.digits)}`}
    >
      {asks.map((level, i) => (
        <Row
          key={`ask-${i}`}
          price={formatPrice(level.price, instrument.digits)}
          size={level.size}
          fill={level.size / maxSize}
          side="ask"
        />
      ))}
      <div className="my-1 flex items-center justify-between border-y border-line-2 px-2 py-1">
        <span className="text-[0.625rem] uppercase tracking-[0.14em] text-steel-500">Spread</span>
        <span className="text-steel-300" data-numeric>
          {formatPrice(instrument.spread, instrument.digits)}
        </span>
      </div>
      {bids.map((level, i) => (
        <Row
          key={`bid-${i}`}
          price={formatPrice(level.price, instrument.digits)}
          size={level.size}
          fill={level.size / maxSize}
          side="bid"
        />
      ))}
    </div>
  )
}

function Row({
  price,
  size,
  fill,
  side,
}: {
  price: string
  size: number
  fill: number
  side: 'bid' | 'ask'
}) {
  return (
    <div className="relative flex items-center justify-between px-2 py-[3px]">
      <span
        aria-hidden
        className={cn('absolute inset-y-0 opacity-[0.14]', side === 'ask' ? 'right-0 bg-down' : 'right-0 bg-up')}
        style={{ width: `${Math.round(fill * 100)}%` }}
      />
      <span className={cn('relative', side === 'ask' ? 'text-down' : 'text-up')} data-numeric>
        {price}
      </span>
      <span className="relative text-steel-500" data-numeric>
        {size.toFixed(2)}
      </span>
    </div>
  )
}
