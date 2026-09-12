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
 * Four small state machines, one of them running.
 *
 * Written for `/developers/docs`, whose argument is that the endpoints are the
 * easy part and the model is what matters — how an instrument is described, how
 * a permission is evaluated, when an order is validated, what an event
 * guarantees. Those are four processes, so the band is four machines: rings of
 * states with the transitions drawn between them.
 *
 * A token walks one machine at a time and each transition lights as it is
 * taken. One transition in the set is guarded, and now and then the guard
 * refuses: the token is thrown back to where it came from along an edge drawn
 * in the down colour. A model with no rejection path in it is a model nobody
 * has tried to integrate against.
 *
 * **Pointer:** it picks the machine — the nearest one starts running and the
 * other three go quiet. Inside that machine, the state nearest the pointer is
 * held open: its outgoing transitions are drawn at full weight, so you can see
 * what one state can actually do.
 */

/** The four machines, by how many states each has. */
const MACHINES = [4, 3, 5, 3] as const
/** Seconds a token takes to cross one transition, and to sit in a state. */
const STEP_SECONDS = 0.55
const DWELL_SECONDS = 0.35
/** One transition in this many is refused by its guard. */
const REFUSE_IN = 6
/** Seconds a machine runs before the next one takes over, when idle. */
const RUN_SECONDS = 4.2

/** The grid the machines sit in, as shares of the band. */
const GRID_LEFT = 0.52
const GRID_RIGHT = 0.96
const GRID_TOP = 0.22
const GRID_BOTTOM = 0.78

