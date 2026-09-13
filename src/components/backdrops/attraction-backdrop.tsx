'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'
import { motionIsReduced } from './motion'

/**
 * "Explosive Attraction" by natewiley, ported.
 * https://codepen.io/natewiley/pen/yaZLgb
 *
 * Two hundred rings, scattered across the band and fading in, all drawn toward
 * one point — the middle, or wherever the pointer is. Each accelerates as it
 * goes, and the moment it comes within fifty pixels of the point it bursts: it
 * swells two pixels a frame and fades, and after fifty frames it is reborn
 * somewhere at random, in whatever hue the whole field has turned to by then.
 * Nothing is ever cleared; each frame is laid over the last at a fifth of
 * black, so every ring leaves a tail.
 *
 * The count, the sizes, the speeds and accelerations, the burst radius and
 * length, the hue walk, the trail fade and the staggered start — one ring every
 * ten milliseconds — are the pen's, values included.
 *
 * What changed:
 *
 * - **The point is the hero's.** The pen follows the mouse over its window and
 *   returns to the centre when it leaves; here the same, over this band.
 * - **Its clock.** The pen moves everything a fixed step per frame; here those
 *   steps are taken at its 60 a second, whatever the screen's rate.
 * - **Its pixels.** The pen's canvas is window-sized in backing pixels; here it
 *   is the band's size in CSS pixels, drawn at the screen's density.
 * - **A still band is a composed one.** With motion reduced there is only one
 *   frame, and the pen's first frame is one ring on black; so that frame is
 *   the field three seconds in instead.
 */

const MAX = 200
/** Steps run before a reduced-motion band's only frame. */
const STILL_STEPS = 180
/** The pen staggers the rings' births ten milliseconds apart. */
const SPAWN_EVERY = 0.01
const MAX_CHANGED_FRAMES = 50
const BURST_RADIUS = 50
const STEP_RATE = 60
const MAX_STEPS = 4

type Ring = {
  hue: number
  alpha: number
  size: number
  x: number
  y: number
  velocity: number
  changed: boolean
  changedFrame: number
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let point = { x: width / 2, y: height / 2 }
  let hue = 0
  const particles: Ring[] = []

  const init = (p: Ring) => {
    p.hue = hue
    p.alpha = 0
    p.size = random(1, 5)
    p.x = random(0, width)
    p.y = random(0, height)
    p.velocity = p.size * 0.5
    p.changed = false
    p.changedFrame = 0
    return p
  }

  const update = (p: Ring) => {
    if (p.changed) {
      p.alpha *= 0.92
      p.size += 2
      p.changedFrame++
      if (p.changedFrame > MAX_CHANGED_FRAMES) init(p)
    } else if (Math.hypot(point.x - p.x, point.y - p.y) < BURST_RADIUS) {
      p.changed = true
    } else {
      const angle = Math.atan2(point.y - p.y, point.x - p.x)
      p.alpha += 0.01
      p.x += p.velocity * Math.cos(angle)
      p.y += p.velocity * Math.sin(angle)
      p.velocity += 0.02
    }
  }

  /** One of the pen's frames: fade what is there, draw and move every ring. */
  const step = () => {
    ctx.fillStyle = 'rgba(0,0,0, .2)'
    ctx.fillRect(0, 0, width, height)
    for (const p of particles) {
      ctx.strokeStyle = `hsla(${p.hue}, 100%, 50%, ${p.alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI)
      ctx.stroke()
      update(p)
    }
    hue += 0.3
  }

  const untrack = trackPointer(
    host,
    (nx, ny) => {
      point = { x: nx * width, y: ny * height }
    },
    () => {
      point = { x: width / 2, y: height / 2 }
    },
  )

  let stepsTaken = -1

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      point = { x: w / 2, y: h / 2 }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Resizing wipes the canvas to transparent; the pen's ground is black.
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
    },
    frame(seconds) {
      if (stepsTaken < 0 && motionIsReduced()) {
        while (particles.length < MAX) {
          particles.push(
            init({ hue: 0, alpha: 0, size: 0, x: 0, y: 0, velocity: 0, changed: false, changedFrame: 0 }),
          )
        }
        for (let i = 0; i < STILL_STEPS; i++) step()
      }

      // The staggered start, on the band's own clock.
      const born = Math.min(MAX, Math.floor(seconds / SPAWN_EVERY) + 1)
      while (particles.length < born) {
        particles.push(
          init({ hue: 0, alpha: 0, size: 0, x: 0, y: 0, velocity: 0, changed: false, changedFrame: 0 }),
        )
      }

      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < steps; i++) step()
    },
    dispose() {
      untrack()
      particles.length = 0
    },
  }
}

export function AttractionBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--attraction', className)} aria-hidden />
  )
}
