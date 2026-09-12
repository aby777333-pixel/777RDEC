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
 * A price series, and the things watching it.
 *
 * Written for `/intelligence`, whose argument is that price tells you what
 * happened and context tells you what is happening. So the band is both: a
 * series scrolling along the lower right, and above it a row of observers,
 * each holding a sight-line down onto the moment it is currently reading.
 * The sight-lines carry different weights and the weights move, because that
 * is the honest picture — attention is distributed and it shifts.
 *
 * Left alone, each observer holds its own stretch of the band and drifts
 * slowly within it, which is what a rack of live monitors looks like: the data
 * flows through the place being watched rather than the watcher chasing it.
 *
 * **Pointer:** it is the moment under examination. Every observer swings its
 * sight-line onto wherever you are along the series and the spread between
 * them collapses, so the whole field converges on one point and that point
 * lights. Take the pointer away and they wander apart again — the gap the page
 * is about, made into something you can close with your hand.
 */

/** Samples held, and how often a new one arrives. */
const SAMPLES = 96
const SAMPLE_SECONDS = 0.16

/** The observers above the series. */
const OBSERVERS = 7

/** Focus spread between observers, in samples: wandering, and converged. */
const SPREAD_IDLE = 13
const SPREAD_HELD = 1.1
/** How fast focus and convergence ease. */
const FOCUS_EASE = 4.5
const CONVERGE_EASE = 3.2

/** The box the series is drawn in, as shares of the band. */
const SERIES_LEFT = 0.4
const SERIES_RIGHT = 1.0
const SERIES_MID_Y = 0.66
const SERIES_HEIGHT = 0.4

/** Where the observers sit, as a share of the band's height. */
const OBSERVER_Y = 0.18

