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
 * Categories of coverage, and where they overlap.
 *
 * Written for `/company/partners`, which describes relationships by what they
 * cover rather than by logo. So the band is coverage: five soft regions, each a
 * category, drifting and breathing on their own periods. None of them is
 * labelled and none is a logo. What they have in common is the small area they
 * all contain — the platform sits in the overlap, and the overlap is what the
 * page is actually about.
 *
 * The regions move, so the shape of the overlap changes, but the platform stays
 * inside it: every region is tethered to that point, which is what makes it a
 * set of relationships rather than five circles on a slide.
 *
 * **Pointer:** the nearest region comes forward — it fills faintly, its edge
 * firms up, and the arcs where it meets each of the others light. Holding one
 * region shows exactly what it shares with the rest.
 */

/** The regions, and how many points each outline is drawn from. */
const REGIONS = 5
const POINTS = 48

/** How far a region's centre sits from the platform, as a share of its radius. */
const OFFSET = 0.62
/** Drift and breathing rates, in radians per second. */
const DRIFT = 0.11
const BREATHE = 0.34

const CENTRE_X = 0.72
const CENTRE_Y = 0.5

type Region = {
  /** Where this region sits around the platform. */
  angle: number
  /** Its own size, drift phase and wobble seed. */
  size: number
  phase: number
  seed: number
  /** Eased weight under the pointer. */
  held: number
}

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

  const regions: Region[] = Array.from({ length: REGIONS }, (_, i) => ({
    angle: (i / REGIONS) * Math.PI * 2,
    size: 0.82 + ((i * 7) % 5) * 0.07,
    phase: i * 1.3,
    seed: i * 2.7,
    held: 0,
  }))

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

      const cx = width * CENTRE_X
      const cy = height * CENTRE_Y
      const unit = Math.min(width * 0.1, height * 0.3)

      /** A region's centre and radius this frame. */
      const shape = (region: Region) => {
        const angle = region.angle + seconds * DRIFT
        const radius = unit * region.size * (1 + Math.sin(seconds * BREATHE + region.phase) * 0.1)
        return {
          x: cx + Math.cos(angle) * radius * OFFSET,
          y: cy + Math.sin(angle) * radius * OFFSET,
          r: radius,
        }
      }

      // ---- which region is in hand ----
      let nearest = -1
      if (pointerX >= 0) {
        let bestD = Infinity
        for (let i = 0; i < regions.length; i++) {
          const s = shape(regions[i])
          const d = Math.hypot(s.x - pointerX, s.y - pointerY)
          if (d < bestD) {
            bestD = d
            nearest = i
          }
        }
      }
      for (let i = 0; i < regions.length; i++) {
        regions[i].held += ((i === nearest ? 1 : 0) - regions[i].held) * Math.min(1, 6 * dt)
      }

      /** The outline of a region, as a closed path, wobbled a little. */
      const trace = (region: Region) => {
        const s = shape(region)
        ctx.beginPath()
        for (let k = 0; k <= POINTS; k++) {
          const a = (k / POINTS) * Math.PI * 2
          // A region is not a circle; the wobble is small and slow.
          const wobble = 1 + Math.sin(a * 3 + region.seed + seconds * 0.4) * 0.06
          const x = s.x + Math.cos(a) * s.r * wobble
          const y = s.y + Math.sin(a) * s.r * wobble
          if (k === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
      }

      // ---- the regions ----
      for (const region of regions) {
        const held = region.held
        trace(region)
        if (held > 0.01) {
          ctx.fillStyle = rgba(signal, 0.05 * held)
          ctx.fill()
        }
        ctx.strokeStyle = rgba(held > 0.3 ? signal : steel, 0.18 + held * 0.4)
        ctx.lineWidth = 1.1 + held * 1.2
        ctx.stroke()
      }

      // ---- where the held region meets each of the others ----
      if (nearest >= 0 && regions[nearest].held > 0.05) {
        const a = shape(regions[nearest])
        const strength = regions[nearest].held
        for (let i = 0; i < regions.length; i++) {
          if (i === nearest) continue
          const b = shape(regions[i])
          const d = Math.hypot(b.x - a.x, b.y - a.y)
          if (d > a.r + b.r || d < Math.abs(a.r - b.r) || d < 0.001) continue
          // The two points where the circles cross, then the arc of the held
          // region between them: the part it shares with that one.
          const t = (d * d - b.r * b.r + a.r * a.r) / (2 * d)
          const h = Math.sqrt(Math.max(0, a.r * a.r - t * t))
          const ux = (b.x - a.x) / d
          const uy = (b.y - a.y) / d
          const mx = a.x + ux * t
          const my = a.y + uy * t
          const p1 = { x: mx - uy * h, y: my + ux * h }
          const p2 = { x: mx + uy * h, y: my - ux * h }
          const a1 = Math.atan2(p1.y - a.y, p1.x - a.x)
          const a2 = Math.atan2(p2.y - a.y, p2.x - a.x)
          ctx.strokeStyle = rgba(signal, 0.45 * strength)
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(a.x, a.y, a.r, Math.min(a1, a2), Math.max(a1, a2))
          ctx.stroke()
        }
      }

      // ---- the platform, in the overlap ----
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 0.5)
      halo.addColorStop(0, rgba(signal, 0.22))
      halo.addColorStop(1, rgba(signal, 0))
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(cx, cy, unit * 0.5, 0, Math.PI * 2)
      ctx.fill()

      // Drawn as a small square, the way every other scene here draws the
      // platform's own surfaces.
      ctx.strokeStyle = rgba(signal, 0.7)
      ctx.lineWidth = 1.6
      ctx.strokeRect(cx - 5, cy - 5, 10, 10)
    },
    dispose() {
      untrack()
      regions.length = 0
    },
  }
}

export function CoverageBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--coverage', className)} aria-hidden />
}
