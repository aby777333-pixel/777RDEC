'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "The Last Experience" by ge1doot, ported.
 * https://codepen.io/ge1doot/pen/LZdOwj
 *
 * Six rag-doll figures, each eleven points held together by ten distance
 * constraints and integrated by Verlet, so the whole body is physical: a limb
 * that is moved drags the rest after it, and everything falls. They dance by
 * pushing their own joints on a fixed pattern that reverses direction every
 * twenty frames, and they stand on a floor at the bottom of the band.
 *
 * The skeleton, the joint pushes, the constraint solver, the damping, gravity,
 * the six hues and the pre-rendered rounded strokes with their offset shadows
 * are all the pen's, values included.
 *
 * Its staging is not, because the pen is staged for a window and this is a
 * band inside a page:
 *
 * - **No letterbox.** The pen fills the top and bottom fifteen percent of the
 *   canvas with `#222`. Full screen that reads as a stage; in a hero it is a
 *   grey bar across the top of the section, over the eyebrow, with no visible
 *   reason for being there.
 * - **Sized to the band, not to the viewport.** The pen's `sqrt(min(w,h))/6`
 *   is tuned for a window as tall as it is usable. A hero band is wider than
 *   it is tall and runs past the fold, so the same figures stood on a floor at
 *   85% with their feet below the fold. They are now a fixed share of the
 *   band's height and stand on a floor inside it, so the whole line is visible
 *   at every size.
 *
 * Its nature is that you can take hold of one. Press within sixty pixels of a
 * joint and it follows the pointer, the body hanging off it, until you let go
 * — and if you hold a small dancer long enough it hands you a bigger one.
 * Both kept, read against the band rather than the window.
 *
 * Two changes:
 *
 * 1. **No worker.** The pen runs the simulation in a Web Worker on an
 *    `OffscreenCanvas`, built by stringifying its own function into a blob —
 *    and carries a main-thread fallback for browsers without either. The
 *    fallback is the same simulation, and that is the path taken here: sixty
 *    points and sixty constraints is not work worth a thread, and a blob
 *    worker is the first thing a content security policy refuses.
 * 2. **A grab takes the gesture, but never someone else's.** Only when a joint
 *    is actually caught does this call `preventDefault`, so dragging a dancer
 *    does not also drag a selection across the headline; a press that catches
 *    nothing is left alone, so the copy stays selectable. And a press that
 *    lands on a link or a button is not a grab at all, because cancelling a
 *    `pointerdown` can take the click with it.
 */

/** How close a press must be to a joint to catch it. */
const GRAB_RADIUS = 60
/** The pen's own dancer count. */
const DANCERS = 6

/**
 * The dancers' lightness, below the pen's 80.
 *
 * The pen stands them on black with nothing else in the frame, so pale limbs
 * are right. Here they stand behind a headline set in light grey, and at 80
 * the headline disappears into them wherever they cross. At this level they
 * are still plainly the pen's six colours and still the brightest thing in
 * the band, and the copy reads over them. Restore `80` for the pen's own
 * palette.
 */
const LIGHT = 48

/**
 * The figure, in skeleton units: the head's top sits 26 above the origin once
 * its disk is counted, the feet 64 below it, so a dancer is 90 units tall.
 */
const UNITS_ABOVE = 26
const UNITS_BELOW = 64
const UNITS_TALL = UNITS_ABOVE + UNITS_BELOW

/** How much of the band's height one dancer takes, and where the floor is. */
const FIGURE_SHARE = 0.45
const GROUND = 0.82

/**
 * The band's width divided by this is the widest a dancer may be, and it is
 * the pen's own proportion: at the window it is drawn for, the gap between two
 * dancers is about thirty-three times their scale, and the line spaces itself
 * across ninths of the width. Without this the height rule alone would put six
 * full-height figures across a phone, shoulder through shoulder.
 */
const WIDTH_PER_SIZE = 297
/** The drop they settle through on arrival, in pixels. */
const DROP = 40

type PointSpec = {
  x: number
  y: number
  /** The joint's own push: `s` is scaled by size, `d` is the current direction. */
  f?: (p: Point, s: number, d: number, ts: number) => void
}

type LinkSpec = {
  p0: number
  p1: number
  size: number
  lum: number
  disk?: number
}

