'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Canvas particles" by hakimel, ported.
 *
 * Twenty-five particles orbit the pointer, each on its own radius and at its
 * own speed, chasing it with lag and drawing the line from where they were to
 * where they are. The trail is the pen's whole trick: instead of clearing the
 * canvas it paints 5% black over the last frame, so old strokes fade rather
 * than vanish. Its nature is that it follows the pointer, and that holding the
 * button swells the orbits — both kept.
 *
 * The usual three changes:
 *
 * 1. **Scoped to the band.** The pen listens on `window` and sizes to
 *    `innerWidth/innerHeight`; both are read against this section instead, so
 *    the swarm answers to the pointer in the hero rather than anywhere on the
 *    page, and the particles stay inside the band.
 * 2. **A frame loop, not `setInterval(1000/60)`.** The pen's timer keeps
 *    firing in a background tab and drifts against the display; the shared
 *    hook drives it on `requestAnimationFrame` and stops it off screen.
 * 3. **No `preventDefault` on touch.** The pen blocks touchmove, which on a
 *    page — as opposed to a full-screen demo — would stop the visitor
 *    scrolling. The swarm follows touch without taking the gesture.
 */

const QUANTITY = 25
const RADIUS = 70
const RADIUS_SCALE_MIN = 1
const RADIUS_SCALE_MAX = 1.5

type Particle = {
  size: number
  position: { x: number; y: number }
  offset: { x: number; y: number }
  shift: { x: number; y: number }
  speed: number
  targetSize: number
  fillColor: string
  orbit: number
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = host.clientWidth
  let height = host.clientHeight
  let mouseX = width * 0.5
  let mouseY = height * 0.5
  let pressed = false
  let radiusScale = RADIUS_SCALE_MIN

  const particles: Particle[] = []
  for (let i = 0; i < QUANTITY; i++) {
    particles.push({
      size: 1,
      position: { x: mouseX, y: mouseY },
      offset: { x: 0, y: 0 },
      shift: { x: mouseX, y: mouseY },
      speed: 0.01 + Math.random() * 0.04,
      targetSize: 1,
      fillColor: '#' + ((Math.random() * 0x404040 + 0xaaaaaa) | 0).toString(16),
      orbit: RADIUS * 0.5 + RADIUS * 0.5 * Math.random(),
    })
  }

  const untrack = trackPointer(host, (nx, ny) => {
    mouseX = nx * width
    mouseY = ny * height
  })

  const section = host.parentElement ?? host
  const onDown = () => {
    pressed = true
  }
  const onUp = () => {
    pressed = false
  }
  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    const r = host.getBoundingClientRect()
    mouseX = t.clientX - r.left
    mouseY = t.clientY - r.top
  }
  section.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  // Passive: the pen calls preventDefault here, which on a real page would
  // take the visitor's scroll away from them.
  section.addEventListener('touchmove', onTouch, { passive: true })

  return {
    resize(w, h, ratio) {
      // Keep the pointer's relative place through a resize rather than
      // snapping the swarm to a stale pixel.
      mouseX = width ? (mouseX / width) * w : w * 0.5
      mouseY = height ? (mouseY / height) * h : h * 0.5
      width = w
      height = h
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      // A resize hands back a cleared buffer; fill it so the first frames fade
      // up from black instead of flashing the page through.
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
    },
    frame() {
      radiusScale += pressed
        ? (RADIUS_SCALE_MAX - radiusScale) * 0.02
        : -(radiusScale - RADIUS_SCALE_MIN) * 0.02
      radiusScale = Math.min(radiusScale, RADIUS_SCALE_MAX)

      ctx.fillStyle = 'rgba(0,0,0,0.05)'
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        const lastX = particle.position.x
        const lastY = particle.position.y

        particle.offset.x += particle.speed
        particle.offset.y += particle.speed

        particle.shift.x += (mouseX - particle.shift.x) * particle.speed
        particle.shift.y += (mouseY - particle.shift.y) * particle.speed

        particle.position.x =
          particle.shift.x + Math.cos(i + particle.offset.x) * (particle.orbit * radiusScale)
        particle.position.y =
          particle.shift.y + Math.sin(i + particle.offset.y) * (particle.orbit * radiusScale)

        particle.position.x = Math.max(Math.min(particle.position.x, width), 0)
        particle.position.y = Math.max(Math.min(particle.position.y, height), 0)

        particle.size += (particle.targetSize - particle.size) * 0.05
        if (Math.round(particle.size) === Math.round(particle.targetSize)) {
          particle.targetSize = 1 + Math.random() * 7
        }

        ctx.beginPath()
        ctx.fillStyle = particle.fillColor
        ctx.strokeStyle = particle.fillColor
        ctx.lineWidth = particle.size
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(particle.position.x, particle.position.y)
        ctx.stroke()
        ctx.arc(particle.position.x, particle.position.y, particle.size / 2, 0, Math.PI * 2, true)
        ctx.fill()
      }
    },
    dispose() {
      untrack()
      section.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      section.removeEventListener('touchmove', onTouch)
    },
  }
}

export function SwarmBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup)
  // The canvas is the hook's; it appends one on mount and drops it on unmount.
  return <div ref={hostRef} className={cn('pen-scene pen-scene--swarm', className)} aria-hidden />
}
