'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PriceEngine } from './priceEngine'
import type { ChartPoint } from '@/components/charts/lw-chart'
import type { Tick } from './priceEngine'

const BUCKET_SECONDS = 60
const TICKS_PER_BUCKET = Math.round(BUCKET_SECONDS / PriceEngine.secondsPerTick)

/**
 * Keeps a rolling line series per symbol. History is generated locally so a
 * chart opens with context; streaming ticks then extend it on our own clock,
 * which keeps the time axis monotonic regardless of worker start-up timing.
 */
export function useRollingSeries(
  symbol: string,
  tick: Tick | undefined,
  seed: number,
  historyLength = 90,
) {
  const history = useMemo<ChartPoint[]>(() => {
    const engine = new PriceEngine(seed)
    return engine
      .seedHistory(symbol, historyLength, BUCKET_SECONDS)
      .map((candle) => ({ time: candle.time, value: candle.close }))
  }, [symbol, seed, historyLength])

  const [latest, setLatest] = useState<ChartPoint | null>(null)
  const bucketRef = useRef({ time: 0, count: 0 })

  useEffect(() => {
    bucketRef.current = { time: history[history.length - 1]?.time ?? 0, count: 0 }
    setLatest(null)
  }, [history])

  useEffect(() => {
    if (!tick) return
    const bucket = bucketRef.current
    if (bucket.time === 0) return

    bucket.count += 1
    if (bucket.count >= TICKS_PER_BUCKET) {
      bucket.count = 0
      bucket.time += BUCKET_SECONDS
    }
    setLatest({ time: bucket.time, value: tick.mid })
  }, [tick])

  return { history, latest }
}
