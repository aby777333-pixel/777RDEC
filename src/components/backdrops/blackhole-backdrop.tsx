'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "3d Particle Tunnel" by nicksheffield, ported.
 * https://codepen.io/nicksheffield/pen/ByYvVL
 *
 * A black hole a hundred pixels across circles the middle of the band, two
 * hundred pixels out, a degree a frame. Every frame twenty stars are born on
 * its rim, each thirty-seven degrees round from the last, and fly straight
 * out along the angle they were born at — slowly, then faster every frame,
 * because both the speed and the rate it grows by keep growing. Each is drawn
 * as a white hairline as long as its speed, so a star is a dot as it leaves
 * the rim and a streak by the time it reaches the edge, where it is dropped.
 * Because the hole keeps moving, the streams it left behind bend into a
 * spiralling tunnel that is never in the same place twice.
 *
 * The hole's size, orbit and speed, the spawn count and step, both
 * accelerations, the white on black and the hairline are the pen's, values
 * included. The pen has no pointer and neither does this.
 *
 * What changed, none of it visibly:
 *
 * - **Its clock.** The pen advances one step per animation frame, so it ran
 *   at double speed on a 120Hz screen. Here the simulation steps at the pen's
 *   own 60 a second whatever the screen's rate, and draws the latest step.
 * - **Its pixels.** The pen worked in backing-store pixels, so on a retina
 *   screen the hole shrank to half size. Here sizes are CSS pixels, which is
 *   the pen as it looks on the screen it was written on, and the hairline is
 *   one device pixel wide at any density, which is what the pen drew.
 * - **Its strokes.** The pen strokes every star as its own path, a couple of
 *   thousand calls a frame. They are all the same opaque white, so one path
 *   holding every segment and one stroke draws the same picture.
 * - **Its first seconds.** The pen opens on an empty canvas and fills over two
 *   seconds; this one is run forward before its first frame, so the band
 *   arrives already streaming, and a visitor with motion reduced sees the
 *   tunnel rather than a black band.
 */

/** The pen's settings, in its own words. */
const HOLE_SIZE = 100 // size of the black hole
const ROTATION_DISTANCE = 200 // distance of black hole from canvas center
const ROTATION_SPEED = 1 // degrees of orbit per step
const SPAWN_COUNT = 20 // stars spawned every step
const ROTATION_STEP = 37 // degrees between one star's birthplace and the next

/** The pen's accelerations: speed multiplies by `accel`, which grows by `accel2`. */
const ACCEL = 1.01
const ACCEL2 = 0.001

/** Steps a second — the pen's, one per frame at 60Hz. */
const STEP_RATE = 60
/** Most steps taken for one drawn frame, so a stall catches up rather than spirals. */
const MAX_STEPS = 4
/** Steps run before the first frame. Every star born this long ago has left the band. */
const PREWARM_STEPS = 180

const DEG = Math.PI / 180

type Star = {
  x: number
  y: number
  speed: number
  accel: number
  angle: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let dpr = 1

  let stars: Star[] = []
  /** The hole. `null` until its first placement, as in the pen. */
  let holeX: number | null = null
  let holeY = 0
  let r = 0
  let spawnPos = 0

  /**
   * One frame of the pen: stars are born on the hole where it was, the hole
   * moves on, every star is drawn, and then every star moves and the ones
   * that have left the band are dropped.
   */
  const step = (draw: boolean) => {
    if (holeX !== null) {
      for (let i = 0; i < SPAWN_COUNT; i++) {
        const angle = spawnPos
        spawnPos += ROTATION_STEP
        stars.push({
          x: holeX + HOLE_SIZE * Math.cos(angle * DEG),
          y: holeY + HOLE_SIZE * Math.sin(angle * DEG),
          speed: 1,
          accel: ACCEL,
          angle,
        })
      }
    }

    r += ROTATION_SPEED
    if (r < 360) {
      holeX = width / 2 + ROTATION_DISTANCE * Math.cos(r * DEG)
      holeY = height / 2 + ROTATION_DISTANCE * Math.sin(r * DEG)
    } else {
      // The pen skips moving the hole on the step it wraps.
      r = 0
    }

    if (draw) paint()

    const kept: Star[] = []
    for (const star of stars) {
      star.x += star.speed * Math.cos(star.angle * DEG)
      star.y += star.speed * Math.sin(star.angle * DEG)
      star.speed *= star.accel
      star.accel += ACCEL2
      if (star.x < width && star.x > 0 && star.y < height && star.y > 0) kept.push(star)
    }
    stars = kept
  }

  /** Every star as a hairline as long as its speed, in one stroke. */
  const paint = () => {
    // A pixel wider than the band on every side, so the half-pixel nudge
    // below cannot leave an uncleared sliver along the top and left edges.
    ctx.clearRect(-1, -1, width + 2, height + 2)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1 / dpr
    ctx.beginPath()
    for (const star of stars) {
      ctx.moveTo(star.x, star.y)
      ctx.lineTo(
        star.x + star.speed * Math.cos(star.angle * DEG),
        star.y + star.speed * Math.sin(star.angle * DEG),
      )
    }
    ctx.stroke()
  }

  for (let i = 0; i < PREWARM_STEPS; i++) step(false)

  let stepsTaken = 0
  let drawn = false

  return {
    resize(w, h, nextDpr) {
      width = w
      height = h
      dpr = nextDpr
      // The pen's half-pixel nudge, which puts a one-pixel line on a pixel
      // rather than across two.
      ctx.setTransform(dpr, 0, 0, dpr, 0.5, 0.5)
      // Resizing wipes the canvas, and a paused band gets no next frame.
      if (drawn) paint()
    },
    frame(seconds) {
      const due = Math.floor(seconds * STEP_RATE)
      let steps = due - stepsTaken
      if (steps <= 0) {
        // Between steps on a fast screen the last picture stands — except the
        // very first time, which must put something on the band.
        if (drawn) return
        steps = 1
      }
      if (steps > MAX_STEPS) steps = MAX_STEPS
      stepsTaken = Math.max(due, stepsTaken + steps)
      for (let i = 1; i < steps; i++) step(false)
      step(true)
      drawn = true
    },
    dispose() {
      stars = []
    },
  }
}

export function BlackholeBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--blackhole', className)} aria-hidden />
  )
}
