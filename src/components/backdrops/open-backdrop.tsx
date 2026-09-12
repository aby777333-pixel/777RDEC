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
 * A deadline that does not move, and everything that has to be ready before it.
 *
 * Written for `/company/careers`, whose pitch is a constraint: most software can
 * be retried and this cannot, because the market opens whether you are ready or
 * not. So the band is that — a line for the open, a sweep running toward it, and
 * a column of checks that each have to be green before the sweep arrives.
 *
 * One of them is always late. It sits pending while the others clear, and comes
 * in at the last moment, which is the part of the job the page is describing.
 * Then the sweep passes the line, everything resets, and the next session starts
 * — because it does.
 *
 * **Pointer:** it moves the line. Drag it left and there is less time, and the
 * checks visibly hurry to fit: the schedule rescales rather than overrunning,
 * because overrunning is not one of the options.
 */

/** The checks that have to clear, and where in the run each normally does. */
const CHECKS = 6
/** Seconds from the start of a run to the open. */
const RUN_SECONDS = 7.5
/** Seconds the band holds after the open before the next run. */
const AFTER_SECONDS = 1.4

/** Where the line sits when nothing is pointing, as a share of the band. */
const LINE_REST = 0.91
/** The narrowest the run can be squeezed, as a share of the band. */
const LINE_MIN = 0.75

/**
 * The figure's box, as shares of the band. This page's headline is two long
 * lines, so the run starts clear of them rather than under the second.
 */
const LEFT = 0.63
const RIGHT = 0.97