/** The pen's skeleton, verbatim. */
const POINTS: readonly PointSpec[] = [
  {
    x: 0,
    y: -4,
    f(p, s, _d, ts) {
      p.y -= 0.01 * s * ts
    },
  },
  {
    x: 0,
    y: -16,
    f(p, s, d, ts) {
      p.y -= 0.02 * s * d * ts
    },
  },
  {
    x: 0,
    y: 12,
    f(p, s, d, ts) {
      p.y += 0.02 * s * d * ts
    },
  },
  { x: -12, y: 0 },
  { x: 12, y: 0 },
  {
    x: -3,
    y: 34,
    f(p, s, d, ts) {
      if (d > 0) {
        p.x += 0.01 * s * ts
        p.y -= 0.015 * s * ts
      } else {
        p.y += 0.02 * s * ts
      }
    },
  },
  {
    x: 3,
    y: 34,
    f(p, s, d, ts) {
      if (d > 0) {
        p.y += 0.02 * s * ts
      } else {
        p.x -= 0.01 * s * ts
        p.y -= 0.015 * s * ts
      }
    },
  },
  {
    x: -28,
    y: 0,
    f(p, s, _d, ts) {
      p.x += p.vx * 0.025 * ts
      p.y -= 0.001 * s * ts
    },
  },
  {
    x: 28,
    y: 0,
    f(p, s, _d, ts) {
      p.x += p.vx * 0.025 * ts
      p.y -= 0.001 * s * ts
    },
  },
  {
    x: -3,
    y: 64,
    f(p, s, d, ts) {
      p.y += 0.015 * s * ts
      if (d > 0) {
        p.y -= 0.01 * s * ts
      } else {
        p.y += 0.05 * s * ts
      }
    },
  },
  {
    x: 3,
    y: 64,
    f(p, s, d, ts) {
      p.y += 0.015 * s * ts
      if (d > 0) {
        p.y += 0.05 * s * ts
      } else {
        p.y -= 0.01 * s * ts
      }
    },
  },
]

const LINKS: readonly LinkSpec[] = [
  { p0: 3, p1: 7, size: 12, lum: 0.5 },
  { p0: 1, p1: 3, size: 24, lum: 0.5 },
  { p0: 1, p1: 0, size: 60, lum: 0.5, disk: 1 },
  { p0: 5, p1: 9, size: 16, lum: 0.5 },
  { p0: 2, p1: 5, size: 32, lum: 0.5 },
  { p0: 1, p1: 2, size: 50, lum: 1 },
  { p0: 6, p1: 10, size: 16, lum: 1.5 },
  { p0: 2, p1: 6, size: 32, lum: 1.5 },
  { p0: 4, p1: 8, size: 12, lum: 1.5 },
  { p0: 1, p1: 4, size: 24, lum: 1.5 },
]

class Point {
  x: number
  y: number
  px: number
  py: number
  vx = 0
  vy = 0
  /** Every joint in the pen weighs the same; the solver reads it anyway. */
  w = 0.5
  fn: PointSpec['f']

  constructor(x: number, y: number, fn: PointSpec['f']) {
    this.x = x
    this.y = y
    this.px = x
    this.py = y
    this.fn = fn
  }
}

class Link {
  p0: Point
  p1: Point
  distance: number
  size: number
  force = 0.5
  image: HTMLCanvasElement
  shadow: HTMLCanvasElement

  constructor(
    p0: Point,
    p1: Point,
    distance: number,
    size: number,
    colour: string,
    disk: boolean,
  ) {
    this.p0 = p0
    this.p1 = p1
    this.distance = distance
    this.size = size
    this.image = stroke(colour, true, disk, distance, size)
    this.shadow = stroke('rgba(0,0,0,0.5)', false, disk, distance, size)
  }

  /** One pass of the distance constraint, weighted by both ends. */
  update() {
    const { p0, p1 } = this
    const dx = p1.x - p0.x
    const dy = p1.y - p0.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= 0) return
    const tw = p0.w + p1.w
    const r1 = p1.w / tw
    const r0 = p0.w / tw
    const dz = (this.distance - dist) * this.force
    const sx = (dx / dist) * dz
    const sy = (dy / dist) * dz
    p1.x += sx * r0
    p1.y += sy * r0
    p0.x -= sx * r1
    p0.y -= sy * r1
  }
}

/**
 * The pen pre-renders every limb once — a round-capped stroke, or a disk for
 * the head, with two black pins at the joints — and then only ever rotates and
 * blits it. The shadow is the same shape in half-black.
 */
