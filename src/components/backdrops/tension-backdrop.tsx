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
 * A book of positions, under load.
 *
 * Written for `/intelligence/risk`, whose point is that the damaging position
 * was not the large one — it was the correlated one. So the band is a web:
 * positions as masses, correlations as strands between them, four of them
 * pinned because a book is held somewhere. Those four pinned points breathe on
 * slow, unequal periods — a session widening and narrowing — and a wandering
 * load pushes on everything else, so the strands are stretched unevenly and
 * the stretch is real geometry rather than a colour applied to a static web.
 *
 * A strand carrying too much turns amber. One carrying more than it can breaks,
 * its ends recoil, and a few seconds later it is re-formed — a position
 * re-hedged. Nothing here predicts anything; it shows where the load is going
 * and which strand is nearest to giving, which is what the page claims.
 *
 * **Pointer:** it is more load. Positions within reach are drawn toward it, and
 * the strands behind them tighten and colour as they take the strain. Push far
 * enough and you can pick which one breaks — exposure you can see before it
 * hurts, in the only way a backdrop can show it.
 */

/** Free positions, and the anchors the book is held by. */
const FREE = 9
const ANCHORS = 4

/** Verlet: substeps per frame and constraint relaxation passes per substep. */
const SUBSTEPS = 2
const RELAX = 2
/**
 * How much of a strand's error one relaxation pass takes out. Low on purpose:
 * a correlation is elastic, and a web stiff enough to hold its shape exactly
 * is a web that never shows any tension at all.
 */
const STIFFNESS = 0.1
/** Velocity kept between steps. */
const DAMPING = 0.972

/**
 * Strand tension at which it has fully coloured, and at which it gives. Both
 * are set from what the web actually carries: with the load and breathing
 * below it cycles between roughly 0.10 and 0.31, so this colours through every
 * cycle and gives about once a minute without anybody touching it.
 */
const WARN_AT = 0.2
const SNAP_AT = 0.28
/** Seconds a broken strand stays broken before the position is re-hedged. */
const REFORM_SECONDS = 3.4

/**
 * The wandering load, in pixels per second squared. It has to be large next to
 * HOME_PULL below or the web never loads up: the two together set how far the
 * book is pushed off its resting shape.
 */
const LOAD = 54
/** How hard a position is held to its place in the book. */
const HOME_PULL = 1.7
/**
 * How far the four held points move, as a share of their radius, and how fast.
 * This is what actually loads the web: a body force has to fight the
 * constraints to stretch anything, whereas moving the ends stretches what is
 * between them directly.
 */
const BREATH = 0.2
const BREATH_RATE = 0.26
/** The pointer's reach as a share of the band's short side, and its pull. */
const REACH = 0.26
const PULL = 190

const CENTRE_X = 0.68
const CENTRE_Y = 0.5

type Node = {
  x: number
  y: number
  px: number
  py: number
  pinned: boolean
  /** Exposure, 0..1 — drawn as size, nothing more. */
  size: number
  /** Home position as a share of the band, so a resize re-seats it. */
  hx: number
  hy: number
  /** Sum of the tension in this position's strands, eased for drawing. */
  strain: number
}

