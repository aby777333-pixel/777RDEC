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
 * The questions that actually arrive, counted.
 *
 * Written for `/company/faq`, whose headline is that these are the questions
 * they actually get. So the band does not list questions — it counts them.
 * Marks arrive from the left, drop into the bin they belong to, and the bins
 * grow. The shape that builds is uneven, because the real distribution of what
 * people ask is uneven, and that unevenness is the page's whole claim.
 *
 * Arrivals are drawn from the shape rather than uniformly, so the tall bins get
 * taller: it is a count being taken, not a chart being filled in.
 *
 * **Pointer:** the bin nearest it opens. Its total separates back into the
 * individual marks that made it — a stack of short rules, one per arrival — so
 * a bin is visibly a count of things rather than a bar of a height.
 */

/** Bins, and how often a question arrives. */
const BINS = 11
const ARRIVE_EVERY = 0.32
/** The weight of each bin, which is how often it is the one that gets asked. */
const WEIGHTS = [0.16, 0.14, 0.13, 0.11, 0.1, 0.09, 0.07, 0.06, 0.05, 0.05, 0.04]

/** Seconds a mark takes to fall into its bin. */
const FALL_SECONDS = 0.7
/** Counts are scaled to this share of the band, so the tallest bin fits. */
const TALLEST = 0.44

/** The figure's box, as shares of the band. */
const LEFT = 0.56
const RIGHT = 0.97

type Mark = { bin: number; t: number; from: number }

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1
  let nextArrival = 0

  /** How many have landed in each bin, and the eased opening of each. */
  const counts = WEIGHTS.map((w) => Math.round(w * 40))
  const open = new Array(BINS).fill(0)
  const flying: Mark[] = []

  /** Pick a bin the way the questions actually come in: by weight. */
  const pick = () => {
    const total = WEIGHTS.reduce((a, b) => a + b, 0)
    let roll = Math.random() * total
    for (let i = 0; i < BINS; i++) {
      roll -= WEIGHTS[i]
      if (roll <= 0) return i
    }
    return BINS - 1
  }

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
      const base = height * 0.78
      const binWidth = (x1 - x0) / BINS
      const tallest = Math.max(...counts)
      const unit = (height * TALLEST) / Math.max(1, tallest)

      const binX = (i: number) => x0 + i * binWidth + binWidth * 0.5

      // ---- arrivals ----
      if (seconds > nextArrival) {
        nextArrival = seconds + ARRIVE_EVERY * (0.6 + Math.random() * 0.9)
        flying.push({ bin: pick(), t: 0, from: Math.random() })
      }
      for (let i = flying.length - 1; i >= 0; i--) {
        const mark = flying[i]
        mark.t += dt / FALL_SECONDS
        if (mark.t >= 1) {
          counts[mark.bin] += 1
          flying.splice(i, 1)
        }
      }
      // Once the count is high enough to crowd the band it is halved across the
      // board, which keeps the shape and loses the scale — the shape is the
      // claim, and an ever-growing bar would just leave the band.
      if (tallest > 90) for (let i = 0; i < BINS; i++) counts[i] = Math.round(counts[i] / 2)

      // ---- which bin is open ----
      let openIndex = -1
      if (pointerX >= x0 && pointerX <= x1 && pointerY > height * 0.1) {
        openIndex = Math.min(BINS - 1, Math.max(0, Math.floor((pointerX - x0) / binWidth)))
      }
      for (let i = 0; i < BINS; i++) {
        open[i] += ((i === openIndex ? 1 : 0) - open[i]) * Math.min(1, 7 * dt)
      }

      // ---- the baseline ----
      ctx.strokeStyle = rgba(steel, 0.2)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, base)
      ctx.lineTo(x1, base)
      ctx.stroke()

      // ---- the bins ----
      for (let i = 0; i < BINS; i++) {
        const tall = counts[i] * unit
        const on = open[i]
        const cx = binX(i)
        const w = binWidth * (0.46 + on * 0.2)

        if (on < 0.5) {
          // The count as one bar: filled lightly and topped with a rule, since
          // a solid bar at a hero's scale is a block of colour and the count
          // is the point rather than the mass.
          ctx.fillStyle = rgba(
            mixRgb(steel, signal, 0.25 + on * 0.4),
            (0.12 + on * 0.2) * (1 - on * 0.6),
          )
          ctx.fillRect(cx - w / 2, base - tall, w, tall)
          ctx.strokeStyle = rgba(mixRgb(steel, signal, 0.35), (0.4 + on * 0.3) * (1 - on * 0.6))
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.moveTo(cx - w / 2, base - tall)
          ctx.lineTo(cx + w / 2, base - tall)
          ctx.stroke()
        }
        if (on > 0.02) {
          // The same count as the marks that made it, separated.
          const rules = Math.min(counts[i], 46)
          const gap = tall / Math.max(1, rules)
          ctx.strokeStyle = rgba(signal, 0.5 * on)
          ctx.lineWidth = Math.max(1, gap * 0.45)
          ctx.beginPath()
          for (let k = 0; k < rules; k++) {
            const y = base - gap * (k + 0.5)
            ctx.moveTo(cx - w / 2, y)
            ctx.lineTo(cx + w / 2, y)
          }
          ctx.stroke()
        }

        // The bin's own tick on the baseline.
        ctx.strokeStyle = rgba(steel, 0.18 + on * 0.3)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx, base)
        ctx.lineTo(cx, base + 4 + on * 3)
        ctx.stroke()
      }

      // ---- marks still on their way in ----
      for (const mark of flying) {
        const target = binX(mark.bin)
        const landY = base - (counts[mark.bin] + 1) * unit
        const startX = x0 - width * 0.06
        const startY = height * (0.12 + mark.from * 0.2)
        const t = mark.t * mark.t * (3 - 2 * mark.t)
        const x = startX + (target - startX) * t
        // A shallow arc in, so an arrival has some travel to it.
        const y = startY + (landY - startY) * t - Math.sin(t * Math.PI) * height * 0.06

        const glow = ctx.createRadialGradient(x, y, 0, x, y, 14)
        glow.addColorStop(0, rgba(signal, 0.34))
        glow.addColorStop(1, rgba(signal, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, 14, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = rgba(signal, 0.85)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - 5, y)
        ctx.lineTo(x + 5, y)
        ctx.stroke()
      }
    },
    dispose() {
      untrack()
      flying.length = 0
    },
  }
}

export function TallyBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--tally', className)} aria-hidden />
}
