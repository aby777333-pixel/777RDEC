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
 * Something sent, and something coming back.
 *
 * Written for `/company/contact`. A contact page is a page where you will type
 * something and wait, so the band is deliberately the quietest one on the site:
 * a mark on the left, a ring leaving it, and a little later a ring returning
 * from wherever it went. Nothing else. There is no traffic, no graph and no
 * urgency, because the page is a form and the form is the thing to look at.
 *
 * **Pointer:** it is where the message goes. The next ring leaves for whatever
 * point you are over, and the acknowledgement comes back from there, so moving
 * across the band changes the distance and therefore the wait.
 */

/** Seconds between sends, and how long a ring takes to travel. */
const SEND_EVERY = 2.6
const TRAVEL_SECONDS = 1.3
/** Seconds the far end takes before it answers. */
const THINK_SECONDS = 0.55

/** Where the sender sits, as shares of the band. */
const FROM_X = 0.56
const FROM_Y = 0.5
/** Where it sends to when nobody is pointing. */
const REST_X = 0.88
const REST_Y = 0.42

type Message = {
  toX: number
  toY: number
  /** Seconds since it was sent. */
  age: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])
  const up = tokenRgb(host, '--up', [52, 211, 153])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let pointerX = -1
  let pointerY = -1
  let last = -1
  let nextSend = 0.6

  const messages: Message[] = []

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

      const fx = width * FROM_X
      const fy = height * FROM_Y

      // ---- the far end, always drawn ----
      // Without it the band is empty between sends, which on the calmest scene
      // on the site means empty most of the time.
      const restX = pointerX >= 0 ? pointerX : width * REST_X
      const restY = pointerX >= 0 ? pointerY : height * REST_Y
      ctx.setLineDash([3, 6])
      ctx.strokeStyle = rgba(steel, 0.12)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(fx, fy)
      ctx.lineTo(restX, restY)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.strokeStyle = rgba(steel, 0.26)
      ctx.lineWidth = 1.3
      ctx.strokeRect(restX - 4, restY - 4, 8, 8)

      // ---- sending ----
      if (seconds > nextSend) {
        nextSend = seconds + SEND_EVERY
        messages.push({
          toX: pointerX >= 0 ? pointerX : width * REST_X,
          toY: pointerX >= 0 ? pointerY : height * REST_Y,
          age: 0,
        })
      }

      const total = TRAVEL_SECONDS * 2 + THINK_SECONDS
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i]
        message.age += dt
        if (message.age > total + 0.6) {
          messages.splice(i, 1)
          continue
        }

        const distance = Math.hypot(message.toX - fx, message.toY - fy)
        const out = Math.min(1, message.age / TRAVEL_SECONDS)
        const backAge = message.age - TRAVEL_SECONDS - THINK_SECONDS
        const back = backAge > 0 ? Math.min(1, backAge / TRAVEL_SECONDS) : 0

        // ---- the line it travels along, drawn only as far as it has got ----
        const reached = out
        ctx.strokeStyle = rgba(steel, 0.16)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(fx, fy)
        ctx.lineTo(fx + (message.toX - fx) * reached, fy + (message.toY - fy) * reached)
        ctx.stroke()

        // ---- the outbound ring ----
        if (out < 1) {
          const x = fx + (message.toX - fx) * out
          const y = fy + (message.toY - fy) * out
          ctx.strokeStyle = rgba(signal, 0.5 * (1 - out * 0.4))
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.arc(x, y, 4 + out * 5, 0, Math.PI * 2)
          ctx.stroke()
        }

        // ---- arrival, and the pause before the answer ----
        if (out >= 1 && back <= 0) {
          const waited = (message.age - TRAVEL_SECONDS) / THINK_SECONDS
          const halo = ctx.createRadialGradient(
            message.toX,
            message.toY,
            0,
            message.toX,
            message.toY,
            18,
          )
          halo.addColorStop(0, rgba(signal, 0.3 * (1 - waited * 0.4)))
          halo.addColorStop(1, rgba(signal, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(message.toX, message.toY, 18, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = rgba(steel, 0.4)
          ctx.lineWidth = 1.3
          ctx.strokeRect(message.toX - 4, message.toY - 4, 8, 8)
        }

        // ---- the answer, contracting back ----
        if (back > 0 && back < 1) {
          const x = message.toX + (fx - message.toX) * back
          const y = message.toY + (fy - message.toY) * back
          ctx.strokeStyle = rgba(up, 0.45)
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(x, y, 9 - back * 5, 0, Math.PI * 2)
          ctx.stroke()
          // A faint thread behind it, so the return has a direction.
          ctx.strokeStyle = rgba(up, 0.12)
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(message.toX, message.toY)
          ctx.lineTo(x, y)
          ctx.stroke()
        }

        // ---- received ----
        if (back >= 1) {
          const since = backAge - TRAVEL_SECONDS
          const fade = Math.max(0, 1 - since / 0.6)
          const halo = ctx.createRadialGradient(fx, fy, 0, fx, fy, 24)
          halo.addColorStop(0, rgba(up, 0.34 * fade))
          halo.addColorStop(1, rgba(up, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(fx, fy, 24, 0, Math.PI * 2)
          ctx.fill()
        }

        // The distance is the wait: a short scale under the line says so
        // without putting a number on it.
        if (out < 1 || back > 0) {
          const ticks = Math.max(2, Math.round(distance / 60))
          ctx.strokeStyle = rgba(steel, 0.1)
          ctx.lineWidth = 1
          ctx.beginPath()
          for (let k = 1; k < ticks; k++) {
            const t = k / ticks
            const x = fx + (message.toX - fx) * t
            const y = fy + (message.toY - fy) * t
            ctx.moveTo(x, y - 3)
            ctx.lineTo(x, y + 3)
          }
          ctx.stroke()
        }
      }

      // ---- the sender ----
      ctx.strokeStyle = rgba(steel, 0.5)
      ctx.lineWidth = 1.6
      ctx.strokeRect(fx - 6, fy - 6, 12, 12)
      ctx.fillStyle = rgba(signal, 0.5)
      ctx.beginPath()
      ctx.arc(fx, fy, 2, 0, Math.PI * 2)
      ctx.fill()
    },
    dispose() {
      untrack()
      messages.length = 0
    },
  }
}

export function ReachBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--reach', className)} aria-hidden />
}
