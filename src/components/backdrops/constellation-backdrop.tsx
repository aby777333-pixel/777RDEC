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
 * Notes, and what they have in common.
 *
 * Written for `/intelligence/research`, where the claim is that the research is
 * method rather than market calls. So the band is not a chart: it is the notes
 * themselves — each drawn as a short stack of ruled lines, the shape of a page
 * rather than a dot — joined wherever two of them share a method.
 *
 * One note is in hand at a time. From it a ring expands through the graph, and
 * every strand and note the ring reaches lights as it passes: the method
 * propagating out from where it was written down. Its immediate neighbours stay
 * lit after the ring has gone, because those are the ones actually cited.
 *
 * **Pointer:** it picks the note. The nearest one comes into hand, opens its
 * stack, and sends a new ring out from there — so moving across the band reads
 * the constellation from a different starting point each time. Untouched, it
 * moves on by itself every few seconds.
 */

/** Notes, and the methods they can share. */
const NOTES = 26
const METHODS = 5
/** How many of its nearest neighbours a note may be joined to. */
const MAX_LINKS = 3

/** The expanding ring: pixels per second, and how wide its front is. */
const WAVE_SPEED = 420
const WAVE_BAND = 110
/** Seconds before the note in hand changes when nothing is pointing. */
const HOLD_SECONDS = 3.6

/** The constellation's box, as shares of the band. */
const CENTRE_X = 0.68
const SPAN_X = 0.24
const SPAN_Y = 0.4

