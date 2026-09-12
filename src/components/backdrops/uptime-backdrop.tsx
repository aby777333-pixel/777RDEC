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
 * Five components, each with its own pulse.
 *
 * Written for `/developers/status`, whose whole use is telling you whether the
 * problem is yours or ours. So the band is five traces, one per component, each
 * beating on its own period — and when something goes wrong it goes wrong in
 * one lane. The other four keep their rhythm, which is the answer the page
 * exists to give.
 *
 * An incident is a real state change rather than a colour: the beat goes
 * irregular and amber while a component is degraded, and flat and red while it
 * is down. The trace scrolls, so the incident stays on the band and walks left
 * out of it — you can see how long ago it was, not only that it happened.
 *
 * Under each lane is the same history as a row of blocks, one per interval,
 * coloured by what that component was doing then.
 *
 * **Pointer:** its vertical position picks a component. That lane's trace
 * doubles in height and brightens and its history comes forward, so one
 * component can be read closely while the rest stay in view beside it.
 */

/** Components, samples held per lane, and how often one is taken. */
const LANES = 5
const SAMPLES = 150
const SAMPLE_SECONDS = 0.03

/** Each lane's beat period, in seconds. Unequal on purpose. */
const PERIODS = [0.82, 1.15, 0.66, 1.43, 0.95] as const

/** Seconds between incidents, and how long one lasts. */
const INCIDENT_EVERY = 6.5
const INCIDENT_SECONDS = 3.6
/** One incident in this many takes the component down rather than degrading it. */
const OUTAGE_IN = 4

/** History blocks under each lane, and the seconds each one covers. */
const BLOCKS = 22
const BLOCK_SECONDS = 0.9

/**
 * The box, as shares of the band. This page's headline is one long line, so
 * the figure starts well right of it rather than running underneath it.
 */
const LEFT = 0.68
const RIGHT = 0.96
const FIRST_LANE = 0.16
const LANE_GAP = 0.17

type State = 0 | 1 | 2
type Lane = {
  period: number
  state: State
  until: number
  samples: { v: number; s: State }[]
  blocks: State[]
  blockAt: number
  /** Eased selection weight. */
  held: number
}

/**
 * One beat. `phase` runs 0..1 through the period; the spike is short and the
 * rest of the cycle is close to flat, which is what makes it read as a pulse
 * rather than as a wave.
 */
