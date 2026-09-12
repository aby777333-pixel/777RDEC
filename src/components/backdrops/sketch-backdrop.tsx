'use client'

import { cn } from '@/lib/utils'
import {
  type BackdropScene,
  rgba,
  tokenRgb,
  trackPointer,
  useBackdropCanvas,
} from './use-backdrop-canvas'

/**
 * The figures, being drawn.
 *
 * Written for `/blog`, which says the writing is method rather than market
 * calls. The honest picture of that is not a quill or a stack of pages — it is
 * the figures such a piece of writing is made of. So the band draws one:
 * stroke by stroke, at the speed a hand would, then holds it, then takes it
 * away the same way and starts the next.
 *
 * There are four, and they are the four shapes the posts are actually built
 * from: a distribution, a flow, a pair of series compared, and a scatter with a
 * line through it. Every stroke is a real polyline drawn to a fraction of its
 * own length, which is why the drawing reads as drawing and not as a fade.
 *
 * **Pointer:** its horizontal position picks which figure. Move across the band
 * and whatever is on it is put away and the one you chose is drawn instead, at
 * roughly twice the speed — the same gesture as flicking through a notebook.
 */

/** How fast a figure is drawn and undrawn, as a share of its length per second. */
const DRAW_RATE = 0.55
const ERASE_RATE = 0.9
/** Seconds a finished figure is held. */
const HOLD_SECONDS = 2.4
/** How much faster it goes while the pointer is on the band. */
const HELD_RATE = 2

/** The figure's box, as shares of the band. */
const LEFT = 0.55
const RIGHT = 0.95
const TOP = 0.2
const BOTTOM = 0.74

/**
 * The four figures, each a list of polylines in 0..1 of the box. Written out
 * rather than generated: these are specific shapes, and a generator would give
 * four variations on one shape.
 */
type Stroke = [number, number][]
const FIGURES: readonly Stroke[][] = [
  // A distribution: axis, then the curve, then the bars under it.
  [
    [
      [0, 1],
      [1, 1],
    ],
    Array.from({ length: 22 }, (_, i) => {
      const t = i / 21
      return [t, 1 - Math.exp(-((t - 0.42) ** 2) / 0.035) * 0.85] as [number, number]
    }),
    ...[0.2, 0.32, 0.44, 0.56, 0.68].map(
      (t): Stroke => [
        [t, 1],
        [t, 1 - Math.exp(-((t - 0.42) ** 2) / 0.035) * 0.8],
      ],
    ),
  ],
  // A flow: three boxes and the arrows between them.
  [
    [
      [0.02, 0.35],
      [0.24, 0.35],
      [0.24, 0.65],
      [0.02, 0.65],
      [0.02, 0.35],
    ],
    [
      [0.24, 0.5],
      [0.38, 0.5],
    ],
    [
      [0.38, 0.35],
      [0.6, 0.35],
      [0.6, 0.65],
      [0.38, 0.65],
      [0.38, 0.35],
    ],
    [
      [0.6, 0.5],
      [0.74, 0.5],
    ],
    [
      [0.74, 0.35],
      [0.96, 0.35],
      [0.96, 0.65],
      [0.74, 0.65],
      [0.74, 0.35],
    ],
    [
      [0.31, 0.5],
      [0.31, 0.14],
      [0.85, 0.14],
      [0.85, 0.35],
    ],
  ],
  // Two series compared: axis and two traces on different periods.
  [
    [
      [0, 1],
      [0, 0],
    ],
    [
      [0, 1],
      [1, 1],
    ],
    Array.from({ length: 26 }, (_, i) => {
      const t = i / 25
      return [t, 0.55 - Math.sin(t * 5.2) * 0.3] as [number, number]
    }),
    Array.from({ length: 26 }, (_, i) => {
      const t = i / 25
      return [t, 0.62 - Math.sin(t * 5.2 - 0.9) * 0.22] as [number, number]
    }),
  ],
  // A scatter with a line through it: the points as little crosses, then the fit.
  [
    ...Array.from({ length: 11 }, (_, i): Stroke => {
      const t = 0.06 + i * 0.088
      const y = 0.88 - t * 0.66 + (((i * 37) % 7) / 7 - 0.5) * 0.22
      return [
        [t - 0.012, y],
        [t + 0.012, y],
      ]
    }),
    ...Array.from({ length: 11 }, (_, i): Stroke => {
      const t = 0.06 + i * 0.088
      const y = 0.88 - t * 0.66 + (((i * 37) % 7) / 7 - 0.5) * 0.22
      return [
        [t, y - 0.028],
        [t, y + 0.028],
      ]
    }),
    [
      [0.02, 0.9],
      [0.98, 0.24],
    ],
  ],
]

