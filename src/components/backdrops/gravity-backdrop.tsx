'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Gravitation Explosion" by GabbeV, ported.
 * https://codepen.io/GabbeV/pen/DMRPox
 *
 * A hundred particles a second thrown from the pointer and then pulled back to
 * it by inverse-square gravity, so each one flies out, swings round and falls
 * into orbit. They alternate: a fine white spark, then a fat ember somewhere
 * between red and orange. Velocity is damped a percent a frame and so is
 * alpha, which is what turns the stream into a comet's tail rather than a
 * crowd, and the oldest are dropped once seven hundred are alive.
 *
 * The particles, the gravity, the spawn rate, the damping, the two types and
 * their colours are the pen's, values included.
 *
 * Its nature is that it answers to the pointer, and it does: the swarm forms
 * wherever the pointer is in the band, and follows it.
 *
 * What is not kept is the pen's idle state. When the pointer leaves its canvas
 * the pen stops spawning and switches gravity off, so the swarm flies apart
 * and the screen empties. That reads correctly when the canvas *is* the
 * window — the pointer leaving means the visitor has gone — but this canvas is
 * a band a few hundred pixels tall that the pointer is outside of almost all
 * the time. Taken literally it emptied the hero and left it empty. So the
 * swarm eases back to its resting place and keeps turning there instead, and
 * the band is alive whether or not anyone is pointing at it.
 *
 * That resting place is right of centre rather than the middle of the window,
 * because the middle of this band is under the headline.
 */

/** The pen's gravity constant, spawn interval in ms, and particle ceiling. */
const GRAVITY = 10
const SPAWN_INTERVAL = 10
const MAX_PARTICLES = 700

/** Where the swarm rests when the pointer is elsewhere, 0..1 of the band. */
const REST_X = 0.66
const REST_Y = 0.5
/** How quickly it drifts back there, per frame. */
const RETURN_EASE = 0.02

type Particle = {
  x: number
  y: number
  xv: number
  yv: number
  colour: string
  size: number
  alpha: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let mouseX = width * REST_X
  let mouseY = height * REST_Y
  let away = true
  let type = 0
  let spawnTimer = 0
  let last = -1

  const particles: Particle[] = []

  const untrack = trackPointer(
    host,
    (nx, ny) => {
      mouseX = nx * width
      mouseY = ny * height
      away = false
    },
    () => {
      away = true
    },
  )

  /** The pen's two kinds, alternating: a white spark, then a hot ember. */
  const spawn = () => {
    type = type ? 0 : 1
    particles.push({
      x: mouseX,
      y: mouseY,
      xv: type ? 18 * Math.random() - 9 : 24 * Math.random() - 12,
      yv: type ? 18 * Math.random() - 9 : 24 * Math.random() - 12,
      colour: type
        ? 'rgb(255,' + ((200 * Math.random()) | 0) + ',' + ((80 * Math.random()) | 0) + ')'
        : 'rgb(255,255,255)',
      size: type ? 5 + 10 * Math.random() : 1,
      alpha: 1,
    })
  }

  return {
    resize(w, h, dpr) {
      // Hold the swarm's place in the band through a resize rather than
      // snapping it to a stale pixel.
      mouseX = width ? (mouseX / width) * w : w * REST_X
      mouseY = height ? (mouseY / height) * h : h * REST_Y
      width = w
      height = h
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      if (away) {
        // Ease home rather than snap, so a pointer leaving the band hands the
        // swarm back to its corner instead of teleporting it.
        mouseX += (width * REST_X - mouseX) * RETURN_EASE
        mouseY += (height * REST_Y - mouseY) * RETURN_EASE
      }

      // The pen integrates in whole frames at whatever rate it is given; this
      // is the same step, with the clock reset when the band comes back on
      // screen and hands it a jump.
      const dtMs = last < 0 || seconds < last ? SPAWN_INTERVAL : (seconds - last) * 1000
      last = seconds

      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.colour
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // The pen's own guard: a long frame spawns at most a hundred
      // milliseconds' worth rather than a thousand particles at once.
      spawnTimer += dtMs < 100 ? dtMs : 100
      for (; spawnTimer > 0; spawnTimer -= SPAWN_INTERVAL) spawn()

      const overflow = particles.length - MAX_PARTICLES
      if (overflow > 0) particles.splice(0, overflow)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const d2 = dx * dx + dy * dy
        // Close in, gravity is held at its value 10px out, so a particle
        // passing through the centre is flung rather than sent to infinity.
        const a = d2 > 100 ? GRAVITY / d2 : GRAVITY / 100
        p.xv = (p.xv + a * dx) * 0.99
        p.yv = (p.yv + a * dy) * 0.99
        p.x += p.xv
        p.y += p.yv
        p.alpha *= 0.99
      }
    },
    dispose() {
      untrack()
      particles.length = 0
    },
  }
}

export function GravityBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.5 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--gravity', className)} aria-hidden />
}
