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
 * One market moves. Another market answers.
 *
 * Written for `/intelligence/market`. Six lanes scroll leftward, one per asset
 * class. Every couple of seconds a move originates in whichever lane is
 * leading: a bump appears in its trace. Each other lane carries a strength and
 * a lag, so the answering bump arrives later and smaller — it enters from the
 * right edge, which is the future, and walks into view. An arc connects the
 * move to each answer while both are on the band.
 *
 * One relationship is always broken. Its arc is drawn dashed and in the down
 * colour and its lane never answers, because a page that says it will tell you
 * when a relationship has stopped holding should show one that has.
 *
 * **Pointer:** its vertical position chooses which lane leads. Run it down the
 * band and the whole structure re-forms around a different market — different
 * answers, different lags, a different one sitting broken.
 */

/** Lanes, samples held, and how fast the band scrolls. */
const LANES = 6
const SAMPLES = 110
const SAMPLE_SECONDS = 0.075

/** Seconds between moves. */
const MOVE_EVERY = 3.4

/** The band the lanes are drawn in, as shares of the width. */
const LEFT = 0.48
const RIGHT = 1.0

/** How far right of the band's edge a move is born, in samples. */
const BIRTH = 6
/** How long an arc is kept before it is dropped, in seconds. */
const ARC_LIFE = (SAMPLES + BIRTH + 40) * SAMPLE_SECONDS

type Wavelet = {
  /** Sample index of the peak; decrements as the band scrolls. */
  origin: number
  amp: number
  width: number
  /** Which move this belongs to, so an arc can find its ends. */
  move: number
}

type Lane = {
  /** Strength of this lane's answer to the leader, signed. */
  beta: number
  /** Samples between the move and the answer. */
  lag: number
  wavelets: Wavelet[]
  seed: number
}