function stroke(
  colour: string,
  axis: boolean,
  disk: boolean,
  dist: number,
  size: number,
): HTMLCanvasElement {
  const image = document.createElement('canvas')
  image.width = Math.max(1, Math.ceil(dist + size))
  image.height = Math.max(1, Math.ceil(size))
  const ict = image.getContext('2d')
  if (!ict) return image
  ict.beginPath()
  ict.lineCap = 'round'
  ict.lineWidth = size
  ict.strokeStyle = colour
  if (disk) {
    ict.arc(size * 0.5 + dist, size * 0.5, size * 0.5, 0, 2 * Math.PI)
    ict.fillStyle = colour
    ict.fill()
  } else {
    ict.moveTo(size * 0.5, size * 0.5)
    ict.lineTo(size * 0.5 + dist, size * 0.5)
    ict.stroke()
  }
  if (axis) {
    const s = size / 10
    ict.fillStyle = '#000'
    ict.fillRect(size * 0.5 - s, size * 0.5 - s, s * 2, s * 2)
    ict.fillRect(size * 0.5 - s + dist, size * 0.5 - s, s * 2, s * 2)
  }
  return image
}

class Robot {
  x: number
  size: number
  colour: number
  light: number
  frame = 0
  dir = 1
  points: Point[] = []
  links: Link[] = []

  constructor(colour: number, light: number, size: number, x: number, y: number) {
    this.x = x
    this.size = size
    this.colour = Math.round(colour)
    this.light = light

    for (const p of POINTS) this.points.push(new Point(size * p.x + x, size * p.y + y, p.f))

    for (const spec of LINKS) {
      const p0 = this.points[spec.p0]
      const p1 = this.points[spec.p1]
      const dx = p0.x - p1.x
      const dy = p0.y - p1.y
      this.links.push(
        new Link(
          p0,
          p1,
          Math.sqrt(dx * dx + dy * dy),
          (spec.size * size) / 3,
          `hsl(${this.colour} ,30%, ${this.light * spec.lum}%)`,
          Boolean(spec.disk),
        ),
      )
    }
  }
}

