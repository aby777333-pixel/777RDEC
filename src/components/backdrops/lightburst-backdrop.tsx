'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, isInteractiveTarget, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Canvas Light Explosion" by Jack Rugile, ported.
 * https://codepen.io/jackrugile/pen/Xdaavx
 *
 * Five hundred filaments thrown out from one point, each drawing a chord back
 * across its own recent path at a hundredth of full alpha, in a hue that walks
 * as it travels. Nothing is ever cleared. What makes it a light rather than a
 * scribble is the feedback: for the first four hundred and fifty ticks the
 * canvas is drawn back onto itself, very slightly scaled up and jittered, at
 * two thousandths alpha under `lighter` — so every stroke is also a faint,
 * growing ghost of itself, and the whole thing blooms.
 *
 * The filaments, the decay, the jitter, the hues, the feedback and the pen's
 * two-steps-per-frame clock are all its own, values included. The author's own
 * note above the code — that it is full of magic numbers arrived at by
 * tweaking — is exactly why none of them are touched here.
 *
 * Its nature is a single event, not a loop: it blooms over about six seconds,
 * settles, and holds the picture it made until you click for another at the
 * next hue. That is kept. A settled band is a still image rather than an empty
 * one, and the loop costs nothing once the filaments are gone.
 *
 * Two changes, both about being in a page rather than a window. The bloom is
 * struck right of centre instead of at the middle of the window, where the
 * headline is; and it is measured and re-struck against the band, so a resize
 * does not leave the light hanging off the edge.
 */

const FILAMENTS = 500
const START_HUE = 220
/** How long the feedback bloom runs, in the pen's own ticks. */
const BLOOM_TICKS = 450

/** Where the light is struck, 0..1 of the band. */
const ORIGIN_X = 0.66
const ORIGIN_Y = 0.5

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

type Point = { x: number; y: number }

type Filament = {
  points: Point[]
  angle: number
  vel: number
  spread: number
  hue: number
  life: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let cx = width * ORIGIN_X
  let cy = height * ORIGIN_Y
  let hue = START_HUE
  let tick = 0
  let filaments: Filament[] = []

  const makeFilament = (): Filament => {
    const move = 15
    const x = cx + rand(-move, move)
    const y = cy + rand(-move, move)
    return {
      points: [{ x, y }],
      angle: rand(0, Math.PI * 1),
      vel: rand(-4, 4),
      spread: 0,
      hue,
      life: 1,
    }
  }

  const strike = () => {
    filaments = []
    tick = 0
    cx = width * ORIGIN_X
    cy = height * ORIGIN_Y
    // The pen clears by reassigning the canvas's width, which is easy to miss
    // as a clear at all. Without it the feedback pass keeps amplifying the
    // last bloom under the new one, and every strike is brighter than the one
    // before until the band is white.
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < FILAMENTS; i++) filaments.push(makeFilament())
  }

  // The pen listens on the window; this listens on the section, so only a
  // click in the band strikes the next one.
  const section = host.parentElement ?? host
  const onClick = (e: MouseEvent) => {
    if (isInteractiveTarget(e.target)) return
    hue += 60
    strike()
  }
  section.addEventListener('click', onClick)

  const step = () => {
    for (let i = filaments.length - 1; i >= 0; i--) {
      const f = filaments[i]
      f.life -= 0.0015
      if (f.life <= 0) {
        filaments.splice(i, 1)
        continue
      }
      const lastPoint = f.points[f.points.length - 1]
      f.points.push({
        x: lastPoint.x + Math.cos(f.angle) * f.vel,
        y: lastPoint.y + Math.sin(f.angle) * f.vel,
      })
      f.angle += rand(-f.spread, f.spread)
      f.vel *= 0.99
      f.spread = f.vel * 0.04
      f.hue += 0.3
    }
    tick++
  }

  const draw = () => {
    if (tick < BLOOM_TICKS) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = 0.002
      ctx.translate(cx, cy)
      const scale = 1 + tick * 0.00025
      ctx.scale(scale, scale)
      ctx.translate(-cx, -cy)
      ctx.drawImage(canvas, rand(-150, 150), rand(-150, 150))
      ctx.restore()
    }

    ctx.globalCompositeOperation = 'lighter'
    for (let i = filaments.length - 1; i >= 0; i--) {
      const f = filaments[i]
      const length = f.points.length
      const point = f.points[length - 1]
      const lastPoint = f.points[length - 1 - randInt(5, 100)]
      if (!point || !lastPoint) continue
      const jitter = 2 + f.life * 6
      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(point.x + rand(-jitter, jitter), point.y + rand(-jitter, jitter))
      ctx.lineWidth = 1
      ctx.strokeStyle = `hsla(${f.hue + rand(-10, 10)}, 70%, 40%, ${f.life * 0.075})`
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  return {
    resize(w, h) {
      width = w
      height = h
      // A resize hands back a cleared canvas, and the feedback pass reads the
      // canvas — so there is nothing to carry over. Strike a new one.
      strike()
    },
    frame() {
      // The pen's own clock: two steps and two draws per frame.
      step()
      draw()
      step()
      draw()
    },
    dispose() {
      section.removeEventListener('click', onClick)
      filaments = []
    },
  }
}

export function LightburstBackdrop({ className }: { className?: string }) {
  // The pen draws the canvas back onto itself every frame, so the backing
  // store is the whole cost — and at its own one pixel per pixel.
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--lightburst', className)} aria-hidden />
  )
}
