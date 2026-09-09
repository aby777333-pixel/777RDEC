'use client'

import { useEffect, useRef, useState } from 'react'
import type { Tick } from './priceEngine'
import type { WorkerRequest, WorkerResponse } from './priceEngine.worker'

export type TickMap = Readonly<Record<string, Tick>>

/**
 * Runs the price engine in a Web Worker and hands the UI thread a snapshot at
 * most once per animation frame. The worker ticks at 250ms; React never
 * re-renders more often than the display refreshes.
 *
 * `enabled` is driven by an IntersectionObserver at the call site so an
 * off-screen hero stops doing work.
 */
export function usePriceFeed(symbols: readonly string[], seed: number, enabled = true) {
  const [ticks, setTicks] = useState<TickMap>({})
  const pending = useRef<Record<string, Tick>>({})
  const frame = useRef<number | null>(null)
  const symbolKey = symbols.join(',')

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || typeof Worker === 'undefined') return

    const worker = new Worker(new URL('./priceEngine.worker.ts', import.meta.url))

    const flush = () => {
      frame.current = null
      if (Object.keys(pending.current).length === 0) return
      const batch = pending.current
      pending.current = {}
      setTicks((previous) => ({ ...previous, ...batch }))
    }

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type !== 'ticks') return
      for (const tick of event.data.ticks) pending.current[tick.symbol] = tick
      if (frame.current === null) frame.current = window.requestAnimationFrame(flush)
    }

    const start: WorkerRequest = { type: 'start', seed, symbols: symbolKey.split(',') }
    worker.postMessage(start)

    return () => {
      const stop: WorkerRequest = { type: 'stop' }
      worker.postMessage(stop)
      worker.terminate()
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
      frame.current = null
      pending.current = {}
    }
  }, [symbolKey, seed, enabled])

  return ticks
}

/** Pauses work while the element is off-screen (§9 performance rule). */
export function useInViewport<T extends Element>(ref: React.RefObject<T>, initial = false) {
  const [inView, setInView] = useState(initial)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setInView(entry.isIntersecting)
      },
      { rootMargin: '120px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return inView
}
