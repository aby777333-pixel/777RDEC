'use client'

import { DM_Mono, Instrument_Serif } from 'next/font/google'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'
import { motionIsReduced } from './motion'

/**
 * "TIDES — A Cinematic Canvas Ocean" by Chathura-Jayasanka, ported.
 * https://codepen.io/Chathura-Jayasanka/pen/emBMYWJ
 *
 * One sea, painted on a 2D canvas, at whatever hour you choose. A sky
 * gradient, a sun with its glow, five slow clouds and four birds above a hazy
 * horizon; below it twenty-six swells, back to front, each wider, taller and
 * faster than the one behind, with a crest line and — on the nearest — foam;
 * then a glitter path under the sun and a vignette over all of it. The time
 * slider runs from dawn to moonlight through six keyframed palettes, naming
 * the mood and the hour as it goes, and the sun follows the pointer across
 * the sky.
 *
 * The palettes, the geometry of every layer, the counts, the speeds, the
 * overlay and its type (Instrument Serif and DM Mono) and the slider are the
 * pen's, values included. The slider is a control, and is kept working.
 *
 * What changed:
 *
 * - **The overlay is laid out around the headline.** The pen's label and mood
 *   sit in the top corners and its caption and slider along the foot; here the
 *   label and mood sit together top right and the caption and slider bottom
 *   right, where the copy is not. On a narrow band they stack at the foot.
 * - **The pointer is the hero's, not the window's**, so the sun follows it
 *   across this band.
 * - **Its clock.** The pen moves its time, clouds and birds a fixed step per
 *   frame; here those steps are taken at its 60 a second, whatever the
 *   screen's rate.
 * - **It rests when the band is off screen**, and under reduced motion it
 *   holds still — but the slider and the sun still answer, a frame at a time.
 */

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-tides-serif',
})
const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-tides-mono',
})

type Rgb = [number, number, number]
type Key = {
  t: number
  name: string
  skyTop: Rgb
  skyHor: Rgb
  sun: Rgb
  glow: Rgb
  wFar: Rgb
  wNear: Rgb
  foam: Rgb
  sunH: number
  glit: number
  star: number
}

/** The pen's palette keyframes. `sunH` is the sun's height above the horizon. */
const KEYS: readonly Key[] = [
  { t: 0.0, name: 'DAWN', skyTop: [38, 44, 86], skyHor: [247, 176, 128], sun: [255, 238, 206], glow: [255, 178, 120], wFar: [176, 150, 150], wNear: [34, 62, 84], foam: [255, 244, 234], sunH: 0.1, glit: 0.7, star: 0 },
  { t: 0.28, name: 'MORNING', skyTop: [64, 134, 206], skyHor: [188, 222, 236], sun: [255, 255, 246], glow: [255, 250, 224], wFar: [120, 186, 196], wNear: [20, 92, 114], foam: [255, 255, 255], sunH: 0.55, glit: 0.5, star: 0 },
  { t: 0.5, name: 'MIDDAY', skyTop: [58, 142, 214], skyHor: [176, 216, 230], sun: [255, 255, 248], glow: [255, 252, 232], wFar: [96, 178, 188], wNear: [16, 96, 120], foam: [255, 255, 255], sunH: 0.92, glit: 0.45, star: 0 },
  { t: 0.68, name: 'GOLDEN HOUR', skyTop: [74, 92, 156], skyHor: [255, 202, 120], sun: [255, 236, 194], glow: [255, 168, 92], wFar: [206, 164, 118], wNear: [34, 78, 98], foam: [255, 244, 228], sunH: 0.3, glit: 0.95, star: 0 },
  { t: 0.84, name: 'SUNSET', skyTop: [48, 38, 86], skyHor: [255, 108, 68], sun: [255, 206, 148], glow: [255, 92, 58], wFar: [188, 98, 84], wNear: [30, 42, 72], foam: [255, 222, 200], sunH: 0.06, glit: 1.0, star: 0.15 },
  { t: 1.0, name: 'MOONLIT', skyTop: [8, 12, 30], skyHor: [34, 44, 82], sun: [228, 234, 255], glow: [140, 164, 216], wFar: [28, 42, 76], wNear: [6, 16, 32], foam: [196, 208, 234], sunH: 0.55, glit: 0.55, star: 1 },
]