type Check = {
  /** Where in the run this one clears, 0..1. */
  at: number
  /** Whether it has cleared in this run. */
  done: boolean
  /** When it cleared, for the flash. */
  doneAt: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const up = tokenRgb(host, '--up', [52, 211, 153])
  const warn = tokenRgb(host, '--warn', [251, 191, 36])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let last = -1
  /** How far through the current run, 0..1, then a wait past the open. */
  let progress = 0
  let after = 0
  /** Eased position of the line, as a share of the band. */
  let line = LINE_REST
  /** Which check is late in this run. */
  let late = 2

  const checks: Check[] = Array.from({ length: CHECKS }, (_, i) => ({
    at: 0.12 + (i / CHECKS) * 0.62,
    done: false,
    doneAt: -1,
  }))

  /** Start a run: everything pending again, and a different one left late. */
  const reset = () => {
    late = (Math.random() * CHECKS) | 0
    for (let i = 0; i < CHECKS; i++) {
      checks[i].at = i === late ? 0.955 : 0.12 + (i / CHECKS) * 0.62
      checks[i].done = false
      checks[i].doneAt = -1
    }
    progress = 0
  }
  reset()
  // The band arrives mid-run rather than at the start of one: a hero that is
  // empty for its first few seconds is empty for most of the time anyone
  // spends looking at it.
  progress = 0.42
  for (const check of checks) if (progress >= check.at) check.done = true

  const untrack = trackPointer(
    host,
    (nx) => {
      pointerX = nx
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

      const x0 = width * LEFT
      const x1 = width * RIGHT
      const cy = height * 0.5

      // ---- where the line is ----
      const wantLine =
        pointerX >= 0 ? Math.min(LINE_REST, Math.max(LINE_MIN, pointerX)) : LINE_REST
      line += (wantLine - line) * Math.min(1, 4 * dt)
      const lineX = x0 + (x1 - x0) * ((line - LEFT) / (RIGHT - LEFT))

      // ---- the run ----
      if (after > 0) {
        after -= dt
        if (after <= 0) {
          after = 0
          reset()
        }
      } else {
        // Squeezing the line shortens the run rather than letting it overrun:
        // the same work, less time, which is the whole point.
        const squeeze = (line - LEFT) / (LINE_REST - LEFT)
        progress += dt / (RUN_SECONDS * squeeze)
        if (progress >= 1) {
          progress = 1
          after = AFTER_SECONDS
        }
        for (const check of checks) {
          if (!check.done && progress >= check.at) {
            check.done = true
            check.doneAt = seconds
          }
        }
      }

      const sweepX = x0 + (lineX - x0) * Math.min(1, progress)

      // ---- the track ----
      ctx.strokeStyle = rgba(steel, 0.16)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, cy)
      ctx.lineTo(x1, cy)
      ctx.stroke()

      // ---- the part already run ----
      ctx.strokeStyle = rgba(signal, 0.4)
      ctx.lineWidth = 2.4
      ctx.beginPath()
      ctx.moveTo(x0, cy)
      ctx.lineTo(sweepX, cy)
      ctx.stroke()

      // ---- the line: the one thing here that does not move on its own ----
      const passed = progress >= 1
      const lineColour = passed ? up : steel
      ctx.strokeStyle = rgba(lineColour, passed ? 0.65 : 0.5)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(lineX, cy - height * 0.3)
      ctx.lineTo(lineX, cy + height * 0.3)
      ctx.stroke()
      // Serifs, so it reads as a mark on a scale rather than a divider.
      ctx.lineWidth = 1.4
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(lineX - 6, cy + side * height * 0.3)
        ctx.lineTo(lineX + 6, cy + side * height * 0.3)
        ctx.stroke()
      }

      // ---- the head of the sweep ----
      const glow = ctx.createRadialGradient(sweepX, cy, 0, sweepX, cy, 26)
      glow.addColorStop(0, rgba(signal, 0.42))
      glow.addColorStop(1, rgba(signal, 0))
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(sweepX, cy, 26, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = rgba(signal, 0.95)
      ctx.beginPath()
      ctx.arc(sweepX, cy, 3.2, 0, Math.PI * 2)
      ctx.fill()

      // ---- the checks ----
      const rowGap = Math.min(20, (height * 0.62) / CHECKS)
      const top = cy - ((CHECKS - 1) * rowGap) / 2
      for (let i = 0; i < CHECKS; i++) {
        const check = checks[i]
        const y = top + i * rowGap
        // Each check's own bar runs from the left of the track to where it
        // cleared — or to the sweep, while it is still outstanding.
        const endAt = check.done ? check.at : Math.min(progress, check.at)
        const endX = x0 + (lineX - x0) * endAt
        const isLate = i === late
        const fresh = check.doneAt < 0 ? 0 : Math.max(0, 1 - (seconds - check.doneAt) / 0.5)

        // The whole row, faint: what this check has to have done by the line.
        // Without it an outstanding check is a zero-length mark, and the band
        // reads as empty rather than as work still to do.
        ctx.strokeStyle = rgba(steel, 0.1)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x0 + 8, y)
        ctx.lineTo(x0 + (lineX - x0) * check.at, y)
        ctx.stroke()

        ctx.strokeStyle = rgba(
          check.done ? mixRgb(up, signal, fresh) : isLate ? warn : steel,
          check.done ? 0.34 + fresh * 0.4 : isLate ? 0.4 : 0.2,
        )
        ctx.lineWidth = 1.5 + fresh
        ctx.beginPath()
        ctx.moveTo(x0 + 8, y)
        ctx.lineTo(Math.max(x0 + 8, endX), y)
        ctx.stroke()

        // The mark at the end: open while pending, filled once it has cleared.
        const mx = Math.max(x0 + 8, endX)
        ctx.strokeStyle = rgba(check.done ? up : isLate ? warn : steel, 0.5 + fresh * 0.4)
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.arc(mx, y, 3, 0, Math.PI * 2)
        if (check.done) {
          ctx.fillStyle = rgba(mixRgb(up, signal, fresh), 0.5 + fresh * 0.45)
          ctx.fill()
        }
        ctx.stroke()
      }

      // ---- everything ready, at the open ----
      if (passed) {
        const fade = Math.min(1, after / AFTER_SECONDS)
        ctx.strokeStyle = rgba(up, 0.3 * fade)
        ctx.lineWidth = 1.2
        ctx.strokeRect(x0 + 4, cy - height * 0.33, lineX - x0 - 8, height * 0.66)
      }
    },
    dispose() {
      untrack()
      checks.length = 0
    },
  }
}

export function OpenBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--open', className)} aria-hidden />
}
