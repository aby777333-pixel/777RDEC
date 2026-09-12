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
 * Regions, and the traffic between them.
 *
 * Written for `/technology/infrastructure`, where the subject is that the
 * thing runs in more than one place. A wireframe globe turns; five regions sit
 * on it at real coordinates; and pulses travel between them along great-circle
 * arcs — the actual shortest path over a sphere, which is why the arcs bow
 * rather than run straight.
 *
 * Everything is projected orthographically and clipped by hand: a region on
 * the far side of the globe is hidden, and an arc fades as it goes round the
 * back. That hiding is what makes a wireframe read as a sphere rather than as
 * a circle full of lines.
 *
 * **Pointer:** it chooses the origin. The region nearest the pointer becomes
 * the source and every pulse leaves from there, so moving across the band
 * re-routes the whole map. Untouched, the origin rotates between regions on
 * its own.
 */

/** Meridians and parallels. */
const MERIDIANS = 14
const PARALLELS = 8
/** Degrees per second. */
const SPIN = 5.5
/** The globe is tilted so the parallels read as curves. */
const TILT = (-18 * Math.PI) / 180

/** Regions, as [latitude, longitude] in degrees. Real places, roughly. */
const REGIONS: readonly (readonly [number, number])[] = [
  [40.7, -74], // New York
  [51.5, -0.1], // London
  [1.35, 103.8], // Singapore
  [-33.9, 151.2], // Sydney
  [25.2, 55.3], // Dubai
]

/** Pulses in flight and how long each takes. */
const PULSES = 7
const PULSE_SECONDS = 2.1
/** Seconds before the origin moves on when nobody is pointing. */
const ORIGIN_HOLD = 3.4

const CENTRE_X = 0.68
const CENTRE_Y = 0.5

type Vec3 = [number, number, number]
type Pulse = { from: number; to: number; t: number }

function onSphere(latitude: number, longitude: number): Vec3 {
  const phi = (latitude * Math.PI) / 180
  const lambda = (longitude * Math.PI) / 180
  return [Math.cos(phi) * Math.cos(lambda), Math.sin(phi), Math.cos(phi) * Math.sin(lambda)]
}

