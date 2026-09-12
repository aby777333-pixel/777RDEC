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
 * The stack, exploded.
 *
 * Written for `/technology/architecture`, where the page's own subject is four
 * layers and which part owns what. So the band is those four layers as
 * isometric planes, held apart, breathing on slightly different periods so the
 * gap between them is never static. Each plane carries a grid of cells — the
 * services in that layer — and light travels through the cells in sequence,
 * which is what makes a plane read as busy rather than as a lid.
 *
 * **Pointer:** the vertical position selects a layer. The selected plane comes
 * forward and brightens, its cells light in sequence, and the rest recede and
 * dim — so running the pointer down the band walks the stack from the browser
 * to the metal. With no pointer it cycles slowly on its own, because a hero
 * that only moves for people with a mouse is a hero that does not move.
 */

/** The four layers, top to bottom, as the architecture page orders them. */
const LAYERS = 4
/** Cells across and back on each plane. */
const COLS = 7
const ROWS = 4

/** Isometric projection: how far a unit of depth moves right and down. */
const ISO_X = 0.86
const ISO_Y = 0.42

/** Vertical separation between planes, and how much it breathes. */
const GAP = 0.135
const BREATHE = 0.02

/** How far a selected plane steps toward the viewer. */
const SELECT_LIFT = 0.05
/** How quickly selection and lift ease. */
const EASE = 0.08
/** Seconds each layer holds when nothing is pointing at it. */
const CYCLE_SECONDS = 2.8

const CENTRE_X = 0.66
const CENTRE_Y = 0.5

type Cell = { col: number; row: number; phase: number }

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Mid steel, not dark: the band behind this is near-black, and --steel-700
  // at a backdrop's alpha composites to within a few levels of it.
  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointing = false
  let aim = 0.5
  /** Eased selection, so moving the pointer does not snap between layers. */
  let selection = 0
  let last = -1

  // Each cell gets a phase so the light crossing a plane is a wave rather
  // than a row of lamps switched together.
  const cells: Cell[][] = []
  for (let layer = 0; layer < LAYERS; layer++) {
    const plane: Cell[] = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        plane.push({ col, row, phase: (col / COLS) * 1.6 + (row / ROWS) * 0.6 })
      }
    }
    cells.push(plane)
  }

  const untrack = trackPointer(
    host,
    (_nx, ny) => {
      pointing = true
      aim = ny
    },
    () => {
      pointing = false
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

      // Pointing picks a layer; idle walks them in turn.
      const wanted = pointing
        ? aim * (LAYERS - 1)
        : (seconds / CYCLE_SECONDS) % LAYERS > LAYERS - 1
          ? LAYERS - 1
          : (seconds / CYCLE_SECONDS) % LAYERS
      selection += (wanted - selection) * Math.min(1, EASE * dt * 60)

      ctx.clearRect(0, 0, width, height)

      // Four stacked planes plus their separation are taller than they are
      // wide, so the unit comes off the band's height — the scarce dimension —
      // or the top plane is cut off by the top of the band.
      const unit = Math.min(width * 0.055, height * 0.082)
      const cx = width * CENTRE_X
      const cy = height * CENTRE_Y

      // Far layers first, so nearer planes overlap them correctly.
      for (let layer = LAYERS - 1; layer >= 0; layer--) {
        const closeness = Math.max(0, 1 - Math.abs(layer - selection))
        const breathe = Math.sin(seconds * 0.5 + layer * 1.3) * BREATHE
        const lift = closeness * SELECT_LIFT
        const originY =
          cy + (layer - (LAYERS - 1) / 2) * unit * (GAP * 10 + breathe * 10) - lift * unit * 10

        const colour = mixRgb(steel, signal, closeness * 0.9)
        const planeAlpha = 0.2 + closeness * 0.5

        // ---- the plane's own outline ----
        const corner = (col: number, row: number) => ({
          x: cx + (col - COLS / 2) * unit * ISO_X - (row - ROWS / 2) * unit * ISO_X,
          y: originY + (col - COLS / 2) * unit * ISO_Y + (row - ROWS / 2) * unit * ISO_Y,
        })

        const outline = [corner(0, 0), corner(COLS, 0), corner(COLS, ROWS), corner(0, ROWS)]
        ctx.beginPath()
        ctx.moveTo(outline[0].x, outline[0].y)
        for (const point of outline.slice(1)) ctx.lineTo(point.x, point.y)
        ctx.closePath()
        ctx.fillStyle = rgba(colour, 0.03 + closeness * 0.07)
        ctx.fill()
        ctx.strokeStyle = rgba(colour, planeAlpha)
        ctx.lineWidth = 0.8 + closeness * 1.4
        ctx.stroke()

        // ---- the cells, lit by a wave crossing the plane ----
        for (const cell of cells[layer]) {
          const wave = Math.sin(seconds * 1.5 - cell.phase * 2)
          const heat = Math.max(0, wave) ** 3 * (0.25 + closeness * 0.75)
          if (heat < 0.02) continue

          const a = corner(cell.col + 0.18, cell.row + 0.18)
          const b = corner(cell.col + 0.82, cell.row + 0.18)
          const c = corner(cell.col + 0.82, cell.row + 0.82)
          const d = corner(cell.col + 0.18, cell.row + 0.82)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.lineTo(c.x, c.y)
          ctx.lineTo(d.x, d.y)
          ctx.closePath()
          ctx.fillStyle = rgba(mixRgb(steel, signal, Math.min(1, heat * 1.6)), heat * 0.5)
          ctx.fill()
        }

        // ---- the columns tying this plane to the one below ----
        if (layer < LAYERS - 1) {
          const nextBreathe = Math.sin(seconds * 0.5 + (layer + 1) * 1.3) * BREATHE
          const nextCloseness = Math.max(0, 1 - Math.abs(layer + 1 - selection))
          const nextY =
            cy +
            (layer + 1 - (LAYERS - 1) / 2) * unit * (GAP * 10 + nextBreathe * 10) -
            nextCloseness * SELECT_LIFT * unit * 10
          ctx.strokeStyle = rgba(steel, 0.1 + closeness * 0.1)
          ctx.lineWidth = 0.7
          for (const [col, row] of [
            [0, 0],
            [COLS, 0],
            [COLS, ROWS],
            [0, ROWS],
          ] as const) {
            const top = corner(col, row)
            ctx.beginPath()
            ctx.moveTo(top.x, top.y)
            ctx.lineTo(top.x, top.y + (nextY - originY))
            ctx.stroke()
          }
        }
      }
    },
    dispose() {
      untrack()
    },
  }
}

export function StackBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--stack', className)} aria-hidden />
}