type Pointer = {
  x: number
  y: number
  dancerDrag: Robot | null
  pointDrag: Point | null
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let ground = 1
  let ts = 1
  let lastSeconds = -1
  let dancers: Robot[] = []

  const pointer: Pointer = { x: 0, y: 0, dancerDrag: null, pointDrag: null }

  /**
   * A dancer's scale: FIGURE_SHARE of the band's height, unless the band is
   * too narrow to line six of them up at that size, in which case the width
   * decides.
   */
  const sizeForBand = () =>
    Math.max(1, Math.min((height * FIGURE_SHARE) / UNITS_TALL, width / WIDTH_PER_SIZE))

  const seed = () => {
    dancers = []
    ground = GROUND
    const size = sizeForBand()
    // Stand them on the floor, less the drop they settle through.
    const origin = height * ground - UNITS_BELOW * size - DROP
    for (let i = 0; i < DANCERS; i++) {
      dancers.push(new Robot((i * 360) / 7, LIGHT, size, ((i + 2) * width) / 9, origin))
    }
  }

  const section = host.parentElement ?? host
  const toLocal = (clientX: number, clientY: number) => {
    const r = host.getBoundingClientRect()
    pointer.x = clientX - r.left
    pointer.y = clientY - r.top
  }

  const onMove = (e: PointerEvent) => toLocal(e.clientX, e.clientY)
  /** Anything the visitor might be pressing on purpose. */
  const INTERACTIVE = 'a, button, input, select, textarea, summary, [role="button"], [tabindex]'
  const onDown = (e: PointerEvent) => {
    // A press on a link or a button belongs to the link or the button. The
    // grab below calls preventDefault, which in some browsers takes the click
    // with it, so the dancers do not reach for anything a visitor may have
    // meant to press.
    const target = e.target
    if (target instanceof Element && target.closest(INTERACTIVE)) return
    toLocal(e.clientX, e.clientY)
    for (const dancer of dancers) {
      for (const point of dancer.points) {
        const dx = pointer.x - point.x
        const dy = pointer.y - point.y
        if (Math.sqrt(dx * dx + dy * dy) < GRAB_RADIUS) {
          pointer.dancerDrag = dancer
          pointer.pointDrag = point
          dancer.frame = 0
          // Only now: a caught joint owns the gesture, so the drag does not
          // also sweep a text selection across the hero.
          e.preventDefault()
          return
        }
      }
    }
  }
  const onUp = () => {
    pointer.dancerDrag = null
    pointer.pointDrag = null
  }

  section.addEventListener('pointermove', onMove)
  section.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  section.addEventListener('pointerleave', onUp)

  seed()

  const update = (robot: Robot) => {
    // The pen reverses the dance every twenty frames at sixty hertz, and
    // scales that with the display like everything else.
    if (++robot.frame % Math.max(1, Math.round(20 / ts)) === 0) robot.dir = -robot.dir

    // The pen's own reward for holding onto a small dancer: a bigger one,
    // brighter and a step round the colour wheel.
    if (robot === pointer.dancerDrag && robot.size < 16 && robot.frame > 600) {
      pointer.dancerDrag = null
      pointer.pointDrag = null
      dancers.push(
        new Robot(
          robot.colour + 90,
          robot.light * 1.25,
          robot.size * 2,
          pointer.x,
          pointer.y - 100 * robot.size * 2,
        ),
      )
      dancers.sort((a, b) => a.size - b.size)
    }

    for (const link of robot.links) link.update()

    for (const point of robot.points) {
      if (robot === pointer.dancerDrag && point === pointer.pointDrag) {
        point.x += (pointer.x - point.x) * 0.1
        point.y += (pointer.y - point.y) * 0.1
      }
      if (robot !== pointer.dancerDrag) {
        point.fn?.(point, 16 * Math.sqrt(robot.size), robot.dir, ts)
      }
      // Verlet: the step is the difference between the last two positions.
      point.vx = point.x - point.px
      point.vy = point.y - point.py
      point.px = point.x
      point.py = point.y
      point.vx *= 0.995
      point.vy *= 0.995
      point.x += point.vx
      point.y += point.vy + 0.01 * ts
    }

    // The floor, applied to the far end of every limb.
    for (const link of robot.links) {
      const p1 = link.p1
      const floor = height * ground - link.size * 0.5
      if (p1.y > floor) {
        p1.y = floor
        p1.x -= p1.vx
        p1.vx = 0
        p1.vy = 0
      }
    }

    // And a very slow pull back to the dancer's own place in the line.
    robot.points[3].x += (robot.x - robot.points[3].x) * 0.001
  }

  const draw = (robot: Robot) => {
    for (const link of robot.links) {
      if (!link.size) continue
      const dx = link.p1.x - link.p0.x
      const dy = link.p1.y - link.p0.y
      const a = Math.atan2(dy, dx)

      ctx.save()
      ctx.translate(link.p0.x + link.size * 0.25, link.p0.y + link.size * 0.25)
      ctx.rotate(a)
      ctx.drawImage(link.shadow, -link.size * 0.5, -link.size * 0.5)
      ctx.restore()

      ctx.save()
      ctx.translate(link.p0.x, link.p0.y)
      ctx.rotate(a)
      ctx.drawImage(link.image, -link.size * 0.5, -link.size * 0.5)
      ctx.restore()
    }
  }

  return {
    resize(w, h) {
      const resized = Math.abs(h - height) > 1 || Math.abs(w - width) > 1
      width = w
      height = h
      ground = GROUND
      // The pen only re-spaces the line on resize, because its dancers are
      // sized once. These are sized to the band, and a limb's image is
      // rendered at the size it was born at — so a resize is a new line
      // rather than a stretched one.
      if (resized || dancers.length === 0) seed()
      else for (let i = 0; i < dancers.length; i++) dancers[i].x = ((i + 2) * width) / 9
    },
    frame(seconds) {
      // The pen's frame-rate compensation: the step is eased toward the real
      // frame time and never allowed above one sixtieth.
      if (lastSeconds >= 0 && seconds > lastSeconds) {
        const t = ((seconds - lastSeconds) * 1000) / 16
        ts += (t - ts) * 0.1
        if (ts > 1) ts = 1
        if (ts < 0.05) ts = 0.05
      }
      lastSeconds = seconds

      ctx.clearRect(0, 0, width, height)

      for (const dancer of dancers) {
        update(dancer)
        draw(dancer)
      }
    },
    dispose() {
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      section.removeEventListener('pointerleave', onUp)
      dancers = []
    },
  }
}

export function DancersBackdrop({ className }: { className?: string }) {
  // The pen renders at one pixel per pixel and blits pre-rendered limbs; there
  // is nothing to gain from a denser backing store.
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--dancers', className)} aria-hidden />
}