/** Great-circle interpolation: the path a signal would actually take. */
function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  if (omega < 1e-4) return a
  const s = Math.sin(omega)
  const wa = Math.sin((1 - t) * omega) / s
  const wb = Math.sin(t * omega) / s
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb]
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // The band behind these scenes is near-black, so the structural lines read
  // off the mid steel: --steel-700 at a backdrop's alpha composites to within
  // a few levels of the background and disappears.
  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const up = tokenRgb(host, '--up', [52, 211, 153])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let origin = 0
  let nextOrigin = 0
  let nextPulse = 0
  let last = -1

  const pulses: Pulse[] = []
  const home = REGIONS.map(([lat, lon]) => onSphere(lat, lon))

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

      // The band is wide and shallow; its height is the constraint.
      const radius = Math.min(width * 0.2, height * 0.42)
      const cx = width * CENTRE_X
      const cy = height * CENTRE_Y
      const yaw = (seconds * SPIN * Math.PI) / 180

      /** World space to screen, plus whether the point faces the viewer. */
      const project = (v: Vec3) => {
        const x1 = v[0] * Math.cos(yaw) - v[2] * Math.sin(yaw)
        const z1 = v[0] * Math.sin(yaw) + v[2] * Math.cos(yaw)
        const y1 = v[1] * Math.cos(TILT) - z1 * Math.sin(TILT)
        const z2 = v[1] * Math.sin(TILT) + z1 * Math.cos(TILT)
        return { x: cx + x1 * radius, y: cy - y1 * radius, front: z2 > 0, depth: z2 }
      }

      // ---- the wireframe ----
      ctx.lineWidth = 1
      for (let m = 0; m < MERIDIANS; m++) {
        const lon = (m / MERIDIANS) * 360
        ctx.beginPath()
        let drawing = false
        for (let lat = -90; lat <= 90; lat += 6) {
          const p = project(onSphere(lat, lon))
          // Only the near half is drawn, which is what gives it volume.
          if (!p.front) {
            drawing = false
            continue
          }
          if (drawing) ctx.lineTo(p.x, p.y)
          else {
            ctx.moveTo(p.x, p.y)
            drawing = true
          }
        }
        ctx.strokeStyle = rgba(steel, 0.22)
        ctx.stroke()
      }
      for (let p = 1; p < PARALLELS; p++) {
        const lat = -90 + (p / PARALLELS) * 180
        ctx.beginPath()
        let drawing = false
        for (let lon = 0; lon <= 360; lon += 6) {
          const point = project(onSphere(lat, lon))
          if (!point.front) {
            drawing = false
            continue
          }
          if (drawing) ctx.lineTo(point.x, point.y)
          else {
            ctx.moveTo(point.x, point.y)
            drawing = true
          }
        }
        ctx.strokeStyle = rgba(steel, 0.15)
        ctx.stroke()
      }

      // ---- which region is the origin ----
      const screens = home.map(project)
      if (pointerX >= 0) {
        let best = origin
        let bestD = Infinity
        for (let i = 0; i < screens.length; i++) {
          if (!screens[i].front) continue
          const d = Math.hypot(screens[i].x - pointerX, screens[i].y - pointerY)
          if (d < bestD) {
            bestD = d
            best = i
          }
        }
        origin = best
      } else if (seconds > nextOrigin) {
        nextOrigin = seconds + ORIGIN_HOLD
        // Walk to the next region that is actually visible.
        for (let step = 1; step <= REGIONS.length; step++) {
          const candidate = (origin + step) % REGIONS.length
          if (screens[candidate].front) {
            origin = candidate
            break
          }
        }
      }

      // ---- dispatch ----
      if (seconds > nextPulse) {
        nextPulse = seconds + 0.42
        const to = Math.floor(Math.random() * REGIONS.length)
        if (to !== origin) {
          pulses.push({ from: origin, to, t: 0 })
          if (pulses.length > PULSES) pulses.shift()
        }
      }

      // ---- arcs ----
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i]
        pulse.t += dt / PULSE_SECONDS
        if (pulse.t >= 1) {
          pulses.splice(i, 1)
          continue
        }

        const a = home[pulse.from]
        const b = home[pulse.to]

        // The travelled part of the arc, drawn as a fading trail.
        ctx.lineWidth = 2.1
        const steps = 26
        for (let s = 1; s <= steps; s++) {
          const t1 = (s / steps) * pulse.t
          const t0 = ((s - 1) / steps) * pulse.t
          const p0 = project(slerp(a, b, t0))
          const p1 = project(slerp(a, b, t1))
          if (!p0.front || !p1.front) continue
          // Older parts of the trail are dimmer, and so is anything near the limb.
          const age = s / steps
          ctx.strokeStyle = rgba(signal, 0.8 * age * Math.min(1, p1.depth * 3))
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.stroke()
        }

        const headPoint = project(slerp(a, b, pulse.t))
        if (headPoint.front) {
          ctx.fillStyle = rgba(signal, 0.9)
          ctx.beginPath()
          ctx.arc(headPoint.x, headPoint.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // ---- regions ----
      for (let i = 0; i < screens.length; i++) {
        const p = screens[i]
        if (!p.front) continue
        const isOrigin = i === origin
        const colour = isOrigin ? up : signal
        // A ring that breathes, so a region looks live rather than plotted.
        const beat = 0.5 + 0.5 * Math.sin(seconds * 2 + i)
        const ring = (isOrigin ? 7 : 4.5) + beat * (isOrigin ? 4 : 2)
        ctx.strokeStyle = rgba(colour, (isOrigin ? 0.5 : 0.3) * (1 - beat * 0.4))
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(p.x, p.y, ring, 0, Math.PI * 2)
        ctx.stroke()

        // A little mass under each region, or a 2px dot on a wide band is
        // a dust speck rather than a data centre.
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, isOrigin ? 26 : 16)
        halo.addColorStop(0, rgba(colour, isOrigin ? 0.34 : 0.2))
        halo.addColorStop(1, rgba(colour, 0))
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, isOrigin ? 26 : 16, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = rgba(colour, 0.95)
        ctx.beginPath()
        ctx.arc(p.x, p.y, isOrigin ? 4 : 2.8, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    dispose() {
      untrack()
      pulses.length = 0
    },
  }
}

export function RegionsBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--regions', className)} aria-hidden />
}