type Strand = {
  a: number
  b: number
  rest: number
  broken: number
  /** Eased tension, so a strand's colour does not flicker per frame. */
  shown: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const warn = tokenRgb(host, '--warn', [251, 191, 36])
  const down = tokenRgb(host, '--down', [248, 113, 113])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1

  const nodes: Node[] = []
  const strands: Strand[] = []

  // Anchors on a wide ring, free positions on a tighter one plus one in the
  // middle: a book has a few fixed points and everything else hangs off them.
  for (let i = 0; i < ANCHORS; i++) {
    const angle = (i / ANCHORS) * Math.PI * 2 + 0.4
    nodes.push({
      x: 0,
      y: 0,
      px: 0,
      py: 0,
      pinned: true,
      size: 0.34,
      hx: Math.cos(angle),
      hy: Math.sin(angle),
      strain: 0,
    })
  }
  for (let i = 0; i < FREE; i++) {
    const angle = (i / FREE) * Math.PI * 2
    const radius = i % 3 === 0 ? 0.2 : 0.52
    nodes.push({
      x: 0,
      y: 0,
      px: 0,
      py: 0,
      pinned: false,
      // Concentration: a couple of positions carry much more than the rest.
      size: i === 1 || i === 5 ? 0.95 : 0.3 + Math.random() * 0.35,
      hx: Math.cos(angle) * radius,
      hy: Math.sin(angle) * radius,
      strain: 0,
    })
  }

  /** Seat every node at its home, at rest, and measure the strands. */
  const seat = () => {
    const cx = width * CENTRE_X
    const cy = height * CENTRE_Y
    const r = Math.min(width * 0.19, height * 0.42)
    for (const node of nodes) {
      node.x = cx + node.hx * r
      node.y = cy + node.hy * r
      node.px = node.x
      node.py = node.y
    }
    for (const strand of strands) {
      strand.rest = Math.hypot(
        nodes[strand.a].x - nodes[strand.b].x,
        nodes[strand.a].y - nodes[strand.b].y,
      )
    }
  }

  // Each free position is correlated with its neighbours and tied back to the
  // two nearest anchors — enough structure that load has somewhere to go.
  for (let i = 0; i < FREE; i++) {
    const self = ANCHORS + i
    strands.push({ a: self, b: ANCHORS + ((i + 1) % FREE), rest: 1, broken: 0, shown: 0 })
    if (i % 2 === 0) {
      strands.push({ a: self, b: ANCHORS + ((i + 3) % FREE), rest: 1, broken: 0, shown: 0 })
    }
    strands.push({ a: self, b: i % ANCHORS, rest: 1, broken: 0, shown: 0 })
  }
  seat()

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
      seat()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : Math.min(0.033, seconds - last)
      last = seconds

      ctx.clearRect(0, 0, width, height)

      const cx = width * CENTRE_X
      const cy = height * CENTRE_Y
      const r = Math.min(width * 0.19, height * 0.42)
      const reach = Math.min(width, height) * REACH

      // The wandering load: two slow periods, so it is never a single push.
      const loadX = Math.sin(seconds * 0.31) * LOAD + Math.sin(seconds * 0.77) * LOAD * 0.4
      const loadY = Math.cos(seconds * 0.23) * LOAD + Math.cos(seconds * 0.61) * LOAD * 0.4

      // ---- the held points move ----
      for (let i = 0; i < ANCHORS; i++) {
        const node = nodes[i]
        const scale = 1 + Math.sin(seconds * BREATH_RATE + i * 1.1) * BREATH
        node.x = cx + node.hx * r * scale
        node.y = cy + node.hy * r * scale
        // Pinned points carry no velocity of their own; they are where the
        // book is held, and the web feels them through its strands.
        node.px = node.x
        node.py = node.y
      }

      const h = dt / SUBSTEPS
      for (let step = 0; step < SUBSTEPS; step++) {
        // ---- integrate ----
        for (const node of nodes) {
          if (node.pinned) continue
          let ax = loadX
          let ay = loadY
          // Home pull, so the web keeps its shape instead of drifting away.
          ax += (cx + node.hx * r - node.x) * HOME_PULL
          ay += (cy + node.hy * r - node.y) * HOME_PULL
          if (pointerX >= 0) {
            const dx = pointerX - node.x
            const dy = pointerY - node.y
            const d = Math.hypot(dx, dy)
            if (d < reach && d > 0.001) {
              const force = (1 - d / reach) * PULL
              ax += (dx / d) * force
              ay += (dy / d) * force
            }
          }
          const vx = (node.x - node.px) * DAMPING
          const vy = (node.y - node.py) * DAMPING
          node.px = node.x
          node.py = node.y
          node.x += vx + ax * h * h
          node.y += vy + ay * h * h
        }

        // ---- relax the strands ----
        for (let pass = 0; pass < RELAX; pass++) {
          for (const strand of strands) {
            if (strand.broken > 0) continue
            const a = nodes[strand.a]
            const b = nodes[strand.b]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d = Math.hypot(dx, dy) || 0.001
            // A correlation is not a rigid rod: it takes up slack softly, so
            // the web stretches before it complains.
            const diff = ((d - strand.rest) / d) * STIFFNESS
            const ox = dx * diff
            const oy = dy * diff
            if (!a.pinned) {
              a.x += ox * (b.pinned ? 1 : 0.5)
              a.y += oy * (b.pinned ? 1 : 0.5)
            }
            if (!b.pinned) {
              b.x -= ox * (a.pinned ? 1 : 0.5)
              b.y -= oy * (a.pinned ? 1 : 0.5)
            }
          }
        }
      }

      // ---- tension, breaking, re-hedging ----
      for (const node of nodes) node.strain *= 0.86
      for (const strand of strands) {
        if (strand.broken > 0) {
          strand.broken -= dt
          if (strand.broken <= 0) {
            strand.broken = 0
            strand.shown = 0
          }
          continue
        }
        const a = nodes[strand.a]
        const b = nodes[strand.b]
        const d = Math.hypot(b.x - a.x, b.y - a.y)
        const tension = Math.max(0, (d - strand.rest) / strand.rest)
        strand.shown += (tension - strand.shown) * Math.min(1, 6 * dt)
        a.strain += tension
        b.strain += tension
        if (tension > SNAP_AT) {
          strand.broken = REFORM_SECONDS
          // The ends recoil: a strand that gives releases what it was holding.
          const nx = (b.x - a.x) / (d || 1)
          const ny = (b.y - a.y) / (d || 1)
          if (!a.pinned) {
            a.px += nx * 5
            a.py += ny * 5
          }
          if (!b.pinned) {
            b.px -= nx * 5
            b.py -= ny * 5
          }
        }
      }


      // ---- strands ----
      for (const strand of strands) {
        const a = nodes[strand.a]
        const b = nodes[strand.b]

        if (strand.broken > 0) {
          // Drawn as two stubs reaching for each other across a gap, fading
          // as the re-hedge comes in.
          const fade = Math.min(1, strand.broken / REFORM_SECONDS)
          const stub = 0.3
          ctx.strokeStyle = rgba(down, 0.12 + 0.3 * fade)
          ctx.lineWidth = 1.1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(a.x + (b.x - a.x) * stub, a.y + (b.y - a.y) * stub)
          ctx.moveTo(b.x, b.y)
          ctx.lineTo(b.x - (b.x - a.x) * stub, b.y - (b.y - a.y) * stub)
          ctx.stroke()
          continue
        }

        const t = strand.shown
        // Steel while slack, amber as it loads, down-red as it approaches
        // giving: the same three colours the rest of the site uses for this.
        // Squared on the way up so a lightly loaded web reads as steel rather
        // than as a band of amber with nothing wrong with it.
        const colour =
          t < WARN_AT
            ? mixRgb(steel, warn, (t / WARN_AT) ** 2)
            : mixRgb(warn, down, Math.min(1, (t - WARN_AT) / (SNAP_AT - WARN_AT)))
        ctx.strokeStyle = rgba(colour, 0.2 + Math.min(1, t / SNAP_AT) * 0.6)
        ctx.lineWidth = 1 + Math.min(1, t / SNAP_AT) * 2.2
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // ---- positions ----
      for (const node of nodes) {
        const strain = Math.min(1, node.strain / (SNAP_AT * 2.4))
        const radius = 2.8 + node.size * 5.6
        const colour = strain < 0.5 ? mixRgb(signal, warn, strain * 2) : mixRgb(warn, down, strain)

        if (strain > 0.05) {
          const glow = 14 + node.size * 16 + strain * 18
          const halo = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glow)
          halo.addColorStop(0, rgba(colour, 0.1 + strain * 0.3))
          halo.addColorStop(1, rgba(colour, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(node.x, node.y, glow, 0, Math.PI * 2)
          ctx.fill()
        }

        if (node.pinned) {
          // An anchor is drawn open: it is where the book is held, not a
          // position that can move.
          ctx.strokeStyle = rgba(steel, 0.5)
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          ctx.fillStyle = rgba(colour, 0.55 + strain * 0.4)
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    dispose() {
      untrack()
      nodes.length = 0
      strands.length = 0
    },
  }
}

export function TensionBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--tension', className)} aria-hidden />
}