type Machine = {
  states: number
  /** Which transition carries the guard, as the index of its origin state. */
  guardAt: number
  /** Eased brightness, so a machine handing over does not blink. */
  live: number
  /** Per-transition decaying light, indexed by origin state. */
  lit: number[]
  /** Light on the refusal edge. */
  refused: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const down = tokenRgb(host, '--down', [248, 113, 113])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1

  /** The machine the token is in, and when it should hand over. */
  let running = 0
  let handover = RUN_SECONDS
  /** The token: which transition it is on, how far along, and its wait. */
  let from = 0
  let to = 1
  let progress = 0
  let dwell = DWELL_SECONDS
  let goingBack = false

  const machines: Machine[] = MACHINES.map((states, i) => ({
    states,
    guardAt: i % states,
    live: i === 0 ? 1 : 0,
    lit: new Array(states).fill(0),
    refused: 0,
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

      const left = width * GRID_LEFT
      const right = width * GRID_RIGHT
      const top = height * GRID_TOP
      const bottom = height * GRID_BOTTOM
      const cellW = (right - left) / 2
      const cellH = (bottom - top) / 2
      const radius = Math.min(cellW, cellH) * 0.44

      const centre = (index: number) => ({
        x: left + cellW * (0.5 + (index % 2)),
        y: top + cellH * (0.5 + Math.floor(index / 2)),
      })
      const statePoint = (index: number, state: number) => {
        const machine = machines[index]
        const angle = (state / machine.states) * Math.PI * 2 - Math.PI / 2
        const c = centre(index)
        return { x: c.x + Math.cos(angle) * radius, y: c.y + Math.sin(angle) * radius }
      }

      // ---- which machine is running ----
      if (pointerX >= 0) {
        let best = running
        let bestD = Infinity
        for (let i = 0; i < machines.length; i++) {
          const c = centre(i)
          const d = Math.hypot(c.x - pointerX, c.y - pointerY)
          if (d < bestD) {
            bestD = d
            best = i
          }
        }
        if (best !== running) {
          running = best
          from = 0
          to = 1 % machines[running].states
          progress = 0
          dwell = DWELL_SECONDS
          goingBack = false
        }
        handover = seconds + RUN_SECONDS
      } else if (seconds > handover) {
        handover = seconds + RUN_SECONDS
        running = (running + 1) % machines.length
        from = 0
        to = 1 % machines[running].states
        progress = 0
        dwell = DWELL_SECONDS
        goingBack = false
      }

      for (let i = 0; i < machines.length; i++) {
        machines[i].live += ((i === running ? 1 : 0) - machines[i].live) * Math.min(1, 4 * dt)
      }

      // ---- the token ----
      const machine = machines[running]
      if (dwell > 0) {
        dwell -= dt
      } else {
        progress += dt / STEP_SECONDS
        if (progress >= 1) {
          progress = 0
          dwell = DWELL_SECONDS
          if (goingBack) {
            // It has arrived back at the state before the guard, so that is
            // where it is now, and the guarded transition is tried again.
            goingBack = false
            from = to
            to = (from + 1) % machine.states
          } else {
            machine.lit[from] = 1
            from = to
            const ahead = (from + 1) % machine.states
            // The guarded transition can refuse, and a refusal sends it back.
            if (from === machine.guardAt && Math.random() * REFUSE_IN < 1) {
              goingBack = true
              machine.refused = 1
              to = (from - 1 + machine.states) % machine.states
            } else {
              to = ahead
            }
          }
        }
      }

      for (const entry of machines) {
        for (let k = 0; k < entry.lit.length; k++) {
          entry.lit[k] = Math.max(0, entry.lit[k] - dt * 0.9)
        }
        entry.refused = Math.max(0, entry.refused - dt * 0.7)
      }

      // ---- the machines ----
      for (let i = 0; i < machines.length; i++) {
        const entry = machines[i]
        const live = entry.live

        // Which state the pointer is holding open, if this is the live one.
        let openState = -1
        if (pointerX >= 0 && i === running) {
          let bestD = radius * 0.9
          for (let s = 0; s < entry.states; s++) {
            const p = statePoint(i, s)
            const d = Math.hypot(p.x - pointerX, p.y - pointerY)
            if (d < bestD) {
              bestD = d
              openState = s
            }
          }
        }

        // ---- transitions ----
        for (let s = 0; s < entry.states; s++) {
          const a = statePoint(i, s)
          const b = statePoint(i, (s + 1) % entry.states)
          const heat = Math.max(entry.lit[s], s === openState ? 0.8 : 0)
          const guarded = s === entry.guardAt
          ctx.strokeStyle = rgba(mixRgb(steel, signal, heat), 0.14 + live * 0.2 + heat * 0.46)
          ctx.lineWidth = 0.9 + heat * 1.8
          if (guarded) ctx.setLineDash([5, 4])
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
          if (guarded) ctx.setLineDash([])
        }

        // ---- the refusal edge, only while it is being taken ----
        if (entry.refused > 0.02) {
          const a = statePoint(i, entry.guardAt)
          const b = statePoint(i, (entry.guardAt - 1 + entry.states) % entry.states)
          ctx.strokeStyle = rgba(down, 0.2 + entry.refused * 0.5)
          ctx.lineWidth = 1.2 + entry.refused
          // Bowed outward so it is visibly a different edge from the forward
          // one it shares its ends with.
          const c = centre(i)
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.quadraticCurveTo(mx + (mx - c.x) * 0.6, my + (my - c.y) * 0.6, b.x, b.y)
          ctx.stroke()
        }

        // ---- states ----
        for (let s = 0; s < entry.states; s++) {
          const p = statePoint(i, s)
          const open = s === openState
          const size = 3 + live * 1.4 + (open ? 2 : 0)
          ctx.strokeStyle = rgba(
            mixRgb(steel, signal, live * 0.5 + (open ? 0.5 : 0)),
            0.36 + live * 0.4,
          )
          ctx.lineWidth = 1.3
          ctx.beginPath()
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // ---- the token itself ----
      const a = statePoint(running, from)
      const b = statePoint(running, to)
      const eased = dwell > 0 ? 0 : progress * progress * (3 - 2 * progress)
      const tx = a.x + (b.x - a.x) * eased
      const ty = a.y + (b.y - a.y) * eased
      const colour = goingBack ? down : signal

      const halo = ctx.createRadialGradient(tx, ty, 0, tx, ty, 20)
      halo.addColorStop(0, rgba(colour, 0.4))
      halo.addColorStop(1, rgba(colour, 0))
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(tx, ty, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = rgba(colour, 0.95)
      ctx.beginPath()
      ctx.arc(tx, ty, 3, 0, Math.PI * 2)
      ctx.fill()
    },
    dispose() {
      untrack()
      machines.length = 0
    },
  }
}

export function MachinesBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--machines', className)} aria-hidden />
}
