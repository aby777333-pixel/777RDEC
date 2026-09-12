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
 * A closed box, and one outside it that is never joined to it.
 *
 * Written for `/developers/sandbox`. The page's promise is negative — nothing
 * in here touches a live account, a live venue or real money — and a negative
 * promise is hard to illustrate and easy to demonstrate. So the band is a box
 * with simulated ticks loose inside it, bouncing, and a second box to its right
 * drawn dashed and empty, with no line of any kind between them. The wall
 * flashes wherever something strikes it, and the wall facing the live side
 * flashes hardest, which is the one that matters.
 *
 * Nothing ever crosses. Not because it is checked for, but because the only
 * thing the simulation does at a wall is reflect.
 *
 * **Pointer:** it is a stirring rod, and it pushes rather than attracts. Herd
 * the ticks into the right-hand wall and hold them there: they pile against it,
 * the wall lights under the pressure, and not one of them gets out.
 */

/** Ticks loose in the box, and their speed range in pixels per second. */
const TICKS = 44
const SLOWEST = 55
const FASTEST = 150

/** The pointer's reach as a share of the box's short side, and how hard it pushes. */
const REACH = 0.34
const PUSH = 320

/** Wall marks kept, and how long each lasts. */
const MARKS = 26
const MARK_SECONDS = 0.9

/** The sandbox, as shares of the band. */
const BOX_LEFT = 0.55
const BOX_RIGHT = 0.85
const BOX_TOP = 0.16
const BOX_BOTTOM = 0.84
/** The live side, which is drawn and left alone. */
const LIVE_LEFT = 0.9
const LIVE_RIGHT = 0.985

type Tick = { x: number; y: number; px: number; py: number; vx: number; vy: number }
type Mark = { x: number; y: number; age: number; right: boolean }

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

  const ticks: Tick[] = []
  const marks: Mark[] = []

  /** Fill the box, keeping whatever is already in it inside the new bounds. */
  const fit = () => {
    const l = width * BOX_LEFT
    const r = width * BOX_RIGHT
    const t = height * BOX_TOP
    const b = height * BOX_BOTTOM
    while (ticks.length < TICKS) {
      const angle = Math.random() * Math.PI * 2
      const speed = SLOWEST + Math.random() * (FASTEST - SLOWEST)
      const x = l + Math.random() * (r - l)
      const y = t + Math.random() * (b - t)
      ticks.push({ x, y, px: x, py: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed })
    }
    for (const tick of ticks) {
      tick.x = Math.min(r - 2, Math.max(l + 2, tick.x))
      tick.y = Math.min(b - 2, Math.max(t + 2, tick.y))
      tick.px = tick.x
      tick.py = tick.y
    }
  }
  fit()

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
      fit()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : Math.min(0.05, seconds - last)
      last = seconds

      ctx.clearRect(0, 0, width, height)

      const l = width * BOX_LEFT
      const r = width * BOX_RIGHT
      const t = height * BOX_TOP
      const b = height * BOX_BOTTOM
      const reach = Math.min(r - l, b - t) * REACH

      // ---- move, and reflect at the walls ----
      for (const tick of ticks) {
        if (pointerX >= 0) {
          const dx = tick.x - pointerX
          const dy = tick.y - pointerY
          const d = Math.hypot(dx, dy)
          if (d < reach && d > 0.001) {
            const force = (1 - d / reach) * PUSH * dt
            tick.vx += (dx / d) * force
            tick.vy += (dy / d) * force
          }
        }

        // Speed is held in a band: a stirred tick would otherwise either stop
        // or end up crossing a wall in a single step.
        const speed = Math.hypot(tick.vx, tick.vy) || 1
        const clamped = Math.min(FASTEST * 1.6, Math.max(SLOWEST * 0.6, speed))
        tick.vx = (tick.vx / speed) * clamped
        tick.vy = (tick.vy / speed) * clamped

        tick.px = tick.x
        tick.py = tick.y
        tick.x += tick.vx * dt
        tick.y += tick.vy * dt

        const hit = (x: number, y: number, right: boolean) => {
          if (marks.length >= MARKS) marks.shift()
          marks.push({ x, y, age: 0, right })
        }
        if (tick.x < l) {
          tick.x = l + (l - tick.x)
          tick.vx = Math.abs(tick.vx)
          hit(l, tick.y, false)
        } else if (tick.x > r) {
          tick.x = r - (tick.x - r)
          tick.vx = -Math.abs(tick.vx)
          hit(r, tick.y, true)
        }
        if (tick.y < t) {
          tick.y = t + (t - tick.y)
          tick.vy = Math.abs(tick.vy)
          hit(tick.x, t, false)
        } else if (tick.y > b) {
          tick.y = b - (tick.y - b)
          tick.vy = -Math.abs(tick.vy)
          hit(tick.x, b, false)
        }
      }

      // ---- the live side: drawn, and never touched ----
      const liveL = width * LIVE_LEFT
      const liveR = width * LIVE_RIGHT
      ctx.setLineDash([6, 6])
      ctx.strokeStyle = rgba(steel, 0.2)
      ctx.lineWidth = 1
      ctx.strokeRect(liveL, t, liveR - liveL, b - t)
      ctx.setLineDash([])

      // ---- the box ----
      ctx.strokeStyle = rgba(steel, 0.42)
      ctx.lineWidth = 1.6
      ctx.strokeRect(l, t, r - l, b - t)

      // ---- marks on the wall ----
      for (let i = marks.length - 1; i >= 0; i--) {
        const mark = marks[i]
        mark.age += dt
        if (mark.age > MARK_SECONDS) {
          marks.splice(i, 1)
          continue
        }
        const fade = 1 - mark.age / MARK_SECONDS
        const reachOut = (mark.right ? 16 : 9) * fade
        const strength = mark.right ? 0.55 : 0.3
        const glow = ctx.createRadialGradient(mark.x, mark.y, 0, mark.x, mark.y, reachOut + 6)
        glow.addColorStop(0, rgba(signal, strength * fade))
        glow.addColorStop(1, rgba(signal, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(mark.x, mark.y, reachOut + 6, 0, Math.PI * 2)
        ctx.fill()
      }

      // ---- the ticks ----
      for (const tick of ticks) {
        ctx.strokeStyle = rgba(mixRgb(steel, signal, 0.6), 0.45)
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(tick.px, tick.py)
        ctx.lineTo(tick.x, tick.y)
        ctx.stroke()

        ctx.fillStyle = rgba(signal, 0.8)
        ctx.beginPath()
        ctx.arc(tick.x, tick.y, 1.7, 0, Math.PI * 2)
        ctx.fill()
      }

      // ---- the rod ----
      if (pointerX > l - reach && pointerX < r + reach) {
        ctx.strokeStyle = rgba(signal, 0.12)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(pointerX, pointerY, reach, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
    dispose() {
      untrack()
      ticks.length = 0
      marks.length = 0
    },
  }
}

export function SandboxBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--sandbox', className)} aria-hidden />
}
