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
 * Requests going out, responses coming back.
 *
 * Written for `/technology/api`. An API page's subject is the round trip, so
 * the band is two curves: requests running left to right along the upper one,
 * responses returning along the lower. Each packet leaves a tail, and each
 * response leaves the far end only after its request has arrived — so what
 * crosses the band is always a pair, and the gap between them is the work
 * being done.
 *
 * A few of them fail. One request in nine turns amber at the far end and comes
 * back short, which is the honest picture of an integration and quietly more
 * interesting than a band where everything always succeeds.
 *
 * The left third is erased under a gradient once the frame is drawn, so the
 * traffic fades into view rather than running across the headline. It is one
 * composite at the end rather than a per-element alpha, which keeps the
 * geometry honest: the packets really do cross the whole band, they are just
 * not shown doing it over the copy.
 *
 * **Pointer:** it is a scrub head. Packets within reach of it slow down and
 * the nearest one opens — a pair of brackets drawn around it, the shape of the
 * payload it is carrying. Take the pointer away and the traffic resumes full
 * speed. The brackets are drawn as strokes rather than set as text, because a
 * backdrop that puts words behind a headline is competing with it.
 */

/** Packets in flight, and how long a crossing takes. */
const PACKETS = 7
const CROSS_SECONDS = 3.4
/** One in this many comes back as a failure. */
const FAILURE_IN = 9

/** How close the pointer must be to slow a packet, as a share of the band. */
const REACH = 0.16
/** The slowest a scrubbed packet runs, as a fraction of full speed. */
const SLOWEST = 0.12

type Packet = {
  /** 0 outbound, 1 returning. */
  leg: 0 | 1
  t: number
  failed: boolean
  seed: number
}

/** A point on a cubic bezier. */
function bezier(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): [number, number] {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ]
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // The band behind these scenes is near-black, so the structural lines read
  // off the mid steel: --steel-700 at a backdrop's alpha composites to within
  // a few levels of the background and disappears.
  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const down = tokenRgb(host, '--down', [248, 113, 113])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1

  const packets: Packet[] = []
  for (let i = 0; i < PACKETS; i++) {
    packets.push({
      leg: 0,
      t: i / PACKETS,
      failed: Math.random() * FAILURE_IN < 1,
      seed: Math.random(),
    })
  }

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

  /** The two curves, recomputed on resize rather than per frame. */
  let out: [[number, number], [number, number], [number, number], [number, number]]
  let back: typeof out
  const layout = () => {
    const midY = height * 0.5
    const lift = height * 0.17
    out = [
      [-width * 0.04, midY - lift * 0.2],
      [width * 0.3, midY - lift],
      [width * 0.62, midY - lift * 0.3],
      [width * 1.04, midY - lift * 0.9],
    ]
    back = [
      [width * 1.04, midY + lift * 0.9],
      [width * 0.62, midY + lift * 0.3],
      [width * 0.3, midY + lift],
      [-width * 0.04, midY + lift * 0.2],
    ]
  }
  layout()

  const drawCurve = (
    curve: typeof out,
    colour: [number, number, number],
    alpha: number,
    lineWidth: number,
  ) => {
    ctx.strokeStyle = rgba(colour, alpha)
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(curve[0][0], curve[0][1])
    ctx.bezierCurveTo(curve[1][0], curve[1][1], curve[2][0], curve[2][1], curve[3][0], curve[3][1])
    ctx.stroke()
  }

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      layout()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : Math.min(0.05, seconds - last)
      last = seconds

      ctx.clearRect(0, 0, width, height)

      // The pipes themselves, faint.
      drawCurve(out, steel, 0.2, 1.4)
      drawCurve(back, steel, 0.14, 1.4)

      const reach = Math.min(width, height) * REACH

      for (const packet of packets) {
        const curve = packet.leg === 0 ? out : back
        const [x, y] = bezier(packet.t, curve[0], curve[1], curve[2], curve[3])

        // How much the scrub head is holding this packet up.
        const distance = pointerX < 0 ? Infinity : Math.hypot(x - pointerX, y - pointerY)
        const held = distance < reach ? 1 - distance / reach : 0
        const speed = 1 - held * (1 - SLOWEST)

        packet.t += (dt / CROSS_SECONDS) * speed
        if (packet.t >= 1) {
          packet.t = 0
          if (packet.leg === 0) {
            packet.leg = 1
          } else {
            packet.leg = 0
            // A new request is a new roll of the dice.
            packet.failed = Math.random() * FAILURE_IN < 1
            packet.seed = Math.random()
          }
        }

        const failing = packet.leg === 1 && packet.failed
        const colour = failing ? down : packet.leg === 0 ? signal : mixRgb(steel, signal, 0.7)

        // ---- tail ----
        const tailSteps = 12
        ctx.lineWidth = 2.2
        for (let i = 1; i <= tailSteps; i++) {
          const t0 = Math.max(0, packet.t - i * 0.012)
          const t1 = Math.max(0, packet.t - (i - 1) * 0.012)
          if (t0 === t1) continue
          const [x0, y0] = bezier(t0, curve[0], curve[1], curve[2], curve[3])
          const [x1, y1] = bezier(t1, curve[0], curve[1], curve[2], curve[3])
          ctx.strokeStyle = rgba(colour, 0.75 * (1 - i / tailSteps))
          ctx.beginPath()
          ctx.moveTo(x0, y0)
          ctx.lineTo(x1, y1)
          ctx.stroke()
        }

        // ---- the packet ----
        const size = 2.4 + held * 1.6
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 20 + held * 16)
        glow.addColorStop(0, rgba(colour, 0.4 + held * 0.25))
        glow.addColorStop(1, rgba(colour, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, 20 + held * 16, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = rgba(colour, 0.95)
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // ---- held open: brackets around the payload ----
        if (held > 0.25) {
          const open = (held - 0.25) / 0.75
          const gap = 12 + open * 16
          const tall = 9 + open * 12
          ctx.strokeStyle = rgba(colour, 0.5 * open)
          ctx.lineWidth = 1.4
          for (const side of [-1, 1]) {
            const bx = x + side * gap
            ctx.beginPath()
            // A bracket: a vertical with two returns, drawn rather than typed.
            ctx.moveTo(bx + side * -3, y - tall)
            ctx.lineTo(bx, y - tall)
            ctx.lineTo(bx, y + tall)
            ctx.lineTo(bx + side * -3, y + tall)
            ctx.stroke()
          }
          // The payload as three rows of varying width — a shape, not words.
          ctx.strokeStyle = rgba(colour, 0.32 * open)
          ctx.lineWidth = 1.2
          for (let row = -1; row <= 1; row++) {
            const rowWidth = (4 + ((packet.seed * 97 + row * 31) % 5)) * open
            ctx.beginPath()
            ctx.moveTo(x - rowWidth, y + row * 4.5)
            ctx.lineTo(x + rowWidth, y + row * 4.5)
            ctx.stroke()
          }
        }
      }

      // ---- fade the copy side out ----
      const veil = ctx.createLinearGradient(0, 0, width * 0.56, 0)
      veil.addColorStop(0, 'rgba(0,0,0,1)')
      veil.addColorStop(0.52, 'rgba(0,0,0,1)')
      veil.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = veil
      ctx.fillRect(0, 0, width * 0.56, height)
      ctx.globalCompositeOperation = 'source-over'
    },
    dispose() {
      untrack()
      packets.length = 0
    },
  }
}

export function RiverBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--river', className)} aria-hidden />
}
