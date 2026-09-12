'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Particle exploder (mini-game)" by towc, ported.
 * https://codepen.io/towc/pen/WNKabg
 *
 * A field of cells drifting and bouncing off the edges of the band. Click and
 * one detonates: its ring opens, and every cell the ring touches detonates in
 * turn, so one click runs through the field as a chain. Each cell that goes
 * shrinks away as its own ring grows, and the ground is washed with ten
 * percent black a frame, which is what leaves the rings as fading echoes
 * rather than hard circles.
 *
 * The cells, the drift, the ring growth, the chain test and the wash are the
 * pen's, values included — one cell per ten thousand pixels of band, six to
 * ten across, four pixels a frame at most.
 *
 * Its colours are the pen's too, including how it gets them: the pen means to
 * pick each channel above a floor, but `Math.random() * (255 - min) | 0 + min`
 * parses as a bitwise OR against the floor rather than a sum, so the channels
 * land on a particular muted scatter. That expression is the palette, so it is
 * kept exactly.
 *
 * The game around it is not: the score, the count it is out of, and the rules
 * card that fades away on load are all text, and a backdrop carries none.
 *
 * One departure. In the pen, a chain that clears the field ends the game and
 * waits to be clicked; here the field re-seeds itself a beat later. A demo may
 * sit finished because someone is looking at it and deciding whether to play
 * again — a hero band that has run itself empty is just a black rectangle, and
 * nobody will click it to find out otherwise. A click still starts the chain,
 * and a click during one still resets, both as the pen has it.
 */

/** One cell per ten thousand pixels of band, as the pen counts them. */
const AREA_PER_CELL = 10000
const MAX_SIZE = 10
const MIN_SIZE = 6
const MAX_V = 4
/** How long the emptied field waits before seeding itself again. */
const RESEED_SECONDS = 1.2

type Cell = {
  colour: string
  size: number
  x: number
  y: number
  vx: number
  vy: number
  exploded: boolean
  ringSize: number
}

/**
 * The pen's colour, expression intact. `| 0 + min` is a bitwise OR against the
 * floor, not the sum it reads as, and that is where the palette comes from.
 */
function penColour(min: number): string {
  return 'rgb(cr, cg, cb)'
    .replace('cr', String((Math.random() * (255 - min)) | (0 + min)))
    .replace('cg', String((Math.random() * (255 - min)) | (0 + min)))
    .replace('cb', String((Math.random() * (255 - min)) | (0 + min)))
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let cells: Cell[] = []
  let chained = false
  let emptyFor = 0
  let last = -1

  const makeCell = (size?: number, x?: number, y?: number): Cell => ({
    colour: penColour(100),
    size: size ?? Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE,
    x: x ?? Math.random() * width,
    y: y ?? Math.random() * height,
    vx: Math.random() * MAX_V * 2 - MAX_V,
    vy: Math.random() * MAX_V * 2 - MAX_V,
    exploded: false,
    ringSize: 10,
  })

  const seed = () => {
    chained = false
    emptyFor = 0
    cells = []
    const amount = Math.max(1, ((width * height) / AREA_PER_CELL) | 0)
    for (let n = 0; n < amount; n++) cells.push(makeCell())
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)
  }

  const detonate = (cell: Cell) => {
    cell.exploded = true
    cell.vx = 0
    cell.vy = 0
  }

  // The pen listens on the document; this listens on the section, so a click
  // in the band starts the chain and a click anywhere else on the page does
  // not. Links and buttons over the band keep working — the backdrop itself
  // never takes the click.
  const section = host.parentElement ?? host
  const onClick = (e: MouseEvent) => {
    if (chained) {
      seed()
      return
    }
    const r = host.getBoundingClientRect()
    if (!r.width || !r.height) return
    const cell = makeCell(15, e.clientX - r.left, e.clientY - r.top)
    cells.push(cell)
    detonate(cell)
    chained = true
  }
  section.addEventListener('click', onClick)

  seed()

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // The count is a function of the band's area, so a resize is a new field
      // rather than the old one stretched.
      seed()
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : seconds - last
      last = seconds

      if (cells.length === 0) {
        emptyFor += dt
        if (emptyFor >= RESEED_SECONDS) seed()
        return
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)

      for (let i = cells.length - 1; i >= 0; i--) {
        const cell = cells[i]
        cell.x += cell.vx
        cell.y += cell.vy
        if (cell.x < 0 || cell.x > width) cell.vx *= -1
        if (cell.y < 0 || cell.y > height) cell.vy *= -1

        ctx.fillStyle = cell.colour
        ctx.beginPath()
        ctx.arc(cell.x, cell.y, Math.abs(cell.size / 2), 0, Math.PI * 2)
        ctx.fill()

        if (!cell.exploded) continue

        if (cell.size > 0) {
          cell.ringSize += (1 / cell.ringSize) * 10
          cell.size -= 0.05
        } else {
          cells.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(cell.x, cell.y, cell.ringSize, 0, Math.PI * 2)
        for (let j = 0; j < cells.length; j++) {
          const other = cells[j]
          if (other.exploded) continue
          const dx = cell.x - other.x
          const dy = cell.y - other.y
          if (Math.sqrt(dx * dx + dy * dy) <= cell.ringSize) detonate(other)
        }
        ctx.strokeStyle = cell.colour
        ctx.stroke()
      }
    },
    dispose() {
      section.removeEventListener('click', onClick)
      cells = []
    },
  }
}

export function ExploderBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.5 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--exploder', className)} aria-hidden />
}