/** The slider's starting value, out of 1000. */
const START = 600
const STEP_RATE = 60
const MAX_STEPS = 4

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
function lerpRGB(a: Rgb, b: Rgb, t: number): Rgb {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}
function rgb(c: Rgb, a = 1) {
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
}

function getPalette(t: number) {
  let i = 0
  while (i < KEYS.length - 1 && t > KEYS[i + 1].t) i++
  const a = KEYS[i]
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)]
  const span = b.t - a.t || 1
  const k = Math.max(0, Math.min(1, (t - a.t) / span))
  return {
    name: k < 0.5 ? a.name : b.name,
    skyTop: lerpRGB(a.skyTop, b.skyTop, k),
    skyHor: lerpRGB(a.skyHor, b.skyHor, k),
    sun: lerpRGB(a.sun, b.sun, k),
    glow: lerpRGB(a.glow, b.glow, k),
    wFar: lerpRGB(a.wFar, b.wFar, k),
    wNear: lerpRGB(a.wNear, b.wNear, k),
    foam: lerpRGB(a.foam, b.foam, k),
    sunH: lerp(a.sunH, b.sunH, k),
    glit: lerp(a.glit, b.glit, k),
    star: lerp(a.star, b.star, k),
  }
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const section = host.parentElement ?? host
  const slider = section.querySelector<HTMLInputElement>('[data-tides-slider]')
  const moodName = section.querySelector<HTMLElement>('[data-tides-mood-name]')
  const moodTime = section.querySelector<HTMLElement>('[data-tides-mood-time]')

  let W = Math.max(1, host.clientWidth)
  let H = Math.max(1, host.clientHeight)
  let horizonY = H * 0.42
  let oceanH = H - horizonY

  // ---- static elements ----
  const stars = Array.from({ length: 140 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.4,
    r: Math.random() * 1.2 + 0.3,
    tw: Math.random() * Math.PI * 2,
  }))
  const clouds = Array.from({ length: 5 }, () => ({
    x: Math.random(),
    y: 0.08 + Math.random() * 0.18,
    w: 0.18 + Math.random() * 0.22,
    speed: 0.000015 + Math.random() * 0.00002,
  }))
  const birds = Array.from({ length: 4 }, () => ({
    x: Math.random(),
    y: 0.15 + Math.random() * 0.18,
    speed: 0.00004 + Math.random() * 0.00004,
    size: 8 + Math.random() * 6,
    flap: Math.random() * Math.PI * 2,
  }))

  // ---- input ----
  let timeOfDay = (slider ? Number(slider.value) : START) / 1000
  let mouseX = 0.5
  let T = 0
  let stepsTaken = -1

  /** One of the pen's frames' worth of motion. */
  const step = () => {
    T += 0.016
    for (const c of clouds) {
      c.x += c.speed
      if (c.x > 1.3) c.x = -0.3
    }
    for (const b of birds) {
      b.x += b.speed
      b.flap += 0.15
      if (b.x > 1.2) {
        b.x = -0.2
        b.y = 0.15 + Math.random() * 0.18
      }
    }
  }

  const draw = () => {
    const P = getPalette(timeOfDay)

    // sun position
    const sunX = W * (0.5 + (mouseX - 0.5) * 0.25)
    const sunY = horizonY - P.sunH * horizonY * 0.82

    // ── SKY ──
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY + oceanH * 0.1)
    sky.addColorStop(0, rgb(P.skyTop))
    sky.addColorStop(0.7, rgb(lerpRGB(P.skyTop, P.skyHor, 0.55)))
    sky.addColorStop(1, rgb(P.skyHor))
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, horizonY + 2)

    // ── STARS ──
    if (P.star > 0.01) {
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(T * 2 + s.tw)
        ctx.fillStyle = rgb([255, 255, 255], P.star * tw * 0.9)
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * horizonY, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // ── SUN GLOW ──
    const glowR = Math.min(W, H) * 0.5
    const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR)
    g.addColorStop(0, rgb(P.glow, 0.55))
    g.addColorStop(0.25, rgb(P.glow, 0.22))
    g.addColorStop(1, rgb(P.glow, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, horizonY + oceanH * 0.4)

    // ── SUN DISC ──
    const sunR = Math.min(W, H) * 0.045
    const sd = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR)
    sd.addColorStop(0, rgb(P.sun, 1))
    sd.addColorStop(0.7, rgb(P.sun, 0.95))
    sd.addColorStop(1, rgb(P.sun, 0.2))
    ctx.fillStyle = sd
    ctx.beginPath()
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
    ctx.fill()

    // ── CLOUDS ──
    for (const c of clouds) {
      const cx = c.x * W
      const cy = c.y * horizonY
      const cw = c.w * W
      ctx.fillStyle = rgb(lerpRGB(P.skyHor, [255, 255, 255], 0.25), 0.16)
      for (let j = 0; j < 4; j++) {
        ctx.beginPath()
        ctx.ellipse(cx + j * cw * 0.22, cy + Math.sin(j) * 6, cw * (0.3 - j * 0.04), cw * 0.06, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // ── BIRDS ──
    for (const b of birds) {
      const bx = b.x * W
      const by = b.y * horizonY
      const wing = Math.sin(b.flap) * b.size * 0.5
      ctx.strokeStyle = rgb(lerpRGB(P.skyTop, [0, 0, 0], 0.3), 0.5)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(bx - b.size, by + wing)
      ctx.quadraticCurveTo(bx, by - b.size * 0.3, bx, by)
      ctx.quadraticCurveTo(bx, by - b.size * 0.3, bx + b.size, by + wing)
      ctx.stroke()
    }

    // ── ATMOSPHERIC HAZE AT HORIZON ──
    const haze = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 40)
    haze.addColorStop(0, rgb(P.skyHor, 0))
    haze.addColorStop(0.5, rgb(P.skyHor, 0.45))
    haze.addColorStop(1, rgb(P.wFar, 0))
    ctx.fillStyle = haze
    ctx.fillRect(0, horizonY - 40, W, 80)

    // ── OCEAN SWELLS (back → front) ──
    const NUM = 26
    for (let i = 0; i < NUM; i++) {
      const depth = i / (NUM - 1) // 0 horizon → 1 viewer
      const yTop = horizonY + Math.pow(depth, 1.9) * oceanH
      const amp = lerp(0.6, 30, depth)
      const wlen = lerp(46, 340, depth)
      const speed = lerp(0.25, 0.9, depth)
      const phase = T * speed + i * 0.9
      const col = lerpRGB(P.wFar, P.wNear, depth)
      const swell = (x: number) =>
        yTop + Math.sin(x / wlen + phase) * amp + Math.sin(x / (wlen * 0.4) + phase * 1.6) * amp * 0.3

      // band fill
      ctx.beginPath()
      ctx.moveTo(0, H)
      ctx.lineTo(0, yTop + Math.sin(phase) * amp)
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, swell(x))
      ctx.lineTo(W, H)
      ctx.closePath()
      ctx.fillStyle = rgb(col)
      ctx.fill()

      // crest highlight
      ctx.lineWidth = lerp(0.6, 2.2, depth)
      ctx.beginPath()
      for (let x = 0; x <= W; x += 6) {
        if (x === 0) ctx.moveTo(x, swell(x))
        else ctx.lineTo(x, swell(x))
      }
      ctx.strokeStyle = rgb(lerpRGB(col, P.sun, 0.55), lerp(0.05, 0.3, depth))
      ctx.stroke()

      // foam on the front swells
      if (depth > 0.62) {
        const foamA = (depth - 0.62) / 0.38
        for (let x = 0; x <= W; x += 9) {
          const y = swell(x)
          const crest = Math.sin(x / wlen + phase)
          if (crest > 0.55 && Math.random() > 0.45) {
            ctx.fillStyle = rgb(P.foam, foamA * (0.18 + Math.random() * 0.35))
            ctx.fillRect(
              x + (Math.random() - 0.5) * 6,
              y - Math.random() * 3,
              1.5 + Math.random() * 3,
              1.5 + Math.random() * 2,
            )
          }
        }
      }
    }

    // ── SUN GLITTER PATH ──
    for (let i = 0; i < 220; i++) {
      const dy = Math.random()
      const y = horizonY + Math.pow(dy, 1.5) * oceanH
      const spread = lerp(6, W * 0.3, dy)
      const x = sunX + (Math.random() - 0.5) * 2 * spread
      const distFade = 1 - Math.min(1, Math.abs(x - sunX) / (spread + 1))
      const flick = 0.25 + Math.random() * 0.75
      const a = distFade * distFade * flick * P.glit * (1 - dy * 0.25)
      if (a < 0.02) continue
      ctx.fillStyle = rgb(P.sun, a * 0.85)
      const len = 1 + Math.random() * (2 + dy * 4)
      ctx.fillRect(x, y, len, 1 + dy)
    }

    // ── VIGNETTE ──
    const vig = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.25, W / 2, H * 0.55, H * 0.9)
    vig.addColorStop(0, 'rgba(0,0,0,0)')
    vig.addColorStop(1, 'rgba(0,0,8,0.34)')
    ctx.fillStyle = vig
    ctx.fillRect(0, 0, W, H)

    // ── UI TEXT ──
    if (moodName) moodName.textContent = P.name
    if (moodTime) {
      const hours = 5 + timeOfDay * 18 // 05:00 → 23:00
      const hh = Math.floor(hours) % 24
      const mm = Math.floor((hours % 1) * 60)
      moodTime.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    }
  }

  // A paused band still answers the slider and the pointer, a frame at a time.
  const redrawIfPaused = () => {
    if (motionIsReduced()) draw()
  }

  const onSlider = () => {
    if (!slider) return
    timeOfDay = Number(slider.value) / 1000
    redrawIfPaused()
  }
  slider?.addEventListener('input', onSlider)

  const onPointerMove = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect()
    if (!rect.width) return
    mouseX = (e.clientX - rect.left) / rect.width
    redrawIfPaused()
  }
  section.addEventListener('pointermove', onPointerMove)

  return {
    resize(w, h, dpr) {
      W = w
      H = h
      horizonY = H * 0.42
      oceanH = H - horizonY
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    },
    frame(seconds) {
      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      if (steps === 0) return
      for (let i = 0; i < steps; i++) step()
      draw()
    },
    dispose() {
      slider?.removeEventListener('input', onSlider)
      section.removeEventListener('pointermove', onPointerMove)
    },
  }
}

export function TidesBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return (
    <>
      <div ref={hostRef} className={cn('pen-scene pen-scene--tides', className)} aria-hidden />
      <div className={cn('tides-ui', serif.variable, mono.variable)} data-pen-controls>
        <div className="tides-ui__top" aria-hidden>
          <div className="tides-label">◑ &nbsp;T I D E S</div>
          <div className="tides-mood">
            <span data-tides-mood-name>GOLDEN HOUR</span>
            <span className="tides-mood__time" data-tides-mood-time>
              15:48
            </span>
          </div>
        </div>

        <div className="tides-ui__bottom">
          <p className="tides-caption" aria-hidden>
            Same sea — <em>every hour a different blue.</em>
          </p>
          <div className="tides-slider">
            <span className="tides-slider__end" aria-hidden>
              DAWN
            </span>
            <input
              type="range"
              min={0}
              max={1000}
              defaultValue={START}
              aria-label="Time of day, dawn to night"
              data-tides-slider
            />
            <span className="tides-slider__end" aria-hidden>
              NIGHT
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
