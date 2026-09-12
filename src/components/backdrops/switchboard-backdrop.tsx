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
 * Four transports, one model.
 *
 * Written for `/developers/api`, and it is the page's sentence drawn rather
 * than illustrated. Four lanes run into one spine on the right, and each lane
 * carries the traffic its transport actually has:
 *
 * - request and response, a pair at a time, with a wait between them
 * - a stream that never stops
 * - tight equal-spaced bursts, each closed by a checksum tick
 * - sparse pushes that leave from the spine rather than arrive at it
 *
 * Where each lane meets the spine the arriving traffic resolves into the same
 * three-rule glyph, identical in all four — which is the second half of the
 * claim, and the half a diagram of four boxes would not make.
 *
 * **Pointer:** its vertical position picks a lane. That transport brightens
 * and runs faster, the other three recede, and its glyph on the spine opens
 * up. Run the pointer down the band and you hear each transport's rhythm in
 * turn without anything being labelled.
 */

/** The lanes, in the order the page lists them. */
type Kind = 'pair' | 'stream' | 'burst' | 'push'
const LANES: readonly { kind: Kind; period: number }[] = [
  { kind: 'pair', period: 1.7 },
  { kind: 'stream', period: 0.13 },
  { kind: 'burst', period: 2.3 },
  { kind: 'push', period: 1.9 },
]

/** Seconds a packet takes to cross its lane. */
const TRANSIT = 1.5
/** Packets in a burst, and the gap between them in seconds. */
const BURST = 6
const BURST_GAP = 0.07
/** How much faster the selected lane runs. */
const HELD_RATE = 2.2

/** The box, as shares of the band. */
const LEFT = 0.56
const SPINE = 0.9
const FIRST_LANE = 0.2
const LANE_GAP = 0.2

type Packet = {
  /** Position along the lane, 0 at the left, 1 at the spine. */
  u: number
  dir: 1 | -1
  /** The last packet of a burst carries the checksum tick. */
  tick: boolean
}

