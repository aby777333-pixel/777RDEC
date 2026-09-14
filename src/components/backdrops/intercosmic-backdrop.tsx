'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'
import { motionIsReduced } from './motion'

/**
 * "InterCosmic" by tmrDevelops, ported.
 * https://codepen.io/tmrDevelops/pen/pJzKoM
 *
 * Seven hundred discs on the shell of a sphere as wide as the band is tall,
 * each at a fixed latitude and half of them turning one way round it, half the
 * other. They are drawn far to near with additive blending on a deep blue
 * ground laid over at four fifths each frame, so where the two currents cross
 * they burn brighter. Each disc is dark on its own — reds, plums, a little
 * blue — and the sphere's light is only ever the sum of them.
 *
 * The pointer is the whole of its control. Across, it sets the spin: at the
 * middle the currents stop, and towards either edge they run faster, one way on
 * the left and the other on the right. Down, it flies the sphere towards you — from the top it hangs far
 * off, and lower down it comes on until you are inside the shell with the discs
 * sweeping past. Leave, and it stays wherever you left it, as the pen does.
 *
 * The count, the radius and focal length, the disc size, the colour ranges, the
 * ground and its fade, the blending, the depth sort and cull, the spin and zoom
 * formulas, and the resting pointer at the top-left corner are the pen's,
 * values included.
 *
 * What changed:
 *
 * - **The pointer is the hero's.** The pen reads the mouse over its window;
 *   here the same, over this band, and a touch drag does what a swipe did.
 * - **Its size follows the band.** The pen sizes itself once to the window,
 *   and its resize handler throws before it changes anything; here the canvas,
 *   the sphere and the focal length follow the band, and the pointer keeps its
 *   place in it as a share of the width and height.
 * - **Its clock.** The pen turns everything a fixed step per frame; here those
 *   steps are taken at its 60 a second, whatever the screen's rate.
 * - **Its pixels.** The pen's canvas is window-sized in backing pixels; here it
 *   is the band's size in CSS pixels, drawn at the screen's density.
 * - **A still band is a composed one.** With motion reduced there is one frame,
 *   drawn after the ground has settled from its first lighter fill.
 */

const NUM = 700
const SIZE = 15
/** The pen's ground: filled once at 15% lightness, then faded to 5% each frame. */
const FIRST_GROUND = 'hsla(217, 35%, 15%, 1)'
const GROUND = 'hsla(217, 35%, 5%, .8)'
const STEP_RATE = 60
const MAX_STEPS = 4
/** Steps run before a reduced-motion band's only frame. */
const STILL_STEPS = 30

type Part = {
  x: number
  y: number
  z: number
  dx: number
  dy: number
  phi: number
  t: number
  col: string
  dir: number
}

function rndCol() {
  const r = Math.floor(Math.random() * 180)
  const g = Math.floor(Math.random() * 60)
  const b = Math.floor(Math.random() * 100)
  return `rgb(${r},${g},${b})`
}

function part(): Part {
  // The pen draws a colour on both branches of its coin toss; only the
  // direction differs.
  const dir = Math.random() < 0.5 ? 1 : -1
  return {
    x: 0,
    y: 0,
    z: 0,
    dx: Math.random() * Math.PI,
    dy: 0,
    phi: Math.random() * Math.PI * 2,
    t: Math.random() * Math.PI,
    col: rndCol(),
    dir,
  }
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const $ = canvas.getContext('2d')
  if (!$) return null

  let w = Math.max(1, host.clientWidth)
  let h = Math.max(1, host.clientHeight)
  let rad = h
  let len = h / 2
  /** The pointer as a share of the band; the pen starts it at the corner. */
  let msX = 0
  let msY = 0

  const arr: Part[] = Array.from({ length: NUM }, part)

  const upd = (p: Part) => {
    const mx = msX * w
    const my = msY * h
    const m = (w / 2 - mx) / w / 10
    p.phi += (p.dy + m) * p.dir
    p.t = p.dx

    p.x = rad * Math.sin(p.t) * Math.cos(p.phi)
    p.y = rad * Math.cos(p.t)
    p.z = rad * Math.sin(p.t) * Math.sin(p.phi) + ((rad / 2) * (h / 1.2 - my)) / h * 4
  }

  const draw = (p: Part) => {
    const s = len / (len + p.z)
    const x = w / 2 + p.x * s
    const y = h / 2 + p.y * s

    $.fillStyle = p.col

    if (p.z > -rad / 2) {
      $.beginPath()
      $.arc(x, y, Math.ceil(SIZE * s), 0, Math.PI * 2, false)
      $.fill()
    }
  }

  /** One of the pen's frames. */
  const go = () => {
    $.globalCompositeOperation = 'source-over'
    $.fillStyle = GROUND
    $.fillRect(0, 0, w, h)
    $.globalCompositeOperation = 'lighter'
    arr.sort((p1, p2) => p2.z - p1.z)

    for (const p of arr) {
      upd(p)
      draw(p)
    }
  }

  const untrack = trackPointer(host, (nx, ny) => {
    msX = nx
    msY = ny
  })

  let stepsTaken = -1

  return {
    resize(width, height, dpr) {
      w = width
      h = height
      rad = h
      len = h / 2
      $.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Resizing wipes the canvas to transparent; start again from the pen's
      // first ground.
      $.globalCompositeOperation = 'source-over'
      $.fillStyle = FIRST_GROUND
      $.fillRect(0, 0, w, h)
    },
    frame(seconds) {
      if (stepsTaken < 0 && motionIsReduced()) {
        for (let i = 0; i < STILL_STEPS; i++) go()
      }

      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < steps; i++) go()
    },
    dispose() {
      untrack()
      arr.length = 0
    },
  }
}

export function IntercosmicBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--intercosmic', className)} aria-hidden />
  )
}
