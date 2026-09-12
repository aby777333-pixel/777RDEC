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
 * Records with the names taken out.
 *
 * Written for `/company/proof`, which opens by saying it does not publish
 * client names. So the band is evidence with the identifying field covered: a
 * column of records, each drawn as a row of fields, and the first field of
 * every one replaced by a solid block. Everything else about the record is
 * drawn in full, because the page's position is that the evidence stands
 * without the name attached to it.
 *
 * New records arrive from the bottom and the redaction happens where you can
 * see it: the name field is drawn for an instant, then covered. The block is
 * applied, not merely absent.
 *
 * **Pointer:** the record nearest it opens — its remaining fields extend and
 * brighten, and a further line of detail appears under it. The block over the
 * name does not lift, at any distance, which is the only way a backdrop can
 * make that promise.
 */

/** Records held on the band, and how often a new one arrives. */
const RECORDS = 7
const ARRIVE_EVERY = 3.2
/** Seconds the name is visible before it is covered. */
const EXPOSED_SECONDS = 0.34
/** Seconds a record takes to slide into place. */
const SLIDE_SECONDS = 0.5

/**
 * The column, as shares of the band. Far enough right that the first field of
 * a record is not sitting behind the last word of the headline.
 */
const LEFT = 0.6
const RIGHT = 0.96

type Entry = {
  /** Field widths after the redacted one, as shares of the row. */
  fields: number[]
  /** How wide the redaction block is. */
  nameWidth: number
  /** Seconds since this record arrived. */
  age: number
  /** Eased opening under the pointer. */
  open: number
  seed: number
}

function newRecord(age: number): Entry {
  const count = 3 + ((Math.random() * 2) | 0)
  return {
    fields: Array.from({ length: count }, () => 0.08 + Math.random() * 0.13),
    nameWidth: 0.1 + Math.random() * 0.07,
    age,
    open: 0,
    seed: Math.random(),
  }
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
  let nextArrival = ARRIVE_EVERY

  // Seeded full, with ages spread out, so the band arrives already populated
  // and already redacted rather than filling up in front of the visitor.
  const records: Entry[] = Array.from({ length: RECORDS }, (_, i) =>
    newRecord(2 + (RECORDS - i) * ARRIVE_EVERY),
  )

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
      const span = x1 - x0
      const rowGap = Math.min(30, (height * 0.72) / RECORDS)
      const top = height * 0.5 - ((RECORDS - 1) * rowGap) / 2

      // ---- arrivals ----
      if (seconds > nextArrival) {
        nextArrival = seconds + ARRIVE_EVERY
        records.unshift(newRecord(0))
        if (records.length > RECORDS) records.pop()
      }
      for (const record of records) record.age += dt

      // ---- which record is open ----
      let openIndex = -1
      if (pointerX >= x0 - span * 0.1) {
        let bestD = rowGap
        for (let i = 0; i < records.length; i++) {
          const d = Math.abs(top + i * rowGap - pointerY)
          if (d < bestD) {
            bestD = d
            openIndex = i
          }
        }
      }

      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        record.open += ((i === openIndex ? 1 : 0) - record.open) * Math.min(1, 6 * dt)

        // A new record slides up into its row as the ones below it shift down.
        const slide = Math.min(1, record.age / SLIDE_SECONDS)
        const eased = slide * slide * (3 - 2 * slide)
        const y = top + i * rowGap + (1 - eased) * rowGap
        const enter = eased
        const open = record.open

        // ---- the identifying field ----
        const nameW = span * record.nameWidth
        if (record.age < EXPOSED_SECONDS) {
          // Drawn, briefly, as the thing that is about to be covered.
          const fade = 1 - record.age / EXPOSED_SECONDS
          ctx.strokeStyle = rgba(signal, 0.5 * fade * enter)
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.moveTo(x0, y)
          ctx.lineTo(x0 + nameW, y)
          ctx.stroke()
        } else {
          // The block. Slightly taller than the rules beside it, so it reads
          // as something laid over the record rather than part of it.
          const grow = Math.min(1, (record.age - EXPOSED_SECONDS) / 0.25)
          ctx.fillStyle = rgba(steel, (0.26 + open * 0.1) * enter)
          ctx.fillRect(x0, y - 4.5, nameW * grow, 9)
        }

        // ---- everything else about the record ----
        let cursor = x0 + nameW + span * 0.035
        ctx.lineWidth = 2
        for (let f = 0; f < record.fields.length; f++) {
          const fieldWidth = span * record.fields[f] * (1 + open * 0.22)
          ctx.strokeStyle = rgba(steel, (0.3 + open * 0.4) * enter)
          ctx.beginPath()
          ctx.moveTo(cursor, y)
          ctx.lineTo(cursor + fieldWidth, y)
          ctx.stroke()
          cursor += fieldWidth + span * 0.022
        }

        // ---- the detail that only appears when a record is opened ----
        if (open > 0.02) {
          ctx.lineWidth = 1.3
          ctx.strokeStyle = rgba(signal, 0.34 * open * enter)
          let detail = x0 + nameW + span * 0.035
          for (let f = 0; f < 3; f++) {
            const w = span * (0.06 + ((record.seed * 31 + f) % 1) * 0.09) * open
            ctx.beginPath()
            ctx.moveTo(detail, y + 7)
            ctx.lineTo(detail + w, y + 7)
            ctx.stroke()
            detail += w + span * 0.018
          }
        }
      }
    },
    dispose() {
      untrack()
      records.length = 0
    },
  }
}

export function RedactionBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--redaction', className)} aria-hidden />
  )
}
