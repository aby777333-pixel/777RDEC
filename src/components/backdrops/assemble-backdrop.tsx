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
 * An object, assembling itself.
 *
 * Written for `/developers`, where the invitation is to start building. So the
 * band builds something: an indented structure whose fields arrive one at a
 * time from off the right edge and lock into place — a key rule, an indent, and
 * a mark saying what kind of thing the value is. No text, because a backdrop
 * that puts readable code behind a headline is competing with it; the shape of
 * a nested object is legible on its own.
 *
 * When the last field lands, a bracket closes around the whole block and holds
 * for a moment — the object is complete and valid — and then it clears and
 * starts again.
 *
 * **Pointer:** it is the hand doing the work. Fields arrive roughly three times
 * faster while the pointer is on the band, and they route through it on the way
 * in, so they curve to wherever you are before dropping into their row. Moving
 * about while it builds pulls the whole intake after you.
 */

/**
 * The structure being built, top to bottom: indent depth, how wide the key
 * rule is as a share of the block, and what the value is.
 */
const ROWS: readonly { indent: number; key: number; kind: 'object' | 'scalar' | 'list' }[] = [
  { indent: 0, key: 0.3, kind: 'object' },
  { indent: 1, key: 0.34, kind: 'scalar' },
  { indent: 1, key: 0.26, kind: 'scalar' },
  { indent: 1, key: 0.38, kind: 'object' },
  { indent: 2, key: 0.3, kind: 'scalar' },
  { indent: 2, key: 0.42, kind: 'scalar' },
  { indent: 1, key: 0.32, kind: 'list' },
  { indent: 2, key: 0.24, kind: 'scalar' },
  { indent: 2, key: 0.28, kind: 'scalar' },
  { indent: 1, key: 0.36, kind: 'scalar' },
  { indent: 0, key: 0.22, kind: 'scalar' },
]

/** Seconds between arrivals, idle and while the pointer is on the band. */
const ARRIVE_EVERY = 0.42
const ARRIVE_EVERY_HELD = 0.15
/** How long a field takes to fly in. */
const FLIGHT_SECONDS = 0.55

/** Seconds the finished object is held before the band clears. */
const HOLD_SECONDS = 1.9
/** Seconds the clear takes. */
const CLEAR_SECONDS = 0.5

/** The block's box, as shares of the band. */
const BLOCK_LEFT = 0.62
const BLOCK_WIDTH = 0.26
const INDENT = 0.055

