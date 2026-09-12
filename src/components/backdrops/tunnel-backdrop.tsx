'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * A rotating square tunnel — and the one backdrop on this site that is not a
 * port. Every other band carries somebody's pen, credited in its own file.
 * The pen meant for this page is private, so this is written for the band
 * instead, and it is mine: there is nobody to credit and nothing to be
 * faithful to.
 *
 * Forty-odd squares spaced down a corridor, each drawn at the size perspective
 * gives it — half-size over distance — so the far ones are small and tight
 * around the vanishing point and the near ones sweep out past the edges of the
 * band. They travel toward the viewer on a loop: as each one passes the camera
 * it is reused at the far end, which is what makes the corridor endless
 * without keeping more than forty squares alive.
 *
 * Each square is also turned by its own depth, so the corridor reads as
 * twisted rather than as a stack of frames, and the whole tunnel turns slowly
 * on top of that. A square fades in out of the dark as it arrives and fades
 * out again as it passes, so nothing pops into or out of existence.
 *
 * Two things tie it to this site rather than to a demo:
 *
 * - **The colour is the site's, read from the band.** Not a literal: the
 *   `--signal` and `--steel-700` tokens are measured off the host element,
 *   which sits inside the hero's `force-dark` subtree, so they are the dark
 *   palette's values whichever theme the page is in. Near squares are signal
 *   blue, far ones steel, and the corridor grades between them.
 * - **The vanishing point sits right of centre**, where the copy is not, and
 *   drifts a little toward the pointer — enough that the corridor answers to
 *   the visitor without becoming something to play with.
 */

/** Squares alive at once. The whole cost is one stroke each. */
const SQUARES = 44

/** Depth of the corridor travelled per second, as a fraction of its length. */
const SPEED = 0.075
/** Radians the whole tunnel turns per second. */
const SPIN = 0.05
/** Radians of extra turn across the corridor's full depth. */
const TWIST = 2.1

/** Nearest and farthest depth. Nothing is drawn closer than NEAR. */
const NEAR = 0.085
const FAR = 1

/** Half-size of a square at the far end, as a share of the band's short side. */
const FOCAL = 0.075

/** Where the corridor points, 0..1 of the band, and how far the pointer pulls it. */
const VANISH_X = 0.68
const VANISH_Y = 0.5
const PARALLAX = 0.055
/** How quickly the vanishing point follows, per frame. */
const EASE = 0.04

const MAX_ALPHA = 0.85

type Rgb = [number, number, number]

/**
 * Reads a colour token off the band itself. The host is inside the hero's
 * `force-dark` subtree, so this is the dark palette's value even when the page
 * around it is light — which is what the band is painted in.
 */
function tokenRgb(host: HTMLElement, name: string, fallback: Rgb): Rgb {
  const raw = getComputedStyle(host).getPropertyValue(name).trim()
  if (!raw) return fallback
  const hex = raw.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const n = parseInt(hex[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const rgb = raw.match(/(-?[\d.]+)[,\s]+(-?[\d.]+)[,\s]+(-?[\d.]+)/)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  return fallback
}

/** 0 below `from`, 1 above `to`, eased between. */
function ramp(value: number, from: number, to: number) {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)

  const near = tokenRgb(host, '--signal', [125, 211, 252])
  const far = tokenRgb(host, '--steel-700', [75, 80, 88])

  // Where the corridor points, and where it is being asked to point.
  let cx = width * VANISH_X
  let cy = height * VANISH_Y
  let targetX = cx
  let targetY = cy

  const untrack = trackPointer(
    host,
    (nx, ny) => {
      // The pointer pulls the vanishing point, it does not hand it over: a
      // fraction of the distance from where it rests.
      targetX = width * (VANISH_X + (nx - VANISH_X) * PARALLAX * 2)
      targetY = height * (VANISH_Y + (ny - VANISH_Y) * PARALLAX * 2)
    },
    () => {
      targetX = width * VANISH_X
      targetY = height * VANISH_Y
    },
  )

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      cx = w * VANISH_X
      cy = h * VANISH_Y
      targetX = cx
      targetY = cy
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      cx += (targetX - cx) * EASE
      cy += (targetY - cy) * EASE

      ctx.clearRect(0, 0, width, height)

      const shortSide = Math.min(width, height)
      const spin = seconds * SPIN

      for (let i = 0; i < SQUARES; i++) {
        // Each square sits at its own place in the corridor and moves down it;
        // the fractional part is what returns it to the far end.
        const travel = (i / SQUARES + seconds * SPEED) % 1
        const depth = FAR - travel * (FAR - NEAR)

        // Perspective: half-size over distance.
        const half = (FOCAL * shortSide) / depth
        // Anything this far past the edges is no longer in the picture.
        if (half > shortSide * 6) continue

        const closeness = 1 - depth
        const alpha =
          MAX_ALPHA *
          // Arriving out of the dark at the far end...
          ramp(closeness, 0, 0.22) *
          // ...and gone again as it passes the camera.
          (1 - ramp(closeness, 1 - (NEAR + 0.16), 1 - NEAR))
        if (alpha <= 0.002) continue

        const mix = closeness * closeness
        const r = Math.round(far[0] + (near[0] - far[0]) * mix)
        const g = Math.round(far[1] + (near[1] - far[1]) * mix)
        const b = Math.round(far[2] + (near[2] - far[2]) * mix)

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(spin + closeness * TWIST)
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`
        ctx.lineWidth = 0.6 + closeness * 2.2
        ctx.strokeRect(-half, -half, half * 2, half * 2)
        ctx.restore()
      }
    },
    dispose() {
      untrack()
    },
  }
}

export function TunnelBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--tunnel', className)} aria-hidden />
}
