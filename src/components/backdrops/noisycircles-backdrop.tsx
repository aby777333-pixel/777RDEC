'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Noisy Circles | Simplex Noise" by DonKarlssonSan (Johan Karlsson), ported.
 * https://codepen.io/DonKarlssonSan/pen/WzbYBr
 *
 * Concentric white rings, ten pixels apart, from the centre out to just short
 * of the band's shorter half. Every ring is traced through four hundred points
 * and each point is pushed in or out by 3D simplex noise read at its own
 * position and at the time, so the rings breathe and ripple into one another
 * on black.
 *
 * The pointer is the pen's only control, and it keeps both halves of it:
 * across, it sets how hard the noise pushes — nothing at the left edge, fifty
 * pixels at the right; down, it sets the noise's scale — tight, busy ripples at
 * the top, long slow swells at the bottom. It starts in the middle, and leaving
 * the band leaves it where it was.
 *
 * The ring spacing and extent, the point count, the noise strength, scale and
 * speed, and the white-on-black are the pen's, values included.
 *
 * What changed:
 *
 * - **The noise is written here.** The pen loads the simplex-noise library;
 *   this carries the same algorithm (Gustavson's 3D simplex, with the
 *   library's radius and scaling) rather than a dependency for one function,
 *   seeded from a fresh random permutation on every resize, as the pen's
 *   `new SimplexNoise()` is.
 * - **The pointer is the hero's.** The pen reads the mouse over its canvas;
 *   here the same, over this band, and a touch drag does it too.
 * - **Its size follows the band,** in CSS pixels at the screen's density, and
 *   a resize puts the pointer back in the middle as the pen's does.
 * - **The first frame has a time.** The pen's opening call draws with no
 *   timestamp, which makes every point NaN and that frame blank; here time
 *   starts at zero, which is also the one frame a reduced-motion band shows.
 * - The pen's hidden CodePen-TV joke — swapping the canvas for a message when
 *   opened from one particular CodePen page — is left out.
 */

const RING_STEP = 10
/** Rings stop this far short of half the band's shorter side. */
const RING_MARGIN = 40
const POINTS_PER_RING = 400
const MAX_NOISE = 50
const MAX_ZOOM = 200
/** The pen divides its millisecond timestamp by 2000. */
const TIME_SCALE = 1000 / 2000

// ---- 3D simplex noise (Stefan Gustavson), as simplex-noise.js has it ----

const GRAD3 = new Float32Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1,
  -1, 0, -1, -1,
])
const F3 = 1 / 3
const G3 = 1 / 6

function createNoise3D(random: () => number = Math.random) {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(random() * (i + 1))
    const tmp = p[i]
    p[i] = p[r]
    p[r] = tmp
  }
  const perm = new Uint8Array(512)
  const permMod12 = new Uint8Array(512)
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
    permMod12[i] = perm[i] % 12
  }

  return function noise3D(xin: number, yin: number, zin: number) {
    let n0 = 0
    let n1 = 0
    let n2 = 0
    let n3 = 0
    const s = (xin + yin + zin) * F3
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const k = Math.floor(zin + s)
    const t = (i + j + k) * G3
    const x0 = xin - (i - t)
    const y0 = yin - (j - t)
    const z0 = zin - (k - t)

    let i1: number, j1: number, k1: number, i2: number, j2: number, k2: number
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1
      } else {
        i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1
      }
    } else if (y0 < z0) {
      i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1
    } else if (x0 < z0) {
      i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1
    } else {
      i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0
    }

    const x1 = x0 - i1 + G3
    const y1 = y0 - j1 + G3
    const z1 = z0 - k1 + G3
    const x2 = x0 - i2 + 2 * G3
    const y2 = y0 - j2 + 2 * G3
    const z2 = z0 - k2 + 2 * G3
    const x3 = x0 - 1 + 3 * G3
    const y3 = y0 - 1 + 3 * G3
    const z3 = z0 - 1 + 3 * G3

    const ii = i & 255
    const jj = j & 255
    const kk = k & 255

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0
    if (t0 >= 0) {
      const g = permMod12[ii + perm[jj + perm[kk]]] * 3
      t0 *= t0
      n0 = t0 * t0 * (GRAD3[g] * x0 + GRAD3[g + 1] * y0 + GRAD3[g + 2] * z0)
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1
    if (t1 >= 0) {
      const g = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3
      t1 *= t1
      n1 = t1 * t1 * (GRAD3[g] * x1 + GRAD3[g + 1] * y1 + GRAD3[g + 2] * z1)
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2
    if (t2 >= 0) {
      const g = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3
      t2 *= t2
      n2 = t2 * t2 * (GRAD3[g] * x2 + GRAD3[g + 1] * y2 + GRAD3[g + 2] * z2)
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3
    if (t3 >= 0) {
      const g = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3
      t3 *= t3
      n3 = t3 * t3 * (GRAD3[g] * x3 + GRAD3[g + 1] * y3 + GRAD3[g + 2] * z3)
    }
    return 32 * (n0 + n1 + n2 + n3)
  }
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let w = Math.max(1, host.clientWidth)
  let h = Math.max(1, host.clientHeight)
  let m = Math.min(w, h)
  let mx = w / 2
  let my = h / 2
  let noise3D = createNoise3D()

  const drawCircle = (r: number, now: number) => {
    const noiseFactor = (mx / w) * MAX_NOISE
    const zoom = (my / h) * MAX_ZOOM
    const deltaAngle = (Math.PI * 2) / POINTS_PER_RING
    ctx.beginPath()
    for (let angle = 0; angle < Math.PI * 2; angle += deltaAngle) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const n = noise3D((cos * r + w / 2) / zoom, (sin * r + h / 2) / zoom, now) * noiseFactor
      ctx.lineTo(cos * (r + n) + w / 2, sin * (r + n) + h / 2)
    }
    ctx.closePath()
    ctx.stroke()
  }

  const untrack = trackPointer(host, (nx, ny) => {
    // The pen adds one, so the pointer's zero never divides the zoom to zero.
    mx = nx * w + 1
    my = ny * h + 1
  })

  return {
    resize(width, height, dpr) {
      w = width
      h = height
      m = Math.min(w, h)
      mx = w / 2
      my = h / 2
      noise3D = createNoise3D()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const now = seconds * TIME_SCALE
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1
      for (let r = RING_STEP; r < m / 2 - RING_MARGIN; r += RING_STEP) drawCircle(r, now)
    },
    dispose() {
      untrack()
    },
  }
}

export function NoisycirclesBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return <div ref={hostRef} className={cn('pen-scene', className)} aria-hidden />
}