/** Total length of a figure, in box units, so drawing runs at one speed. */
function measure(strokes: readonly Stroke[]): number[] {
  return strokes.map((stroke) => {
    let total = 0
    for (let i = 1; i < stroke.length; i++) {
      total += Math.hypot(stroke[i][0] - stroke[i - 1][0], stroke[i][1] - stroke[i - 1][1])
    }
    // A zero-length stroke would never finish; give it a nominal length.
    return Math.max(total, 0.02)
  })
}

const LENGTHS = FIGURES.map(measure)
const TOTALS = LENGTHS.map((lengths) => lengths.reduce((a, b) => a + b, 0))

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1

  let figure = 0
  /**
   * How much of the figure is on the band, 0..1 of its total length. It starts
   * complete and held, so the band arrives with a figure on it rather than
   * spending its first second and a half blank.
   */
  let drawn = 1
  /** 1 drawing, 0 holding, -1 erasing. */
  let phase: 1 | 0 | -1 = 0
  let holding = 0
  /** The figure the pointer has asked for, once the current one is away. */
  let wanted = 0

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : Math.min(0.05, seconds - last)
      last = seconds

      ctx.clearRect(0, 0, width, height)

      const x0 = width * LEFT
      const x1 = width * RIGHT
      const top = height * TOP
      const bottom = height * BOTTOM
      const point = (p: [number, number]): [number, number] => [
        x0 + (x1 - x0) * p[0],
        top + (bottom - top) * p[1],
      ]

      // ---- which figure is asked for ----
      const pointing = pointerX >= x0 - width * 0.05 && pointerY > top - 60 && pointerY < bottom + 60
      if (pointing) {
        wanted = Math.min(
          FIGURES.length - 1,
          Math.max(0, Math.floor(((pointerX - x0) / (x1 - x0)) * FIGURES.length)),
        )
        // A different figure asked for while this one is up: put it away.
        if (wanted !== figure && phase !== -1) phase = -1
      }
      const rate = pointing ? HELD_RATE : 1

      // ---- draw, hold, erase ----
      if (phase === 1) {
        drawn += dt * DRAW_RATE * rate
        if (drawn >= 1) {
          drawn = 1
          phase = 0
          holding = 0
        }
      } else if (phase === 0) {
        holding += dt * rate
        if (holding > HOLD_SECONDS) phase = -1
      } else {
        drawn -= dt * ERASE_RATE * rate
        if (drawn <= 0) {
          drawn = 0
          figure = pointing ? wanted : (figure + 1) % FIGURES.length
          phase = 1
        }
      }

      // ---- the figure, to the length it has reached ----
      const strokes = FIGURES[figure]
      const lengths = LENGTHS[figure]
      const budget = drawn * TOTALS[figure]
      let spent = 0

      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      for (let s = 0; s < strokes.length; s++) {
        if (spent >= budget) break
        const stroke = strokes[s]
        const share = Math.min(1, (budget - spent) / lengths[s])
        spent += lengths[s]

        // The stroke being drawn right now is the bright one; finished strokes
        // settle back to steel. That is what makes it read as a hand at work.
        const active = share < 1
        ctx.strokeStyle = rgba(active ? signal : steel, active ? 0.7 : 0.4)
        ctx.lineWidth = active ? 2 : 1.6

        ctx.beginPath()
        ctx.moveTo(...point(stroke[0]))
        let run = 0
        const want = share * lengths[s]
        for (let i = 1; i < stroke.length; i++) {
          const segment = Math.hypot(
            stroke[i][0] - stroke[i - 1][0],
            stroke[i][1] - stroke[i - 1][1],
          )
          if (run + segment <= want) {
            ctx.lineTo(...point(stroke[i]))
            run += segment
            continue
          }
          // Part-way along the last segment: this is where the pen is.
          const t = segment > 0 ? (want - run) / segment : 0
          const px = stroke[i - 1][0] + (stroke[i][0] - stroke[i - 1][0]) * t
          const py = stroke[i - 1][1] + (stroke[i][1] - stroke[i - 1][1]) * t
          ctx.lineTo(...point([px, py]))
          break
        }
        ctx.stroke()
      }

      // ---- which of the four is up ----
      const markWidth = (x1 - x0) / FIGURES.length
      for (let i = 0; i < FIGURES.length; i++) {
        ctx.strokeStyle = rgba(i === figure ? signal : steel, i === figure ? 0.4 : 0.14)
        ctx.lineWidth = i === figure ? 2 : 1
        ctx.beginPath()
        ctx.moveTo(x0 + i * markWidth + 6, bottom + 12)
        ctx.lineTo(x0 + (i + 1) * markWidth - 6, bottom + 12)
        ctx.stroke()
      }
    },
    dispose() {
      untrack()
    },
  }
}

export function SketchBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--sketch', className)} aria-hidden />
}
