'use client'

import { cn } from '@/lib/utils'
import {
  type BackdropScene,
  rgba,
  tokenRgb,
  trackPointer,
  useBackdropCanvas,
} from './use-backdrop-canvas'

/**
 * It depends on what you are running.
 *
 * Written for `/company/engagement`, whose first sentence is that what this
 * costs depends on what you are running. So the band is the dependency itself
 * and nothing else: three inputs on the left as scales with a marker each, and
 * on the right the answer as a band rather than a line.
 *
 * There is no number anywhere in it, and there is no single value — the whole
 * point is that the answer is a range that moves when the inputs move, and
 * narrows as more of them are settled. A backdrop that showed a figure would be
 * making a claim the page deliberately does not make.
 *
 * **Pointer:** it sets an input. The nearest scale's marker follows your
 * horizontal position and the band redraws under it — wider where the inputs
 * are unusual, tighter where they are ordinary. Untouched, the three drift on
 * their own and the band breathes with them.
 */

/** The inputs. Three, because the page names three kinds of thing. */
const INPUTS = 3
/** How fast an untouched input drifts, in cycles per second. */
const DRIFT = 0.07
/** Points the band's edges are drawn from. */
const POINTS = 44

/** The figure's box, as shares of the band. */
const SCALE_LEFT = 0.52
const SCALE_RIGHT = 0.72
const BAND_LEFT = 0.76
const BAND_RIGHT = 0.97

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

  /** Each input's setting, 0..1, and how settled it is. */
  const settings = [0.4, 0.6, 0.3]
  const held = [0, 0, 0]

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

      const sx0 = width * SCALE_LEFT
      const sx1 = width * SCALE_RIGHT
      const bx0 = width * BAND_LEFT
      const bx1 = width * BAND_RIGHT
      const rowGap = Math.min(44, height * 0.2)
      const top = height * 0.5 - ((INPUTS - 1) * rowGap) / 2

      // ---- which input the pointer is on ----
      let touching = -1
      if (pointerX >= sx0 - 40 && pointerX <= sx1 + 40) {
        let bestD = rowGap * 0.7
        for (let i = 0; i < INPUTS; i++) {
          const d = Math.abs(top + i * rowGap - pointerY)
          if (d < bestD) {
            bestD = d
            touching = i
          }
        }
      }

      for (let i = 0; i < INPUTS; i++) {
        held[i] += ((i === touching ? 1 : 0) - held[i]) * Math.min(1, 7 * dt)
        if (i === touching) {
          const wanted = Math.min(1, Math.max(0, (pointerX - sx0) / (sx1 - sx0)))
          settings[i] += (wanted - settings[i]) * Math.min(1, 9 * dt)
        } else {
          // Drifting: a slow triangle so it visits the ends rather than
          // hovering in the middle the way a sine does.
          const phase = (seconds * DRIFT + i * 0.37) % 1
          const wanted = phase < 0.5 ? phase * 2 : (1 - phase) * 2
          settings[i] += (wanted - settings[i]) * Math.min(1, 0.8 * dt)
        }
      }

      // ---- the scales ----
      for (let i = 0; i < INPUTS; i++) {
        const y = top + i * rowGap
        const on = held[i]

        ctx.strokeStyle = rgba(steel, 0.18 + on * 0.2)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(sx0, y)
        ctx.lineTo(sx1, y)
        ctx.stroke()

        // Notches, so a marker's position means something.
        ctx.lineWidth = 1
        for (let k = 0; k <= 8; k++) {
          const x = sx0 + ((sx1 - sx0) * k) / 8
          const tall = k % 4 === 0 ? 5 : 3
          ctx.strokeStyle = rgba(steel, 0.14 + on * 0.14)
          ctx.beginPath()
          ctx.moveTo(x, y - tall)
          ctx.lineTo(x, y + tall)
          ctx.stroke()
        }

        const mx = sx0 + (sx1 - sx0) * settings[i]
        if (on > 0.02) {
          const glow = ctx.createRadialGradient(mx, y, 0, mx, y, 18)
          glow.addColorStop(0, rgba(signal, 0.3 * on))
          glow.addColorStop(1, rgba(signal, 0))
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(mx, y, 18, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = rgba(signal, 0.5 + on * 0.4)
        ctx.beginPath()
        ctx.moveTo(mx, y - 6)
        ctx.lineTo(mx + 5, y)
        ctx.lineTo(mx, y + 6)
        ctx.lineTo(mx - 5, y)
        ctx.closePath()
        ctx.fill()
      }

      // ---- the answer, as a band ----
      const cy = height * 0.5
      const reach = height * 0.3
      // The centre is driven by the inputs, and the width by how unusual they
      // are: ordinary settings narrow it, extremes widen it.
      const centre = (settings[0] * 0.5 + settings[1] * 0.3 + settings[2] * 0.2 - 0.5) * reach
      const unusual =
        settings.reduce((sum, s) => sum + Math.abs(s - 0.45), 0) / INPUTS + 0.12
      const spreadAt = (t: number) => reach * unusual * (0.45 + t * 1.15)

      const upper: [number, number][] = []
      const lower: [number, number][] = []
      for (let k = 0; k <= POINTS; k++) {
        const t = k / POINTS
        const x = bx0 + (bx1 - bx0) * t
        const mid = cy + centre * t
        const spread = spreadAt(t)
        upper.push([x, mid - spread])
        lower.push([x, mid + spread])
      }

      ctx.beginPath()
      ctx.moveTo(upper[0][0], upper[0][1])
      for (const [x, y] of upper) ctx.lineTo(x, y)
      for (let k = lower.length - 1; k >= 0; k--) ctx.lineTo(lower[k][0], lower[k][1])
      ctx.closePath()
      ctx.fillStyle = rgba(signal, 0.07)
      ctx.fill()
      ctx.strokeStyle = rgba(signal, 0.4)
      ctx.lineWidth = 1.6
      ctx.stroke()

      // The one thing that is known: where it starts from.
      ctx.strokeStyle = rgba(steel, 0.3)
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(bx0, cy - spreadAt(0))
      ctx.lineTo(bx0, cy + spreadAt(0))
      ctx.stroke()

      // And the line from the settled inputs into it.
      ctx.strokeStyle = rgba(steel, 0.16)
      ctx.lineWidth = 1
      ctx.setLineDash([3, 5])
      ctx.beginPath()
      ctx.moveTo(sx1 + 10, cy)
      ctx.lineTo(bx0 - 6, cy)
      ctx.stroke()
      ctx.setLineDash([])
    },
    dispose() {
      untrack()
    },
  }
}

export function DependsBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--depends', className)} aria-hidden />
}