type Observer = {
  /** Its own place along the row, 0..1. */
  slot: number
  /** Where it is looking, as a floating sample index. */
  focus: number
  /** Where it would like to look when nothing is pointing. */
  home: number
  weight: number
  seed: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let last = -1
  /** Sub-sample scroll offset, 0..1. */
  let phase = 0
  /** 0 wandering, 1 converged on the pointer. */
  let converged = 0
  let held = 0

  // A mean-reverting walk: a straight random walk leaves the band, and a sine
  // is not a market.
  const series: number[] = []
  let level = 0.5
  for (let i = 0; i < SAMPLES; i++) {
    level += (0.5 - level) * 0.03 + (Math.random() - 0.5) * 0.09
    series.push(Math.min(1, Math.max(0, level)))
  }

  const observers: Observer[] = Array.from({ length: OBSERVERS }, (_, i) => ({
    slot: i / (OBSERVERS - 1),
    focus: (0.1 + (i / (OBSERVERS - 1)) * 0.8) * SAMPLES,
    // Its own stretch of the band, so the sight-lines fan out instead of
    // crossing each other into a scribble.
    home: (0.1 + (i / (OBSERVERS - 1)) * 0.8) * SAMPLES,
    weight: 0.5,
    seed: Math.random(),
  }))

  const untrack = trackPointer(
    host,
    (nx) => {
      pointerX = nx * width
    },
    () => {
      pointerX = -1
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

      const x0 = width * SERIES_LEFT
      const x1 = width * SERIES_RIGHT
      const step = (x1 - x0) / (SAMPLES - 1)
      const midY = height * SERIES_MID_Y
      const span = height * SERIES_HEIGHT
      const observerY = height * OBSERVER_Y

      /** Screen position of a floating sample index. */
      const at = (index: number) => {
        const i = Math.min(SAMPLES - 1, Math.max(0, index))
        const lo = Math.floor(i)
        const hi = Math.min(SAMPLES - 1, lo + 1)
        const value = series[lo] + (series[hi] - series[lo]) * (i - lo)
        return { x: x0 + (i - phase) * step, y: midY - (value - 0.5) * span }
      }

      // ---- scroll ----
      phase += dt / SAMPLE_SECONDS
      while (phase >= 1) {
        phase -= 1
        series.shift()
        level += (0.5 - level) * 0.03 + (Math.random() - 0.5) * 0.09
        level = Math.min(1, Math.max(0, level))
        series.push(level)
      }

      // ---- what the field is looking at ----
      const pointing = pointerX >= x0 - step * 2
      held += ((pointing ? 1 : 0) - held) * Math.min(1, 8 * dt)
      converged += ((pointing ? 1 : 0) - converged) * Math.min(1, CONVERGE_EASE * dt)
      const aim = pointing
        ? Math.min(SAMPLES - 1, Math.max(0, (pointerX - x0) / step + phase))
        : 0
      const spread = SPREAD_IDLE + (SPREAD_HELD - SPREAD_IDLE) * converged

      for (const o of observers) {
        // Wandering: its own home, on its own period. Converged: the pointer's
        // moment, with what is left of the spread folded in.
        const wander = o.home + Math.sin(seconds * 0.4 + o.seed * 7) * 5
        const centre = wander + (aim - wander) * converged
        const target = centre + (o.slot - 0.5) * spread
        o.focus += (target - o.focus) * Math.min(1, FOCUS_EASE * dt)

        // Weight breathes while wandering; once converged, the observers in
        // the middle of the row are the ones carrying the moment.
        const beat = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(seconds * 0.9 + o.seed * 11))
        const near = 1 - Math.min(1, Math.abs(o.slot - 0.5) * 1.6)
        o.weight = beat + (0.35 + near * 0.6 - beat) * converged
      }

      // ---- the series ----
      ctx.lineJoin = 'round'
      ctx.strokeStyle = rgba(steel, 0.36)
      ctx.lineWidth = 1.4
      ctx.beginPath()
      for (let i = 0; i < SAMPLES; i++) {
        const p = at(i)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()

      // The baseline, so the series has something to be a deviation from.
      ctx.strokeStyle = rgba(steel, 0.12)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, midY)
      ctx.lineTo(x1, midY)
      ctx.stroke()

      // ---- sight-lines, and the stretch each one is reading ----
      for (const o of observers) {
        const eye = { x: width * (0.42 + o.slot * 0.52), y: observerY }
        const look = at(o.focus)

        const colour = mixRgb(steel, signal, 0.35 + o.weight * 0.5)
        const grad = ctx.createLinearGradient(eye.x, eye.y, look.x, look.y)
        grad.addColorStop(0, rgba(colour, 0.05 + o.weight * 0.1))
        grad.addColorStop(1, rgba(colour, 0.18 + o.weight * 0.5))
        ctx.strokeStyle = grad
        ctx.lineWidth = 0.7 + o.weight * 1.5
        ctx.beginPath()
        ctx.moveTo(eye.x, eye.y)
        ctx.lineTo(look.x, look.y)
        ctx.stroke()

        ctx.strokeStyle = rgba(signal, 0.25 + o.weight * 0.55)
        ctx.lineWidth = 1.8 + o.weight * 1.4
        ctx.beginPath()
        for (let k = -2; k <= 2; k++) {
          const p = at(o.focus + k)
          if (k === -2) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()

        // The observer itself is a square, because it is an instrument.
        const size = 3 + o.weight * 3
        ctx.strokeStyle = rgba(mixRgb(steel, signal, o.weight), 0.35 + o.weight * 0.5)
        ctx.lineWidth = 1.2
        ctx.strokeRect(eye.x - size / 2, eye.y - size / 2, size, size)
        if (o.weight > 0.6) {
          const halo = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, 16)
          halo.addColorStop(0, rgba(signal, (o.weight - 0.6) * 0.5))
          halo.addColorStop(1, rgba(signal, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(eye.x, eye.y, 16, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // ---- the moment under examination ----
      if (held > 0.02) {
        const p = at(aim)
        ctx.strokeStyle = rgba(signal, 0.22 * held)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(p.x, observerY)
        ctx.lineTo(p.x, midY + span * 0.5)
        ctx.stroke()

        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 28)
        halo.addColorStop(0, rgba(signal, 0.42 * held))
        halo.addColorStop(1, rgba(signal, 0))
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, 28, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = rgba(signal, 0.95 * held)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    dispose() {
      untrack()
      series.length = 0
      observers.length = 0
    },
  }
}

export function AttentionBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--attention', className)} aria-hidden />
  )
}
