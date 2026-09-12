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
 * Three systems, and the gaps between them.
 *
 * Written for `/company`, which says the company exists because its people
 * spent years working around the gaps between a trading platform, a CRM and a
 * client portal that were never designed to know about each other. So the band
 * is those three, drawn as separate blocks with a reach coming out of each side
 * that does not meet the reach opposite it. The gap is the subject.
 *
 * Then they close. The blocks slide together, the stubs join into one rail, and
 * something runs the whole length of it — which is the company's own claim
 * about what it built. Then they drift apart and it happens again, because the
 * argument is worth watching twice.
 *
 * **Pointer:** it sets the distance directly. Its horizontal position is how
 * closed the gaps are, from fully apart at the left of the band to joined at
 * the right, so you can hold the gaps open and look at them, or close them
 * yourself and watch the traffic start.
 */

/** The three blocks, and how many rules are drawn inside each. */
const BLOCKS = 3
const LINES = 3

/** Seconds for one apart-to-joined-and-back cycle when nothing is pointing. */
const CYCLE = 9
/** How closed a gap must be before the stubs join. */
const JOIN_AT = 0.86

/** How far a block travels between apart and joined, as a share of its width. */
const SPREAD = 0.55

/** Tokens crossing the joined rail, and how long a crossing takes. */
const TOKENS = 3
const CROSS_SECONDS = 2.2

/**
 * The row, as shares of the band. This page's headline runs wide, so the row
 * starts clear of it rather than putting a block behind the second line.
 */
const ROW_LEFT = 0.6
const ROW_RIGHT = 0.97

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let last = -1
  /** 0 fully apart, 1 joined. Eased, so the pointer does not snap it. */
  let closed = 0
  /** Crossing tokens, as positions along the whole rail. */
  const tokens: number[] = []
  let nextToken = 0

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

      const x0 = width * ROW_LEFT
      const x1 = width * ROW_RIGHT
      const span = x1 - x0
      const blockWidth = span * 0.24
      const cy = height * 0.5
      const blockHeight = Math.min(height * 0.42, 120)

      // ---- how closed ----
      let wanted: number
      if (pointerX >= 0) {
        // Left edge of the band is fully apart, the right edge fully joined.
        wanted = Math.min(1, Math.max(0, (pointerX - width * 0.12) / (width * 0.78)))
      } else {
        // A slow triangle: apart, together, apart, with a dwell at each end.
        const phase = (seconds / CYCLE) % 1
        wanted = phase < 0.5 ? phase * 2 : (1 - phase) * 2
        wanted = Math.min(1, Math.max(0, wanted * 1.35 - 0.12))
      }
      closed += (wanted - closed) * Math.min(1, 3 * dt)

      const joined = closed > JOIN_AT
      const drift = blockWidth * SPREAD * (1 - closed)
      const blockX = (i: number) =>
        x0 + (span - blockWidth) * (i / (BLOCKS - 1)) + (i - (BLOCKS - 1) / 2) * drift

      // ---- the reaches between them ----
      for (let i = 0; i < BLOCKS - 1; i++) {
        const leftEnd = blockX(i) + blockWidth
        const rightEnd = blockX(i + 1)
        const middle = (leftEnd + rightEnd) / 2
        const gap = rightEnd - leftEnd

        if (joined) {
          ctx.strokeStyle = rgba(signal, 0.5)
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(leftEnd, cy)
          ctx.lineTo(rightEnd, cy)
          ctx.stroke()
          continue
        }

        // Two stubs that stop short of each other, and the gap left between
        // them drawn as the thing it is.
        const stub = Math.max(0, gap * 0.36)
        ctx.strokeStyle = rgba(steel, 0.32)
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(leftEnd, cy)
        ctx.lineTo(leftEnd + stub, cy)
        ctx.moveTo(rightEnd, cy)
        ctx.lineTo(rightEnd - stub, cy)
        ctx.stroke()

        ctx.setLineDash([2, 4])
        ctx.strokeStyle = rgba(steel, 0.14)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(leftEnd + stub, cy)
        ctx.lineTo(rightEnd - stub, cy)
        ctx.stroke()
        ctx.setLineDash([])

        // A small cross at the middle of the gap: this is where it does not go.
        const mark = 3.5
        ctx.strokeStyle = rgba(steel, 0.2 + (1 - closed) * 0.2)
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(middle - mark, cy - mark)
        ctx.lineTo(middle + mark, cy + mark)
        ctx.moveTo(middle + mark, cy - mark)
        ctx.lineTo(middle - mark, cy + mark)
        ctx.stroke()
      }

      // ---- the blocks ----
      for (let i = 0; i < BLOCKS; i++) {
        const bx = blockX(i)
        ctx.strokeStyle = rgba(steel, joined ? 0.44 : 0.3)
        ctx.lineWidth = 1.4
        ctx.strokeRect(bx, cy - blockHeight / 2, blockWidth, blockHeight)

        // What is inside: a few rules, longer in the block that has more in it.
        ctx.lineWidth = 1.6
        for (let row = 0; row < LINES; row++) {
          const t = (row + 1) / (LINES + 1)
          const shrink = 0.4 + ((i * 3 + row) % 4) * 0.14
          ctx.strokeStyle = rgba(steel, 0.26)
          ctx.beginPath()
          ctx.moveTo(bx + blockWidth * 0.14, cy - blockHeight / 2 + blockHeight * t)
          ctx.lineTo(bx + blockWidth * 0.14 + blockWidth * 0.72 * shrink, cy - blockHeight / 2 + blockHeight * t)
          ctx.stroke()
        }
      }

      // ---- traffic, once there is a rail to carry it ----
      if (joined) {
        if (seconds > nextToken && tokens.length < TOKENS) {
          nextToken = seconds + CROSS_SECONDS / TOKENS
          tokens.push(0)
        }
      } else {
        tokens.length = 0
      }
      for (let i = tokens.length - 1; i >= 0; i--) {
        tokens[i] += dt / CROSS_SECONDS
        if (tokens[i] >= 1) {
          tokens.splice(i, 1)
          continue
        }
        const x = blockX(0) + (blockX(BLOCKS - 1) + blockWidth - blockX(0)) * tokens[i]
        const glow = ctx.createRadialGradient(x, cy, 0, x, cy, 22)
        glow.addColorStop(0, rgba(signal, 0.4))
        glow.addColorStop(1, rgba(signal, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, cy, 22, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = rgba(signal, 0.95)
        ctx.beginPath()
        ctx.arc(x, cy, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    dispose() {
      untrack()
      tokens.length = 0
    },
  }
}

export function GapsBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--gaps', className)} aria-hidden />
}