type Lane = {
  kind: Kind
  period: number
  packets: Packet[]
  next: number
  /** Packets still to come in the current burst, and when the next one is due. */
  burstLeft: number
  burstAt: number
  /** Decaying light on this lane's glyph. */
  pulse: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerY = -1
  let last = -1
  /** Eased selection, 0..LANES.length-1, and how strongly a lane is selected. */
  let selection = 0
  let selecting = 0

  const lanes: Lane[] = LANES.map((spec, i) => ({
    kind: spec.kind,
    period: spec.period,
    // Seeded mid-flight, staggered, so the band is busy the moment it appears.
    packets:
      spec.kind === 'stream'
        ? Array.from({ length: 9 }, (_, k) => ({ u: k / 9, dir: 1 as const, tick: false }))
        : [{ u: 0.3 + i * 0.13, dir: (spec.kind === 'push' ? -1 : 1) as 1 | -1, tick: false }],
    next: 0.4 + i * 0.3,
    burstLeft: 0,
    burstAt: 0,
    pulse: 0,
  }))

  const untrack = trackPointer(
    host,
    (_nx, ny) => {
      pointerY = ny
    },
    () => {
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

      const x0 = width * LEFT
      const x1 = width * SPINE
      const laneY = (i: number) => height * (FIRST_LANE + i * LANE_GAP)

      // ---- which transport is in hand ----
      const pointing = pointerY >= 0
      selecting += ((pointing ? 1 : 0) - selecting) * Math.min(1, 5 * dt)
      if (pointing) {
        const wanted = Math.min(
          LANES.length - 1,
          Math.max(0, (pointerY * height - laneY(0)) / (height * LANE_GAP)),
        )
        selection += (wanted - selection) * Math.min(1, 8 * dt)
      }
      /** How much of the selection this lane holds, 0..1. */
      const holdOf = (i: number) => Math.max(0, 1 - Math.abs(i - selection)) * selecting

      // ---- the spine ----
      ctx.strokeStyle = rgba(steel, 0.3)
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(x1, laneY(0) - height * 0.09)
      ctx.lineTo(x1, laneY(LANES.length - 1) + height * 0.09)
      ctx.stroke()

      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i]
        const y = laneY(i)
        const held = holdOf(i)
        const rate = 1 + held * (HELD_RATE - 1)

        // ---- the lane itself ----
        ctx.strokeStyle = rgba(steel, 0.16 + held * 0.22)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x0, y)
        ctx.lineTo(x1, y)
        ctx.stroke()

        // ---- intake ----
        if (lane.kind === 'burst') {
          if (lane.burstLeft > 0) {
            if (seconds > lane.burstAt) {
              lane.burstAt = seconds + BURST_GAP / rate
              lane.burstLeft -= 1
              lane.packets.push({ u: 0, dir: 1, tick: lane.burstLeft === 0 })
            }
          } else if (seconds > lane.next) {
            lane.next = seconds + lane.period / rate
            lane.burstLeft = BURST
            lane.burstAt = seconds
          }
        } else if (seconds > lane.next) {
          lane.next = seconds + lane.period / rate
          if (lane.kind === 'push') {
            // A push leaves from the spine: it is the one that starts at the
            // other end, which is the whole difference between a webhook and
            // everything else here.
            lane.packets.push({ u: 1, dir: -1, tick: false })
            lane.pulse = 1
          } else {
            lane.packets.push({ u: 0, dir: 1, tick: false })
          }
        }

        // ---- advance ----
        for (let k = lane.packets.length - 1; k >= 0; k--) {
          const packet = lane.packets[k]
          packet.u += (packet.dir * dt * rate) / TRANSIT
          if (packet.dir === 1 && packet.u >= 1) {
            lane.packets.splice(k, 1)
            lane.pulse = 1
            // A request that arrives is answered: the response is the second
            // half of the pair, and the gap between them is the work.
            if (lane.kind === 'pair') lane.packets.push({ u: 1, dir: -1, tick: false })
          } else if (packet.dir === -1 && packet.u <= 0) {
            lane.packets.splice(k, 1)
          }
        }

        // ---- packets ----
        for (const packet of lane.packets) {
          const x = x0 + (x1 - x0) * packet.u
          const returning = packet.dir === -1
          const colour = returning ? mixRgb(steel, signal, 0.55) : signal
          const alpha = 0.55 + held * 0.4

          // A short tail behind it, pointing the way it came.
          const tail = 16 + held * 10
          const grad = ctx.createLinearGradient(x - packet.dir * tail, y, x, y)
          grad.addColorStop(0, rgba(colour, 0))
          grad.addColorStop(1, rgba(colour, alpha))
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.8 + held
          ctx.beginPath()
          ctx.moveTo(x - packet.dir * tail, y)
          ctx.lineTo(x, y)
          ctx.stroke()

          ctx.fillStyle = rgba(colour, 0.6 + held * 0.4)
          ctx.beginPath()
          ctx.arc(x, y, 1.8 + held * 1.2, 0, Math.PI * 2)
          ctx.fill()

          // The checksum tick that closes a burst.
          if (packet.tick) {
            ctx.strokeStyle = rgba(colour, alpha)
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.moveTo(x, y - 5)
            ctx.lineTo(x, y + 5)
            ctx.stroke()
          }
        }

        // ---- the glyph on the spine ----
        lane.pulse = Math.max(0, lane.pulse - dt * 2.2)
        const open = held
        const halfWidth = 7 + open * 6
        const gap = 3 + open * 1.6
        ctx.lineWidth = 1.4 + open * 0.6
        ctx.strokeStyle = rgba(
          mixRgb(steel, signal, Math.max(lane.pulse, open)),
          0.32 + Math.max(lane.pulse * 0.5, open * 0.5),
        )
        ctx.beginPath()
        for (const [row, shrink] of [
          [-1, 0.9],
          [0, 1],
          [1, 0.6],
        ] as const) {
          ctx.moveTo(x1 + 10, y + row * gap)
          ctx.lineTo(x1 + 10 + halfWidth * 2 * shrink, y + row * gap)
        }
        ctx.stroke()

        if (lane.pulse > 0.02) {
          const glow = 16 + open * 10
          const halo = ctx.createRadialGradient(x1, y, 0, x1, y, glow)
          halo.addColorStop(0, rgba(signal, lane.pulse * 0.3))
          halo.addColorStop(1, rgba(signal, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(x1, y, glow, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    dispose() {
      untrack()
      for (const lane of lanes) lane.packets.length = 0
    },
  }
}

export function SwitchboardBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--switchboard', className)} aria-hidden />
  )
}