type Field = { row: number; t: number; viaX: number; viaY: number }

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
  /** Rows landed so far. */
  let filled = 0
  let nextArrival = 0
  /** Counts up once the block is complete, then clears it. */
  let holding = 0
  let clearing = 0

  const flying: Field[] = []
  /** When each row landed, so it can flash as it locks in. */
  const landedAt = ROWS.map(() => -1)

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

      const rowHeight = Math.min(26, height / (ROWS.length + 4))
      const blockLeft = width * BLOCK_LEFT
      const blockWidth = width * BLOCK_WIDTH
      const indent = width * INDENT
      const blockTop = height * 0.5 - (ROWS.length - 1) * rowHeight * 0.5

      const anchor = (row: number) => ({
        x: blockLeft + ROWS[row].indent * indent,
        y: blockTop + row * rowHeight,
      })

      // ---- intake ----
      if (clearing > 0) {
        clearing -= dt
        if (clearing <= 0) {
          clearing = 0
          filled = 0
          landedAt.fill(-1)
          nextArrival = seconds + 0.3
        }
      } else if (filled >= ROWS.length) {
        holding += dt
        if (holding > HOLD_SECONDS) {
          holding = 0
          clearing = CLEAR_SECONDS
        }
      } else if (seconds > nextArrival) {
        const pointing = pointerX >= 0
        nextArrival = seconds + (pointing ? ARRIVE_EVERY_HELD : ARRIVE_EVERY)
        const target = anchor(filled + flying.length)
        flying.push({
          row: filled + flying.length,
          t: 0,
          // The waypoint: the pointer if there is one, otherwise a point out to
          // the right so the field still arrives on a curve.
          viaX: pointing ? pointerX : width * 0.95,
          viaY: pointing ? pointerY : target.y - rowHeight * 3,
        })
      }

      // ---- fields in flight ----
      for (let i = flying.length - 1; i >= 0; i--) {
        const field = flying[i]
        field.t += dt / FLIGHT_SECONDS
        // The waypoint follows the pointer while the field is on its way, so
        // the intake tracks your hand rather than a stale position.
        if (pointerX >= 0) {
          field.viaX += (pointerX - field.viaX) * Math.min(1, 6 * dt)
          field.viaY += (pointerY - field.viaY) * Math.min(1, 6 * dt)
        }
        if (field.t >= 1) {
          flying.splice(i, 1)
          filled = Math.max(filled, field.row + 1)
          landedAt[field.row] = seconds
        }
      }

      // ---- the tree's own connectors ----
      ctx.lineWidth = 1
      ctx.strokeStyle = rgba(steel, 0.2)
      for (let row = 0; row < ROWS.length; row++) {
        if (ROWS[row].indent === 0) continue
        // Find the row this one hangs off: the nearest one above at one less
        // indent. Drawn as an L, the way an outline is.
        let parent = row - 1
        while (parent >= 0 && ROWS[parent].indent >= ROWS[row].indent) parent -= 1
        if (parent < 0) continue
        if (row >= filled && !flying.some((f) => f.row === row)) continue
        const a = anchor(parent)
        const b = anchor(row)
        ctx.beginPath()
        ctx.moveTo(a.x + 2, a.y + 4)
        ctx.lineTo(a.x + 2, b.y)
        ctx.lineTo(b.x - 4, b.y)
        ctx.stroke()
      }

      // ---- the rows ----
      const fade = clearing > 0 ? clearing / CLEAR_SECONDS : 1
      for (let row = 0; row < ROWS.length; row++) {
        const { x, y } = anchor(row)
        const spec = ROWS[row]
        const landed = row < filled
        const keyWidth = blockWidth * spec.key

        if (!landed) {
          // The slot waiting to be filled.
          ctx.strokeStyle = rgba(steel, 0.13)
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + keyWidth, y)
          ctx.stroke()
          continue
        }

        // A brief flash as it locks in, so a landing is an event.
        const since = landedAt[row] < 0 ? 99 : seconds - landedAt[row]
        const fresh = Math.max(0, 1 - since / 0.4)
        const alpha = (0.6 + fresh * 0.4) * fade

        ctx.strokeStyle = rgba(mixRgb(steel, signal, fresh), alpha)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + keyWidth, y)
        ctx.stroke()

        // The value's kind, as a mark rather than a word.
        const markX = x + keyWidth + 10
        ctx.strokeStyle = rgba(mixRgb(steel, signal, 0.5), alpha * 0.9)
        ctx.lineWidth = 1.4
        if (spec.kind === 'object') {
          ctx.strokeRect(markX, y - 3.5, 7, 7)
        } else if (spec.kind === 'list') {
          ctx.setLineDash([3, 3])
          ctx.beginPath()
          ctx.moveTo(markX, y)
          ctx.lineTo(markX + blockWidth * 0.22, y)
          ctx.stroke()
          ctx.setLineDash([])
        } else {
          ctx.beginPath()
          ctx.moveTo(markX, y)
          ctx.lineTo(markX + blockWidth * 0.16, y)
          ctx.stroke()
        }
      }

      // ---- fields still on their way ----
      for (const field of flying) {
        const target = anchor(field.row)
        const startX = width * 1.06
        const startY = target.y
        const t = Math.min(1, field.t)
        // Quadratic through the waypoint: two lerps, which is all a bezier is.
        const ax = startX + (field.viaX - startX) * t
        const ay = startY + (field.viaY - startY) * t
        const bx = field.viaX + (target.x - field.viaX) * t
        const by = field.viaY + (target.y - field.viaY) * t
        const x = ax + (bx - ax) * t
        const y = ay + (by - ay) * t

        const glow = ctx.createRadialGradient(x, y, 0, x, y, 18)
        glow.addColorStop(0, rgba(signal, 0.38))
        glow.addColorStop(1, rgba(signal, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, 18, 0, Math.PI * 2)
        ctx.fill()

        // It arrives as a short rule, already the shape of the row it becomes.
        const length = 6 + 14 * t
        ctx.strokeStyle = rgba(signal, 0.9)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - length / 2, y)
        ctx.lineTo(x + length / 2, y)
        ctx.stroke()
      }

      // ---- the bracket that closes around a finished object ----
      if (filled >= ROWS.length) {
        const grow = Math.min(1, holding / 0.45)
        const top = blockTop - rowHeight * 0.8
        const bottom = blockTop + (ROWS.length - 1) * rowHeight + rowHeight * 0.8
        const leftX = blockLeft - 14
        const rightX = blockLeft + blockWidth + blockWidth * 0.28 + 14
        const reach = rowHeight * 0.9 * grow
        ctx.strokeStyle = rgba(signal, 0.45 * grow * fade)
        ctx.lineWidth = 1.6
        for (const [x, side] of [
          [leftX, 1],
          [rightX, -1],
        ] as const) {
          ctx.beginPath()
          ctx.moveTo(x + side * reach, top)
          ctx.lineTo(x, top)
          ctx.lineTo(x, bottom)
          ctx.lineTo(x + side * reach, bottom)
          ctx.stroke()
        }
      }
    },
    dispose() {
      untrack()
      flying.length = 0
    },
  }
}

export function AssembleBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--assemble', className)} aria-hidden />
}
