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
 * Two rings, shaking hands.
 *
 * Written for `/technology/integrations`. The inner ring is the platform, the
 * outer ring is everything it connects to, and they turn in opposite
 * directions. Every so often an outer node and an inner node reach for each
 * other: a line springs between them, holds while the handshake completes,
 * then lets go. Several are always in flight at different stages, so the band
 * reads as a switchboard rather than an illustration of one.
 *
 * **Pointer:** nodes near it are pulled off their ring on a spring and come
 * back when it leaves, and any handshake they are holding stretches with them.
 * It is a physical thing rather than a highlight: the connectors follow your
 * hand and the connections stay attached, which is the point being made.
 */

/** Nodes on each ring. */
const OUTER = 26
const INNER = 10

/** Radians per second, opposite directions. */
const OUTER_SPIN = 0.09
const INNER_SPIN = -0.16

/** Handshakes in flight, and the three phases of one, in seconds. */
const HANDSHAKES = 6
const REACH_SECONDS = 0.5
const HOLD_SECONDS = 1.5
const RELEASE_SECONDS = 0.7

/** The pointer's pull: reach as a share of the short side, and spring rates. */
const PULL_REACH = 0.17
const PULL_STRENGTH = 0.5
const SPRING = 9
const DAMPING = 0.86

const CENTRE_X = 0.67
const CENTRE_Y = 0.5

type Node = {
  ring: 0 | 1
  index: number
  /** Displacement from the node's place on the ring, and its velocity. */
  dx: number
  dy: number
  vx: number
  vy: number
  x: number
  y: number
}

type Handshake = { outer: number; inner: number; age: number }

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // The band behind these scenes is near-black, so the structural lines read
  // off the mid steel: --steel-700 at a backdrop's alpha composites to within
  // a few levels of the background and disappears.
  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1
  let nextHandshake = 0

  const outer: Node[] = Array.from({ length: OUTER }, (_, index) => ({
    ring: 0,
    index,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    x: 0,
    y: 0,
  }))
  const inner: Node[] = Array.from({ length: INNER }, (_, index) => ({
    ring: 1,
    index,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    x: 0,
    y: 0,
  }))
  const handshakes: Handshake[] = []

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

  const step = (node: Node, homeX: number, homeY: number, dt: number, reach: number) => {
    // Where the pointer would like this node to be.
    let wantX = 0
    let wantY = 0
    if (pointerX >= 0) {
      const d = Math.hypot(homeX + node.dx - pointerX, homeY + node.dy - pointerY)
      if (d < reach) {
        const pull = (1 - d / reach) * PULL_STRENGTH
        wantX = (pointerX - homeX) * pull
        wantY = (pointerY - homeY) * pull
      }
    }
    // A spring toward that displacement, damped — so it follows and settles
    // rather than snapping.
    node.vx += (wantX - node.dx) * SPRING * dt
    node.vy += (wantY - node.dy) * SPRING * dt
    node.vx *= DAMPING
    node.vy *= DAMPING
    node.dx += node.vx * dt * 60 * 0.016
    node.dy += node.vy * dt * 60 * 0.016
    node.x = homeX + node.dx
    node.y = homeY + node.dy
  }

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

      const short = Math.min(width, height)
      const cx = width * CENTRE_X
      const cy = height * CENTRE_Y
      // Width-aware: the band is shallow, so the rings take their size from
      // whichever dimension is actually scarce.
      const outerR = Math.min(width * 0.2, height * 0.44)
      const innerR = outerR * 0.4
      const reach = short * PULL_REACH

      // ---- positions ----
      for (const node of outer) {
        const angle = (node.index / OUTER) * Math.PI * 2 + seconds * OUTER_SPIN
        step(node, cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR, dt, reach)
      }
      for (const node of inner) {
        const angle = (node.index / INNER) * Math.PI * 2 + seconds * INNER_SPIN
        step(node, cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR, dt, reach)
      }

      // ---- the rings themselves, faint ----
      ctx.lineWidth = 1.1
      for (const [radius, alpha] of [
        [outerR, 0.16],
        [innerR, 0.24],
      ] as const) {
        ctx.strokeStyle = rgba(steel, alpha)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // ---- start a handshake ----
      if (seconds > nextHandshake && handshakes.length < HANDSHAKES) {
        nextHandshake = seconds + 0.35
        handshakes.push({
          outer: (Math.random() * OUTER) | 0,
          inner: (Math.random() * INNER) | 0,
          age: 0,
        })
      }

      // ---- handshakes ----
      const total = REACH_SECONDS + HOLD_SECONDS + RELEASE_SECONDS
      for (let i = handshakes.length - 1; i >= 0; i--) {
        const shake = handshakes[i]
        shake.age += dt
        if (shake.age > total) {
          handshakes.splice(i, 1)
          continue
        }

        const a = outer[shake.outer]
        const b = inner[shake.inner]

        // Reach out, hold, let go.
        let extent: number
        let strength: number
        if (shake.age < REACH_SECONDS) {
          extent = shake.age / REACH_SECONDS
          strength = extent
        } else if (shake.age < REACH_SECONDS + HOLD_SECONDS) {
          extent = 1
          strength = 1
        } else {
          const t = (shake.age - REACH_SECONDS - HOLD_SECONDS) / RELEASE_SECONDS
          extent = 1
          strength = 1 - t
        }

        const eased = extent * extent * (3 - 2 * extent)
        const tipX = a.x + (b.x - a.x) * eased
        const tipY = a.y + (b.y - a.y) * eased

        ctx.strokeStyle = rgba(mixRgb(steel, signal, strength), 0.3 + strength * 0.6)
        ctx.lineWidth = 1.3 + strength * 1.9
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(tipX, tipY)
        ctx.stroke()

        // While held, both ends carry a pip — the connection is live.
        if (strength > 0.9) {
          for (const point of [a, b]) {
            const halo = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 18)
            halo.addColorStop(0, rgba(signal, 0.3))
            halo.addColorStop(1, rgba(signal, 0))
            ctx.fillStyle = halo
            ctx.beginPath()
            ctx.arc(point.x, point.y, 18, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = rgba(signal, 0.7)
            ctx.beginPath()
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      // ---- nodes ----
      for (const node of outer) {
        const displaced = Math.min(1, Math.hypot(node.dx, node.dy) / (reach * 0.5))
        ctx.fillStyle = rgba(mixRgb(steel, signal, displaced), 0.45 + displaced * 0.45)
        ctx.beginPath()
        ctx.arc(node.x, node.y, 3.4, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const node of inner) {
        const displaced = Math.min(1, Math.hypot(node.dx, node.dy) / (reach * 0.5))
        // The platform's own ring is signal-side even at rest.
        ctx.fillStyle = rgba(mixRgb(signal, [255, 255, 255], displaced * 0.5), 0.85)
        ctx.beginPath()
        ctx.arc(node.x, node.y, 4.2, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    dispose() {
      untrack()
      handshakes.length = 0
    },
  }
}

export function HandshakeBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--handshake', className)} aria-hidden />
  )
}
