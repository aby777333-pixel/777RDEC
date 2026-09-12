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
 * What changed, and when.
 *
 * Written for `/company/news`, whose headline is exactly that. So the band is a
 * timeline with entries on it: a tick for when, and a rule whose length is how
 * much changed. A few carry a second mark because they were breaking changes,
 * which is the distinction that matters to anyone reading a change log rather
 * than a press release.
 *
 * New entries arrive at the right and everything older slides left, so the
 * spacing between them is real: a quiet fortnight leaves a visible gap.
 *
 * **Pointer:** it is a lens. Entries near it spread apart and open — the rule
 * lengthens into its parts, and the tick grows a scale — while the rest of the
 * line compresses to make room. That is what reading a timeline closely
 * actually does, and it is the interaction the page wants.
 */

/** Entries kept, and how often one arrives. */
const ENTRIES = 16
const ARRIVE_EVERY = 2.4
/** One entry in this many is a breaking change. */
const BREAKING_IN = 5

/** How strongly the lens spreads what is near it, and how wide it reaches. */
const LENS_STRENGTH = 0.22
const LENS_REACH = 0.22

/** The line, as shares of the band. */
const LEFT = 0.5
const RIGHT = 0.97

type Change = {
  /** Position along the line, 1 at the right, falling as it ages. */
  u: number
  /** How much changed, 0..1. */
  size: number
  breaking: boolean
  /** Eased opening under the lens. */
  open: number
  seed: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const warn = tokenRgb(host, '--warn', [251, 191, 36])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1
  let nextArrival = ARRIVE_EVERY

  const make = (u: number): Change => ({
    u,
    size: 0.25 + Math.random() * 0.75,
    breaking: Math.random() * BREAKING_IN < 1,
    open: 0,
    seed: Math.random(),
  })

  // Seeded with a history, unevenly spaced, because releases are.
  const changes: Change[] = []
  {
    let u = 1
    for (let i = 0; i < ENTRIES; i++) {
      changes.push(make(u))
      u -= 0.04 + Math.random() * 0.06
    }
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
      const span = x1 - x0
      const cy = height * 0.5

      // ---- arrivals ----
      if (seconds > nextArrival) {
        nextArrival = seconds + ARRIVE_EVERY * (0.6 + Math.random() * 0.9)
        changes.unshift(make(1.06))
        if (changes.length > ENTRIES) changes.pop()
      }
      // Everything ages leftward at one rate, so the gaps are the real thing.
      for (const change of changes) change.u -= dt * 0.013

      // ---- the lens ----
      const lensU = pointerX >= 0 ? (pointerX - x0) / span : -1
      const inBand = pointerY > cy - height * 0.36 && pointerY < cy + height * 0.36

      /** Where an entry sits once the lens has pushed it aside. */
      const place = (u: number) => {
        if (lensU < 0 || !inBand) return x0 + span * u
        const d = (u - lensU) / LENS_REACH
        if (Math.abs(d) > 1) return x0 + span * u + Math.sign(d) * span * LENS_STRENGTH * 0.5
        // Inside the lens the spacing is stretched; outside it is pushed out
        // by the fixed amount the stretch consumed, so nothing overlaps.
        const pushed = Math.sin((d * Math.PI) / 2)
        return x0 + span * u + pushed * span * LENS_STRENGTH * 0.5
      }

      // ---- the line ----
      ctx.strokeStyle = rgba(steel, 0.18)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, cy)
      ctx.lineTo(x1, cy)
      ctx.stroke()

      // ---- the entries ----
      for (let i = changes.length - 1; i >= 0; i--) {
        const change = changes[i]
        if (change.u < -0.1) continue
        const x = place(change.u)
        if (x < x0 - 20 || x > x1 + 20) continue

        const near =
          lensU < 0 || !inBand ? 0 : Math.max(0, 1 - Math.abs(change.u - lensU) / LENS_REACH)
        change.open += (near - change.open) * Math.min(1, 7 * dt)
        const open = change.open
        // The newest entry is the brightest; older ones settle back.
        const fresh = Math.max(0, 1 - (1.06 - change.u) / 0.12)

        // The tick: when.
        const tickUp = 5 + open * 5
        ctx.strokeStyle = rgba(mixRgb(steel, signal, Math.max(fresh, open)), 0.3 + open * 0.45)
        ctx.lineWidth = 1.2 + open * 0.8
        ctx.beginPath()
        ctx.moveTo(x, cy - tickUp)
        ctx.lineTo(x, cy + tickUp)
        ctx.stroke()

        // The rule: how much. It rises above the line, so more change is a
        // taller mark and the line stays readable.
        const tall = (8 + change.size * height * 0.22) * (1 + open * 0.5)
        ctx.strokeStyle = rgba(
          change.breaking ? warn : mixRgb(steel, signal, 0.4 + fresh * 0.4),
          0.26 + open * 0.4 + fresh * 0.2,
        )
        ctx.lineWidth = 2 + open * 1.4
        ctx.beginPath()
        ctx.moveTo(x, cy - tickUp)
        ctx.lineTo(x, cy - tickUp - tall)
        ctx.stroke()

        // A breaking change carries a second mark across its rule.
        if (change.breaking) {
          ctx.lineWidth = 1.3
          ctx.beginPath()
          ctx.moveTo(x - 4, cy - tickUp - tall - 4)
          ctx.lineTo(x + 4, cy - tickUp - tall - 4)
          ctx.stroke()
        }

        // Opened: the entry's parts, under the line.
        if (open > 0.02) {
          ctx.lineWidth = 1.4
          ctx.strokeStyle = rgba(signal, 0.3 * open)
          const parts = 2 + ((change.seed * 17) % 3 | 0)
          for (let k = 0; k < parts; k++) {
            const w = (4 + ((change.seed * 31 + k) % 1) * 9) * open
            ctx.beginPath()
            ctx.moveTo(x - w, cy + tickUp + 5 + k * 4)
            ctx.lineTo(x + w, cy + tickUp + 5 + k * 4)
            ctx.stroke()
          }
        }

        if (fresh > 0.02) {
          const glow = ctx.createRadialGradient(x, cy, 0, x, cy, 20)
          glow.addColorStop(0, rgba(signal, 0.3 * fresh))
          glow.addColorStop(1, rgba(signal, 0))
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(x, cy, 20, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    dispose() {
      untrack()
      changes.length = 0
    },
  }
}

export function ChangelogBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--changelog', className)} aria-hidden />
  )
}
