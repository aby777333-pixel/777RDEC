'use client'

import { cn } from '@/lib/utils'
import {
  type BackdropScene,
  mixRgb,
  rgba,
  tokenRgb,
  trackPointer,
  useBackdropCanvas,
} from './use-backdrop-canvas'

/**
 * Three words, as three instruments.
 *
 * Written for `/company/about`, which takes the three words off the logo and
 * says what they have to mean in practice: the numbers must be right, the
 * system must hold at the open, and the surface must be fast enough that a
 * trader stops noticing it. Those are three measurable things, so the band
 * measures them — and each panel is the instrument that particular claim would
 * actually be judged on, not a dial with a needle in it.
 *
 * - **Precision** is an estimate converging: samples landing around a target
 *   with the error bracket closing in on it.
 * - **Power** is a step response: a load applied all at once, and a line that
 *   takes it and stays flat instead of sagging.
 * - **Performance** is a latency distribution: a histogram whose tail has to
 *   stay short, because the tail is what a trader notices.
 *
 * **Pointer:** it picks a panel. The nearest one takes most of the band and
 * runs at full weight while the other two shrink aside, so one claim can be
 * looked at properly. Untouched, the three take turns.
 */

/** Seconds each panel holds the band when nothing is pointing. */
const TURN_SECONDS = 4.6
/** Samples kept by the precision panel, and how often one lands. */
const SAMPLES = 34
const SAMPLE_EVERY = 0.22
/** Bars in the latency histogram. */
const BARS = 16

