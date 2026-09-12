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
 * A wall of ciphertext, and the pointer is the key.
 *
 * Written for `/technology/security`. The band is a grid of glyphs churning
 * through a noisy character set — unreadable, and meant to be. Where the
 * pointer goes, the cells inside its radius settle: they stop churning, adopt
 * an ordered hexadecimal set, align to one steady brightness, and hold.
 * Take the pointer away and they dissolve back into noise a moment later.
 *
 * That is the whole idea and the reason this one is not decoration: the page
 * is about who can read what, and the band is a thing you can only read the
 * part of that you hold a key to.
 *
 * A column of the wall also resolves on its own every few seconds and sweeps
 * across, so the effect is visible to someone who never moves their mouse.
 *
 * What it deliberately does **not** do is resolve into words. A backdrop that
 * spells out sentences behind a headline is competing with it, and a marketing
 * phrase hidden in a cipher is a gimmick that survives exactly one reading.
 * Resolved cells are ordered data, not a message.
 */

/**
 * Cell size in CSS pixels, and how often a noisy cell changes glyph. The cell
 * has to be large enough that a glyph is a glyph at arm's length — at a hero's
 * scale a 15px cell reads as a dot screen rather than as ciphertext.
 */
const CELL = 22
const CHURN_PER_SECOND = 11

/** The key's reach, as a share of the band's short side, and its softness. */
const REACH = 0.2
const FEATHER = 0.45

/** How fast a cell settles when held, and decays when released. */
const SETTLE = 5.5
const DECAY = 1.9

/** The sweeping column: seconds between passes, and how long a pass takes. */
const SWEEP_EVERY = 6.5
const SWEEP_SECONDS = 2.6

/**
 * Noise, and what a resolved cell resolves to. Kept to Latin-1 and ASCII: the
 * mono face is loaded for copy, not for a symbol wall, and a missing glyph
 * draws as a blank box that gives the whole effect away.
 */
const NOISE = '¥¢£§¤×÷þøæµ¶¬±#%&@$*+=?!~^|<>/'
const RESOLVED = '0123456789ABCDEF'

type Cell = {
  glyph: string
  /** 0 noise, 1 resolved. */
  clarity: number
  /** Countdown to the next glyph change while noisy. */
  churn: number
  seed: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Mid steel: the band is near-black, and unlit ciphertext in --steel-700 at
  // a backdrop's alpha is the same colour as the background.
  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  // The wall's own type should be the site's mono, read off the band.
  const mono = getComputedStyle(host).getPropertyValue('--font-mono').trim()

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let cols = 1
  let rows = 1
  let cells: Cell[] = []
  let pointerX = -1
  let pointerY = -1
  let last = -1
  let sweepStart = -SWEEP_EVERY

  const noisy = () => NOISE[(Math.random() * NOISE.length) | 0]

  const layout = () => {
    cols = Math.max(1, Math.ceil(width / CELL))
    rows = Math.max(1, Math.ceil(height / CELL))
    cells = new Array(cols * rows)
    for (let i = 0; i < cells.length; i++) {
      cells[i] = {
        glyph: noisy(),
        clarity: 0,
        churn: Math.random() / CHURN_PER_SECOND,
        seed: Math.random(),
      }
    }
  }
  layout()

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
      layout()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : Math.min(0.05, seconds - last)
      last = seconds

      ctx.clearRect(0, 0, width, height)
      ctx.font = `${CELL - 7}px ${mono || 'ui-monospace, monospace'}`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      const reach = Math.min(width, height) * REACH
      const inner = reach * (1 - FEATHER)

      // The self-running sweep: a column of the wall resolving as it crosses.
      if (seconds - sweepStart > SWEEP_EVERY) sweepStart = seconds
      const sweepAge = seconds - sweepStart
      const sweeping = sweepAge < SWEEP_SECONDS
      const sweepX = sweeping ? (sweepAge / SWEEP_SECONDS) * width : -1

      for (let row = 0; row < rows; row++) {
        const y = row * CELL + CELL / 2
        for (let col = 0; col < cols; col++) {
          const cell = cells[row * cols + col]
          const x = col * CELL + CELL / 2

          // How much of a key is over this cell.
          let held = 0
          if (pointerX >= 0) {
            const d = Math.hypot(x - pointerX, y - pointerY)
            held = d <= inner ? 1 : d >= reach ? 0 : 1 - (d - inner) / (reach - inner)
          }
          if (sweeping) {
            const dx = Math.abs(x - sweepX)
            const band = CELL * 2.5
            if (dx < band) held = Math.max(held, (1 - dx / band) * 0.9)
          }

          // Settle toward held, fall away from it.
          const target = held
          const rate = target > cell.clarity ? SETTLE : DECAY
          cell.clarity += (target - cell.clarity) * Math.min(1, rate * dt)

          // A noisy cell keeps changing; a resolved one holds still, which is
          // the difference the eye actually reads.
          cell.churn -= dt * (1 - cell.clarity * 0.92)
          if (cell.churn <= 0) {
            cell.churn = (0.6 + Math.random()) / CHURN_PER_SECOND
            cell.glyph = cell.clarity > 0.55 ? RESOLVED[(Math.random() * 16) | 0] : noisy()
          }

          // Alpha: the wall is quiet, and only the held part is bright. The
          // faint drift stops it reading as a flat texture.
          const drift = 0.07 + 0.06 * (0.5 + 0.5 * Math.sin(seconds * 0.6 + cell.seed * 8))
          // The copy sits on the left, so the wall is quieter there. It is
          // dimmed rather than cut: a wall with a hole in it is not a wall.
          const side = 0.4 + 0.6 * Math.min(1, x / (width * 0.5))
          const alpha = (drift + cell.clarity * 0.62) * side
          if (alpha < 0.02) continue

          ctx.fillStyle = rgba(mixRgb(steel, signal, cell.clarity), alpha)
          ctx.fillText(cell.glyph, x, y)
        }
      }

      // A ring around the key, so it reads as an instrument rather than a smudge.
      if (pointerX >= 0) {
        ctx.strokeStyle = rgba(signal, 0.16)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(pointerX, pointerY, inner, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
    dispose() {
      untrack()
      cells = []
    },
  }
}

export function CipherBackdrop({ className }: { className?: string }) {
  // Text rendering is the cost here, and it is per cell: one pixel per pixel.
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--cipher', className)} aria-hidden />
}