type Note = {
  /** Home position in -1..1, scaled to the band each frame. */
  nx: number
  ny: number
  x: number
  y: number
  /** Ruled lines in this note's stack. */
  lines: number
  methods: number[]
  seed: number
  /** Decaying light left by the ring. */
  glow: number
}

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
  let focus = 0
  let waveStart = 0
  let nextHold = HOLD_SECONDS
  /** Eased opening of the note in hand. */
  let opened = 0

  const notes: Note[] = []
  // Golden-angle placement: an even scatter with no lattice to it, which is
  // what a set of notes looks like and a grid does not.
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < NOTES; i++) {
    const radius = Math.sqrt((i + 0.6) / NOTES)
    const angle = i * golden
    const methods = [i % METHODS]
    if (i % 3 === 0) methods.push((i * 2 + 1) % METHODS)
    notes.push({
      nx: Math.cos(angle) * radius,
      ny: Math.sin(angle) * radius,
      x: 0,
      y: 0,
      lines: 2 + (i % 3),
      methods,
      seed: Math.random(),
      glow: 0,
    })
  }

  // A link needs a shared method and proximity: method alone joins everything
  // to everything, and proximity alone says nothing.
  const links: { a: number; b: number }[] = []
  const neighbours: number[][] = notes.map(() => [])
  for (let i = 0; i < NOTES; i++) {
    const near = notes
      .map((n, j) => ({ j, d: Math.hypot(n.nx - notes[i].nx, n.ny - notes[i].ny) }))
      .filter(
        (entry) =>
          entry.j !== i && notes[entry.j].methods.some((m) => notes[i].methods.includes(m)),
      )
      .sort((p, q) => p.d - q.d)
      .slice(0, MAX_LINKS)
    for (const { j } of near) {
      if (neighbours[i].includes(j)) continue
      links.push({ a: i, b: j })
      neighbours[i].push(j)
      neighbours[j].push(i)
    }
  }

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

  const place = () => {
    const cx = width * CENTRE_X
    const cy = height * 0.5
    const sx = Math.min(width * SPAN_X, height * 0.9)
    const sy = height * SPAN_Y
    for (const note of notes) {
      note.x = cx + note.nx * sx
      note.y = cy + note.ny * sy
    }
  }
  place()

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      place()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : Math.min(0.05, seconds - last)
      last = seconds

      ctx.clearRect(0, 0, width, height)
      place()

      // ---- which note is in hand ----
      let wanted = focus
      if (pointerX >= 0) {
        let bestD = Infinity
        for (let i = 0; i < notes.length; i++) {
          const d = Math.hypot(notes[i].x - pointerX, notes[i].y - pointerY)
          if (d < bestD) {
            bestD = d
            wanted = i
          }
        }
      } else if (seconds > nextHold) {
        nextHold = seconds + HOLD_SECONDS
        wanted = (focus + 1 + ((Math.random() * (NOTES - 1)) | 0)) % NOTES
      }
      if (wanted !== focus) {
        focus = wanted
        // A new note in hand sends a new ring; that is the only trigger.
        waveStart = seconds
      }
      opened += ((pointerX >= 0 ? 1 : 0.45) - opened) * Math.min(1, 5 * dt)

      const held = notes[focus]
      // Once a ring has left the band it is sent again, so holding the pointer
      // still on one note keeps reading from it rather than going quiet.
      const diagonal = Math.hypot(width, height)
      if ((seconds - waveStart) * WAVE_SPEED > diagonal + WAVE_BAND) waveStart = seconds
      const radius = (seconds - waveStart) * WAVE_SPEED
      /** How hard the ring is hitting a point right now. */
      const front = (x: number, y: number) => {
        const d = Math.hypot(x - held.x, y - held.y)
        const off = Math.abs(d - radius)
        return off > WAVE_BAND ? 0 : (1 - off / WAVE_BAND) ** 2
      }

      // ---- strands ----
      for (const link of links) {
        const a = notes[link.a]
        const b = notes[link.b]
        const cited = link.a === focus || link.b === focus
        const hit = front((a.x + b.x) / 2, (a.y + b.y) / 2)
        // A cited strand stays lit; everything else only while the ring is on
        // it. Both read off the same number, so nothing has a separate rule.
        const heat = Math.max(hit, cited ? 0.55 + 0.25 * opened : 0)
        ctx.strokeStyle = rgba(mixRgb(steel, signal, heat), 0.13 + heat * 0.45)
        ctx.lineWidth = 0.7 + heat * 1.6
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // ---- notes ----
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i]
        note.glow = Math.max(note.glow * (1 - Math.min(1, 2.2 * dt)), front(note.x, note.y))
        const isHeld = i === focus
        const cited = neighbours[focus].includes(i)
        const heat = Math.max(note.glow, isHeld ? 1 : cited ? 0.45 : 0)

        // The stack: ruled lines of varying length, widening slightly when the
        // note is the one in hand. A page, not a bullet.
        const lineGap = 2.6 + (isHeld ? opened * 1.4 : 0)
        const halfWidth = 5 + (isHeld ? opened * 3.5 : 0)
        ctx.lineWidth = 1.3
        ctx.strokeStyle = rgba(mixRgb(steel, signal, heat), 0.3 + heat * 0.55)
        ctx.beginPath()
        for (let row = 0; row < note.lines; row++) {
          const y = note.y + (row - (note.lines - 1) / 2) * lineGap
          const shrink = row === note.lines - 1 ? 0.55 : 0.85 + ((note.seed * 13 + row) % 1) * 0.15
          ctx.moveTo(note.x - halfWidth, y)
          ctx.lineTo(note.x - halfWidth + halfWidth * 2 * shrink, y)
        }
        ctx.stroke()

        if (heat > 0.05) {
          const glow = 12 + heat * 22
          const halo = ctx.createRadialGradient(note.x, note.y, 0, note.x, note.y, glow)
          halo.addColorStop(0, rgba(signal, heat * 0.3))
          halo.addColorStop(1, rgba(signal, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(note.x, note.y, glow, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // ---- the ring itself, faint, so the propagation has a cause ----
      if (radius > 4 && radius < Math.max(width, height)) {
        ctx.strokeStyle = rgba(signal, 0.1)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(held.x, held.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
    dispose() {
      untrack()
      notes.length = 0
      links.length = 0
    },
  }
}

export function ConstellationBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--constellation', className)} aria-hidden />
  )
}