type Arc = { move: number; from: number; to: number; broken: boolean; age: number }

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const down = tokenRgb(host, '--down', [248, 113, 113])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerY = -1
  let last = -1
  let phase = 0
  let nextMove = 0.8
  let moveId = 0
  /** Which lane leads, eased so a pointer sweep does not snap between lanes. */
  let leader = 0
  let leaderAim = 0
  /** Which relationship is currently not holding. */
  let broken = 3

  const lanes: Lane[] = Array.from({ length: LANES }, (_, i) => ({
    beta: 0,
    lag: 6 + i * 3,
    wavelets: [],
    seed: Math.random() * 100,
  }))
  const arcs: Arc[] = []

  /** Re-draw the relationships around a new leader. */
  const reseat = (index: number) => {
    for (let i = 0; i < LANES; i++) {
      const distance = Math.abs(i - index)
      // Nearer lanes answer harder, and some answer the other way, which is
      // what a real cross-asset table looks like.
      const sign = (i + index) % 3 === 0 ? -1 : 1
      lanes[i].beta = distance === 0 ? 1 : sign * (0.72 - distance * 0.13)
      lanes[i].lag = distance === 0 ? 0 : 5 + distance * 4 + ((i * 7) % 5)
    }
    let candidate = (index + 2) % LANES
    if (candidate === index) candidate = (index + 1) % LANES
    broken = candidate
  }
  reseat(0)

  /**
   * A move in the leading lane, and the answer to it in every lane that still
   * has a relationship. `origin` is where the move is born in sample space and
   * `age` how long ago it happened, so the same routine can seed a history at
   * load and fire the live ones afterwards.
   */
  const move = (origin: number, age: number) => {
    moveId += 1
    const amp = (Math.random() < 0.5 ? -1 : 1) * (0.62 + Math.random() * 0.3)
    lanes[leader].wavelets.push({ origin, amp, width: 5.5, move: moveId })
    for (let i = 0; i < LANES; i++) {
      if (i === leader) continue
      if (i === broken) {
        arcs.push({ move: moveId, from: leader, to: i, broken: true, age })
        continue
      }
      lanes[i].wavelets.push({
        origin: origin + lanes[i].lag,
        amp: amp * lanes[i].beta,
        // An answer is broader than the move that caused it: it arrives spread
        // out rather than as a matching spike.
        width: 5.5 + lanes[i].lag * 0.22,
        move: moveId,
      })
      arcs.push({ move: moveId, from: leader, to: i, broken: false, age })
    }
  }

  // Moves that already happened, so the band arrives mid-conversation rather
  // than blank for the first few seconds.
  for (const origin of [30, 78]) {
    move(origin, (SAMPLES - origin) * SAMPLE_SECONDS)
  }

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
      const x1 = width * RIGHT
      const step = (x1 - x0) / (SAMPLES - 1)
      const spacing = height / (LANES + 1)
      const amplitude = spacing * 0.5

      const laneY = (index: number) => spacing * (index + 1)
      const sampleX = (index: number) => x0 + (index - phase) * step

      // ---- who leads ----
      const wanted = pointerY >= 0 ? pointerY * (LANES - 1) : (seconds / 5.5) % LANES
      leaderAim = Math.min(LANES - 1, Math.max(0, wanted))
      const settled = Math.round(leaderAim)
      if (settled !== leader) {
        leader = settled
        reseat(leader)
      }

      // ---- scroll ----
      phase += dt / SAMPLE_SECONDS
      while (phase >= 1) {
        phase -= 1
        for (const lane of lanes) {
          for (const w of lane.wavelets) w.origin -= 1
          lane.wavelets = lane.wavelets.filter((w) => w.origin > -10)
        }
      }

      // ---- a move, and the answers to it ----
      if (seconds > nextMove) {
        nextMove = seconds + MOVE_EVERY
        move(SAMPLES + BIRTH, 0)
      }

      /** A lane's deviation at a sample, in lane units. */
      const value = (lane: Lane, index: number) => {
        // A little baseline noise so a quiet lane is not a ruled line.
        let v =
          Math.sin((index + lane.seed) * 0.21) * 0.07 + Math.sin((index + lane.seed) * 0.07) * 0.05
        for (const w of lane.wavelets) {
          const d = (index - w.origin) / w.width
          if (d < -4 || d > 4) continue
          v += w.amp * Math.exp(-d * d)
        }
        return v
      }

      /** Screen point of the peak of one move's wavelet in a lane. */
      const peak = (index: number, id: number) => {
        const lane = lanes[index]
        const w = lane.wavelets.find((entry) => entry.move === id)
        if (!w) return null
        if (w.origin > SAMPLES + 1 || w.origin < -2) return null
        return { x: sampleX(w.origin), y: laneY(index) - value(lane, w.origin) * amplitude }
      }

      // ---- lane baselines ----
      ctx.lineWidth = 1
      for (let i = 0; i < LANES; i++) {
        const isLeader = i === leader
        ctx.strokeStyle = rgba(steel, isLeader ? 0.26 : 0.14)
        ctx.beginPath()
        ctx.moveTo(x0, laneY(i))
        ctx.lineTo(x1, laneY(i))
        ctx.stroke()
      }

      // ---- arcs between the move and its answers ----
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i]
        arc.age += dt
        if (arc.age > ARC_LIFE) {
          arcs.splice(i, 1)
          continue
        }
        const a = peak(arc.from, arc.move)
        if (!a) continue
        const strength = Math.abs(lanes[arc.to].beta)

        if (arc.broken) {
          // The relationship that is not holding: the reach is drawn and
          // stops, in the down colour, dashed.
          // Where the answer would have been: the lag to the right of the
          // move, which is only on the band once that much time has passed.
          const target = { x: a.x + step * lanes[arc.to].lag, y: laneY(arc.to) }
          if (target.x > x1) continue
          ctx.setLineDash([4, 5])
          ctx.strokeStyle = rgba(down, 0.3)
          ctx.lineWidth = 1.1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.quadraticCurveTo((a.x + target.x) / 2, (a.y + target.y) / 2, target.x, target.y)
          ctx.stroke()
          ctx.setLineDash([])
          continue
        }

        const b = peak(arc.to, arc.move)
        if (!b) continue
        ctx.strokeStyle = rgba(signal, 0.14 + strength * 0.34)
        ctx.lineWidth = 1 + strength * 1.4
        ctx.beginPath()
        // Bowed away from the lanes, so several arcs at once stay separable.
        const bow = (b.y - a.y) * 0.5
        ctx.moveTo(a.x, a.y)
        ctx.bezierCurveTo(a.x - step * 2, a.y + bow * 0.4, b.x + step * 2, b.y - bow * 0.4, b.x, b.y)
        ctx.stroke()
      }

      // ---- the traces ----
      for (let i = 0; i < LANES; i++) {
        const lane = lanes[i]
        const isLeader = i === leader
        ctx.strokeStyle = rgba(isLeader ? signal : steel, isLeader ? 0.7 : 0.34)
        ctx.lineWidth = isLeader ? 1.9 : 1.3
        ctx.beginPath()
        for (let s = 0; s < SAMPLES; s++) {
          const x = sampleX(s)
          const y = laneY(i) - value(lane, s) * amplitude
          if (s === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()

        // The moving part of the trace, drawn over the top: a lane is mostly
        // quiet, and what matters is the stretch that is not. Segment by
        // segment, because the brightness follows the size of the deviation.
        ctx.lineWidth = isLeader ? 2.4 : 2
        for (let seg = 1; seg < SAMPLES; seg++) {
          const v0 = value(lane, seg - 1)
          const v1 = value(lane, seg)
          const size = Math.max(Math.abs(v0), Math.abs(v1))
          if (size < 0.16) continue
          ctx.strokeStyle = rgba(signal, Math.min(0.85, (size - 0.16) * 1.5))
          ctx.beginPath()
          ctx.moveTo(sampleX(seg - 1), laneY(i) - v0 * amplitude)
          ctx.lineTo(sampleX(seg), laneY(i) - v1 * amplitude)
          ctx.stroke()
        }

        // A pip on each peak still on the band, so a move and its answers are
        // points rather than only a shape in a line.
        for (const w of lane.wavelets) {
          if (w.origin > SAMPLES - 1 || w.origin < 0) continue
          const x = sampleX(w.origin)
          const y = laneY(i) - value(lane, w.origin) * amplitude
          const weight = Math.min(1, Math.abs(w.amp) * 1.6)
          const halo = ctx.createRadialGradient(x, y, 0, x, y, 14 + weight * 10)
          halo.addColorStop(0, rgba(signal, 0.16 + weight * 0.22))
          halo.addColorStop(1, rgba(signal, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(x, y, 14 + weight * 10, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = rgba(signal, 0.5 + weight * 0.45)
          ctx.beginPath()
          ctx.arc(x, y, 1.8 + weight * 1.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    dispose() {
      untrack()
      arcs.length = 0
      for (const lane of lanes) lane.wavelets.length = 0
    },
  }
}

export function AnswerBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--answer', className)} aria-hidden />
}
