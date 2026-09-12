'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Particle Explosions" by sumitmsn, ported.
 * https://codepen.io/sumitmsn/pen/aZLxPe
 *
 * One ring is laid down at the pointer every frame — a stroked circle thirty
 * pixels across, in red, cyan or white — and each then drifts on its own slow
 * velocity while closing and fading over eight counts. What the pointer leaves
 * behind is a wake of contracting circles, brightest where it is now.
 *
 * The rings, the three colours, the radius, the lifetime and the drift are the
 * pen's, values included, and so are two of its quirks, kept because they are
 * what the picture is made of:
 *
 * - A ring's vertical bounce is tested against the canvas *width*, not its
 *   height. On a band wider than it is tall that test never fires, so rings
 *   settle along the lower edge instead of coming back off it.
 * - The ground is repainted opaque every frame, so nothing accumulates: the
 *   wake is only ever the rings still alive.
 *
 * One thing is not kept, because it is a leak rather than a look: the pen
 * wraps every ring in a group, and empties the group but never drops it, so it
 * grows by sixty dead objects a second for as long as the page is open. A
 * demo lives for a minute; a hero band lives for as long as the visit. The
 * rings here are one flat list.
 *
 * One placement change, as elsewhere: the wake opens right of centre rather
 * than under the headline, and then follows the pointer as the pen does.
 */

/** The pen's ring: thirty across, eight counts of life, a tenth spent a frame. */
const RING_RADIUS = 30
const RING_TTL = 8
const TTL_STEP = 0.1

const COLOURS = [
  { r: 255, g: 71, b: 71 },
  { r: 0, g: 206, b: 237 },
  { r: 255, g: 255, b: 255 },
] as const

const REST_X = 0.66
const REST_Y = 0.5

type Ring = {
  x: number
  y: number
  dx: number
  dy: number
  r: number
  ttl: number
  opacity: number
  colour: (typeof COLOURS)[number]
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let mouseX = width * REST_X
  let mouseY = height * REST_Y

  const rings: Ring[] = []

  const untrack = trackPointer(host, (nx, ny) => {
    mouseX = nx * width
    mouseY = ny * height
  })

  return {
    resize(w, h, dpr) {
      mouseX = width ? (mouseX / width) * w : w * REST_X
      mouseY = height ? (mouseY / height) * h : h * REST_Y
      width = w
      height = h
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame() {
      ctx.fillStyle = '#1e1e1e'
      ctx.fillRect(0, 0, width, height)

      rings.push({
        x: mouseX,
        y: mouseY,
        dx: (Math.random() - 0.5) * 3.5,
        dy: (Math.random() - 0.5) * 3.5,
        r: RING_RADIUS,
        ttl: RING_TTL,
        opacity: 1,
        colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      })

      for (let i = rings.length - 1; i >= 0; i--) {
        const p = rings[i]
        p.x += p.dx
        p.y += p.dy

        if (p.x + p.r >= width || p.x - p.r <= 0) p.dx = -p.dx
        // The pen's own test, width and all — see the note above.
        if (p.y + p.r >= width || p.y - p.r <= 0) p.dy = -p.dy

        p.x = Math.min(Math.max(p.x, p.r), width - p.r)
        p.y = Math.min(Math.max(p.y, p.r), height - p.r)

        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0, p.r), 0, Math.PI * 2, false)
        ctx.strokeStyle = `rgba(${p.colour.r},${p.colour.g},${p.colour.b},${Math.max(0, p.opacity)})`
        ctx.stroke()

        p.opacity -= 1 / (RING_TTL / TTL_STEP)
        p.r -= RING_RADIUS / (RING_TTL / TTL_STEP)
        p.ttl -= TTL_STEP

        if (p.ttl <= 0) rings.splice(i, 1)
      }
    },
    dispose() {
      untrack()
      rings.length = 0
    },
  }
}

export function BurstsBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.5 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--bursts', className)} aria-hidden />
}