function beat(phase: number, state: State, jitter: number): number {
  if (state === 2) return 0
  const wobble = state === 1 ? jitter : 0
  if (phase < 0.05) return (phase / 0.05) * (0.85 + wobble * 0.5)
  if (phase < 0.12) return (1 - (phase - 0.05) / 0.07) * (0.85 + wobble * 0.5) - 0.22
  if (phase < 0.18) return -0.22 * (1 - (phase - 0.12) / 0.06)
  // A degraded component also picks up a second, smaller beat out of step.
  if (state === 1 && phase > 0.4 && phase < 0.52) {
    return Math.sin(((phase - 0.4) / 0.12) * Math.PI) * 0.34 * (0.5 + wobble)
  }
  return Math.sin(phase * 37) * 0.02
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const up = tokenRgb(host, '--up', [52, 211, 153])
  const warn = tokenRgb(host, '--warn', [251, 191, 36])
  const down = tokenRgb(host, '--down', [248, 113, 113])
  const stateColour = [up, warn, down]

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerY = -1
  let last = -1
  let sampleAt = 0
  let nextIncident = 2.2
  let selection = -1

  const lanes: Lane[] = Array.from({ length: LANES }, (_, i) => ({
    period: PERIODS[i],
    state: 0 as State,
    until: 0,
    // Seeded with a full history so the band arrives already beating.
    samples: Array.from({ length: SAMPLES }, (_, k) => ({
      v: beat((((k * SAMPLE_SECONDS) / PERIODS[i]) % 1 + 1) % 1, 0, 0),
      s: 0 as State,
    })),
    blocks: new Array(BLOCKS).fill(0),
    blockAt: 0,
    held: 0,
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
      const x1 = width * RIGHT
      const step = (x1 - x0) / (SAMPLES - 1)
      const laneY = (i: number) => height * (FIRST_LANE + i * LANE_GAP)
      const baseAmplitude = height * LANE_GAP * 0.34

      // ---- which component is in hand ----
      if (pointerY >= 0) {
        selection = (pointerY * height - laneY(0)) / (height * LANE_GAP)
      } else {
        selection = -1
      }
      for (let i = 0; i < LANES; i++) {
        const wanted = selection < 0 ? 0 : Math.max(0, 1 - Math.abs(i - selection) * 1.4)
        lanes[i].held += (wanted - lanes[i].held) * Math.min(1, 6 * dt)
      }

      // ---- incidents ----
      if (seconds > nextIncident) {
        nextIncident = seconds + INCIDENT_EVERY
        const pick = (Math.random() * LANES) | 0
        if (lanes[pick].state === 0) {
          lanes[pick].state = Math.random() * OUTAGE_IN < 1 ? 2 : 1
          lanes[pick].until = seconds + INCIDENT_SECONDS * (0.7 + Math.random() * 0.6)
        }
      }
      for (const lane of lanes) {
        if (lane.state !== 0 && seconds > lane.until) lane.state = 0
      }

      // ---- sample ----
      while (seconds > sampleAt) {
        sampleAt += SAMPLE_SECONDS
        for (const lane of lanes) {
          const phase = ((sampleAt / lane.period) % 1 + 1) % 1
          lane.samples.shift()
          lane.samples.push({
            v: beat(phase, lane.state, Math.random() - 0.5),
            s: lane.state,
          })
        }
      }
      for (const lane of lanes) {
        if (seconds > lane.blockAt) {
          lane.blockAt = seconds + BLOCK_SECONDS
          lane.blocks.shift()
          lane.blocks.push(lane.state)
        }
      }

      for (let i = 0; i < LANES; i++) {
        const lane = lanes[i]
        const y = laneY(i)
        const held = lane.held
        const amplitude = baseAmplitude * (1 + held)

        // ---- the lane's own baseline ----
        ctx.strokeStyle = rgba(steel, 0.13 + held * 0.12)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x0, y)
        ctx.lineTo(x1, y)
        ctx.stroke()

        // ---- the trace, in runs of one state so a change of colour is a
        // change of state rather than a gradient ----
        let runStart = 0
        while (runStart < SAMPLES - 1) {
          const state = lane.samples[runStart].s
          let runEnd = runStart
          while (runEnd < SAMPLES - 1 && lane.samples[runEnd + 1].s === state) runEnd += 1
          ctx.strokeStyle = rgba(stateColour[state], (state === 0 ? 0.4 : 0.75) + held * 0.25)
          ctx.lineWidth = (state === 0 ? 1.4 : 1.9) + held * 0.8
          ctx.beginPath()
          for (let k = runStart; k <= Math.min(SAMPLES - 1, runEnd + 1); k++) {
            const px = x0 + k * step
            const py = y - lane.samples[k].v * amplitude
            if (k === runStart) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.stroke()
          runStart = runEnd + 1
        }

        // ---- the history ----
        const blockGap = (x1 - x0) / (BLOCKS + 6)
        const blockWidth = blockGap * 0.62
        const blockY = y + amplitude + 7 + held * 3
        const blockHeight = 3 + held * 3
        for (let k = 0; k < BLOCKS; k++) {
          const state = lane.blocks[k]
          // The oldest block is furthest left, so the row reads the same way
          // as the trace above it.
          ctx.fillStyle = rgba(stateColour[state], (state === 0 ? 0.2 : 0.6) + held * 0.25)
          ctx.fillRect(x0 + k * blockGap, blockY, blockWidth, blockHeight)
        }

        // ---- the indicator at the end of the lane ----
        const colour = stateColour[lane.state]
        const size = 4 + held * 2.5
        if (lane.state !== 0 || held > 0.1) {
          const halo = ctx.createRadialGradient(x1 + 12, y, 0, x1 + 12, y, 14 + held * 8)
          halo.addColorStop(0, rgba(colour, 0.3))
          halo.addColorStop(1, rgba(colour, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(x1 + 12, y, 14 + held * 8, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = rgba(colour, 0.55 + held * 0.35)
        ctx.fillRect(x1 + 12 - size / 2, y - size / 2, size, size)
      }
    },
    dispose() {
      untrack()
      lanes.length = 0
    },
  }
}

export function UptimeBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--uptime', className)} aria-hidden />
}
