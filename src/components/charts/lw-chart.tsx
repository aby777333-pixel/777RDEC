'use client'

import { useEffect, useRef } from 'react'
import {
  ColorType,
  createChart,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { useTheme } from 'next-themes'

export type ChartPoint = { time: number; value: number }

function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value.length > 0 ? value : fallback
}

/**
 * Lightweight Charts wrapper. Real charts, never screenshots (§3 imagery rule).
 * Re-reads the palette from CSS variables whenever the theme changes.
 */
export function LwChart({
  data,
  latest,
  height = 160,
  label,
  summary,
  tone = 'signal',
}: {
  data: readonly ChartPoint[]
  latest?: ChartPoint | null
  height?: number
  label: string
  summary: string
  tone?: 'signal' | 'up' | 'down'
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const { resolvedTheme } = useTheme()

  // Create once.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: readToken('--steel-500', '#8A8F98'),
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: readToken('--line-1', 'rgba(255,255,255,0.06)'), style: LineStyle.Solid },
      },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.18, bottom: 0.08 } },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { horzLine: { visible: false }, vertLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    })

    const series = chart.addAreaSeries({
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    chartRef.current = chart
    seriesRef.current = series

    const resize = () => chart.applyOptions({ width: container.clientWidth })
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    return () => {
      observer.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [height])

  // Re-theme without recreating the chart.
  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (!chart || !series) return

    const line = readToken(tone === 'signal' ? '--signal' : tone === 'up' ? '--up' : '--down', '#7DD3FC')
    chart.applyOptions({
      layout: { textColor: readToken('--steel-500', '#8A8F98') },
      grid: { horzLines: { color: readToken('--line-1', 'rgba(255,255,255,0.06)') } },
    })
    series.applyOptions({
      lineColor: line,
      topColor: `color-mix(in srgb, ${line} 26%, transparent)`,
      bottomColor: `color-mix(in srgb, ${line} 2%, transparent)`,
    })
  }, [resolvedTheme, tone])

  // Full history replacement.
  useEffect(() => {
    const series = seriesRef.current
    if (!series || data.length === 0) return
    series.setData(data.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })))
    chartRef.current?.timeScale().fitContent()
  }, [data])

  // Streaming updates.
  useEffect(() => {
    const series = seriesRef.current
    if (!series || !latest) return
    series.update({ time: latest.time as UTCTimestamp, value: latest.value })
  }, [latest])

  return (
    <div className="relative w-full" role="img" aria-label={`${label}. ${summary}`}>
      <div ref={containerRef} className="w-full" style={{ height }} />
      <p className="sr-only">{summary}</p>
    </div>
  )
}