/** The figure's box, as shares of the band. */
const LEFT = 0.5
const RIGHT = 0.97
const TOP = 0.2
const BOTTOM = 0.8

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const up = tokenRgb(host, '--up', [52, 211, 153])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1
  /** Eased share of the band each panel has. */
  const share = [1 / 3, 1 / 3, 1 / 3]
  let turn = 0
  let nextTurn = TURN_SECONDS

  /** Precision: samples in -1..1, and the estimate's error, shrinking. */
  const samples: number[] = []
  let nextSample = 0
  let error = 1

  /** Power: the step's age, and the line's sag, which recovers. */
  let stepAge = 0
  let sag = 0

  /** Performance: a latency histogram, re-sampled slowly. */
  const bars = new Array(BARS).fill(0).map((_, i) => {
    // A right-skewed shape, because latency is.
    const t = i / (BARS - 1)
    return Math.exp(-((t - 0.18) ** 2) / 0.02) * 0.9 + Math.exp(-((t - 0.5) ** 2) / 0.12) * 0.12
  })

  const untrack = trackPointer(
    host,
    (nx, ny) => {
      pointerX = nx * width
      pointerY = ny * height
    },
    () => {
      pointerX = -1
      pointerY = -1
    },
  )

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : Math.min(0.05, seconds - last)
      last = seconds

      ctx.clearRect(0, 0, width, height)

      const x0 = width * LEFT
      const x1 = width * RIGHT
      const top = height * TOP
      const bottom = height * BOTTOM
      const panelHeight = bottom - top

      // ---- which panel has the band ----
      let held = -1
      if (pointerX >= x0 - width * 0.04 && pointerY > top - 40 && pointerY < bottom + 40) {
        held = Math.min(2, Math.max(0, Math.floor(((pointerX - x0) / (x1 - x0)) * 3)))
        nextTurn = seconds + TURN_SECONDS
      } else if (seconds > nextTurn) {
        nextTurn = seconds + TURN_SECONDS
        turn = (turn + 1) % 3
      }
      const focus = held >= 0 ? held : turn
      for (let i = 0; i < 3; i++) {
        const wanted = i === focus ? 0.54 : 0.23
        share[i] += (wanted - share[i]) * Math.min(1, 4 * dt)
      }
      const total = share[0] + share[1] + share[2]
      const bounds = (i: number) => {
        let start = x0
        for (let k = 0; k < i; k++) start += ((x1 - x0) * share[k]) / total
        return { a: start + 8, b: start + ((x1 - x0) * share[i]) / total - 8 }
      }

      // ---- precision ----
      if (seconds > nextSample) {
        nextSample = seconds + SAMPLE_EVERY
        samples.push((Math.random() - 0.5) * 2 * error)
        if (samples.length > SAMPLES) samples.shift()
        // The estimate tightens, then a fresh series starts: an instrument
        // that only ever improves is not measuring anything.
        error = error > 0.1 ? error * 0.9 : 1
      }
      {
        const { a, b } = bounds(0)
        const cy = (top + bottom) / 2
        const strength = share[0] * 1.6
        // The target.
        ctx.strokeStyle = rgba(steel, 0.16 + strength * 0.14)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(a, cy)
        ctx.lineTo(b, cy)
        ctx.stroke()

        // The samples, oldest at the left.
        for (let i = 0; i < samples.length; i++) {
          const x = a + ((b - a) * i) / (SAMPLES - 1)
          const y = cy - samples[i] * panelHeight * 0.34
          const recent = i / Math.max(1, samples.length - 1)
          ctx.fillStyle = rgba(mixRgb(steel, signal, recent), 0.2 + recent * 0.55 * strength)
          ctx.beginPath()
          ctx.arc(x, y, 1.6 + recent * 1.2, 0, Math.PI * 2)
          ctx.fill()
        }

        // The bracket: how wide the estimate currently is.
        const reach = error * panelHeight * 0.34
        ctx.strokeStyle = rgba(signal, 0.2 + strength * 0.3)
        ctx.lineWidth = 1.3
        for (const side of [-1, 1]) {
          ctx.beginPath()
          ctx.moveTo(b - 14, cy + side * reach)
          ctx.lineTo(b, cy + side * reach)
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.moveTo(b, cy - reach)
        ctx.lineTo(b, cy + reach)
        ctx.stroke()
      }

      // ---- power ----
      stepAge += dt
      if (stepAge > 5.5) stepAge = 0
      {
        const { a, b } = bounds(1)
        const strength = share[1] * 1.6
        const base = bottom - panelHeight * 0.22
        const lifted = top + panelHeight * 0.22
        const stepAt = a + (b - a) * 0.34

        // The load, applied all at once.
        ctx.strokeStyle = rgba(steel, 0.16 + strength * 0.12)
        ctx.lineWidth = 1.2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(a, base)
        ctx.lineTo(stepAt, base)
        ctx.lineTo(stepAt, lifted)
        ctx.lineTo(b, lifted)
        ctx.stroke()
        ctx.setLineDash([])

        // What it does under that load: a small sag, recovered, then flat.
        const since = Math.max(0, stepAge - 1.2)
        sag = Math.exp(-since * 2.4) * Math.cos(since * 9) * (since < 1.6 ? 1 : 0)
        ctx.strokeStyle = rgba(mixRgb(signal, up, 0.35), 0.36 + strength * 0.4)
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.moveTo(a, base)
        const crossed = stepAge > 1.2
        ctx.lineTo(crossed ? stepAt : a + (stepAt - a) * (stepAge / 1.2), base)
        if (crossed) {
          const steps = 40
          for (let i = 0; i <= steps; i++) {
            const t = i / steps
            const x = stepAt + (b - stepAt) * t
            if (x > a + (b - a) * Math.min(1, 0.34 + since * 0.42)) break
            const settle = Math.exp(-t * 5) * sag * panelHeight * 0.12
            ctx.lineTo(x, lifted + settle)
          }
        }
        ctx.stroke()
      }

      // ---- performance ----
      {
        const { a, b } = bounds(2)
        const strength = share[2] * 1.6
        const base = bottom - panelHeight * 0.1
        const barWidth = (b - a) / BARS
        for (let i = 0; i < BARS; i++) {
          // The distribution breathes, and the tail is what is watched.
          const breathe = 1 + Math.sin(seconds * 1.1 + i * 0.7) * 0.08
          const value = bars[i] * breathe
          const tall = value * panelHeight * 0.62
          const tail = i / (BARS - 1) > 0.55
          ctx.fillStyle = rgba(
            tail ? mixRgb(steel, signal, 0.3) : signal,
            (tail ? 0.2 : 0.3) + strength * 0.3,
          )
          ctx.fillRect(a + i * barWidth + barWidth * 0.16, base - tall, barWidth * 0.68, tall)
        }
        // Where the tail must stay inside.
        const limit = a + (b - a) * 0.78
        ctx.strokeStyle = rgba(steel, 0.24 + strength * 0.2)
        ctx.lineWidth = 1.2
        ctx.setLineDash([3, 4])
        ctx.beginPath()
        ctx.moveTo(limit, base - panelHeight * 0.66)
        ctx.lineTo(limit, base)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // ---- the panel in hand, marked ----
      const { a, b } = bounds(focus)
      ctx.strokeStyle = rgba(signal, 0.16)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(a, bottom + 10)
      ctx.lineTo(b, bottom + 10)
      ctx.stroke()
    },
    dispose() {
      untrack()
      samples.length = 0
    },
  }
}

export function InstrumentsBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--instruments', className)} aria-hidden />
  )
}
