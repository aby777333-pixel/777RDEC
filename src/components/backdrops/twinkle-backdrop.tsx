'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, isInteractiveTarget, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Dynamic Twinkling Particle System | Vanilla JS" by TheMOZZARELLA, ported.
 * https://codepen.io/TheMOZZARELLA/pen/ZYzpWPw
 *
 * A web of glowing, hue-cycling particles, each pulsing in size and trailing a
 * short tail, joined to its neighbours by lines that fade with distance, over
 * two hundred motes of slow dust. Left alone they meander. Bring the pointer
 * in and they are drawn toward it, gathering speed, leaving ripples wherever
 * it moves; press, and a ring and fifteen sparks burst from the spot — press
 * rapidly over a gathered swarm and it scatters.
 *
 * Every class, force, damping, bounce, trail, ripple, spark, grid-partitioned
 * connection and particle-count rule is the pen's, values included.
 *
 * What changed:
 *
 * - **The background is black.** The pen's ground is a gradient that walks
 *   through the hue wheel; on this page it was asked for black, so the frame is
 *   cleared to black instead and the particles are unchanged over it.
 * - **The pointer and presses are the hero's.** The pen listens on its canvas;
 *   here the canvas sits behind the copy, so the section is heard instead, and
 *   a press on a link or a button in the hero is left alone.
 * - **Its clock.** The pen moves everything a fixed step per frame; here those
 *   steps are taken at its 60 a second, whatever the screen's rate.
 * - **Its pixels.** The pen's canvas is window-sized in backing pixels; here it
 *   is the band's size in CSS pixels, drawn at the screen's density. The
 *   particle count and the glow threshold read that CSS size, as the pen reads
 *   its window.
 */

const STEP_RATE = 60
const MAX_STEPS = 4

type Mouse = { x: number | null; y: number | null }

type TrailPoint = { x: number; y: number; hue: number; alpha: number }

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const section = host.parentElement ?? host
  let W = Math.max(1, host.clientWidth)
  let H = Math.max(1, host.clientHeight)

  let frameCount = 0
  let autoDrift = true
  const mouse: Mouse = { x: null, y: null }

  class Particle {
    isFirework: boolean
    x: number
    y: number
    vx: number
    vy: number
    size: number
    hue: number
    alpha = 1
    sizeDirection: number
    trail: TrailPoint[] = []

    constructor(x: number, y: number, isFirework = false) {
      const baseSpeed = isFirework ? Math.random() * 2 + 1 : Math.random() * 0.5 + 0.3
      this.isFirework = isFirework
      this.x = x
      this.y = y
      this.vx = Math.cos(Math.random() * Math.PI * 2) * baseSpeed
      this.vy = Math.sin(Math.random() * Math.PI * 2) * baseSpeed
      this.size = isFirework ? Math.random() * 2 + 2 : Math.random() * 3 + 1
      this.hue = Math.random() * 360
      this.sizeDirection = Math.random() < 0.5 ? -1 : 1
    }

    update() {
      const dist = mouse.x !== null && mouse.y !== null ? (mouse.x - this.x) ** 2 + (mouse.y - this.y) ** 2 : 0

      if (!this.isFirework) {
        const force = dist && dist < 22500 ? (22500 - dist) / 22500 : 0

        if (mouse.x === null && autoDrift) {
          this.vx += (Math.random() - 0.5) * 0.03
          this.vy += (Math.random() - 0.5) * 0.03
        }

        if (dist && mouse.x !== null && mouse.y !== null) {
          const sqrtDist = Math.sqrt(dist)
          this.vx += ((mouse.x - this.x) / sqrtDist) * force * 0.1
          this.vy += ((mouse.y - this.y) / sqrtDist) * force * 0.1
        }

        this.vx *= mouse.x !== null ? 0.99 : 0.998
        this.vy *= mouse.y !== null ? 0.99 : 0.998
      } else {
        this.alpha -= 0.02
      }

      this.x += this.vx
      this.y += this.vy

      if (this.x <= 0 || this.x >= W - 1) this.vx *= -0.9
      if (this.y < 0 || this.y > H) this.vy *= -0.9

      this.size += this.sizeDirection * 0.1
      if (this.size > 4 || this.size < 1) this.sizeDirection *= -1

      this.hue = (this.hue + 0.3) % 360

      if (frameCount % 2 === 0 && (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1)) {
        this.trail.push({ x: this.x, y: this.y, hue: this.hue, alpha: this.alpha })
        if (this.trail.length > 15) this.trail.shift()
      }
    }

    draw() {
      const gradient = ctx!.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(0, this.size))
      gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, ${Math.max(this.alpha, 0)})`)
      gradient.addColorStop(1, `hsla(${this.hue + 30}, 80%, 30%, ${Math.max(this.alpha, 0)})`)

      ctx!.fillStyle = gradient
      ctx!.shadowBlur = W > 900 ? 10 : 0
      ctx!.shadowColor = `hsl(${this.hue}, 80%, 60%)`
      ctx!.beginPath()
      ctx!.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2)
      ctx!.fill()
      ctx!.shadowBlur = 0

      if (this.trail.length > 1) {
        ctx!.beginPath()
        ctx!.lineWidth = 1.5
        for (let i = 0; i < this.trail.length - 1; i++) {
          const { x: x1, y: y1, hue: h1, alpha: a1 } = this.trail[i]
          const { x: x2, y: y2 } = this.trail[i + 1]
          ctx!.strokeStyle = `hsla(${h1}, 80%, 60%, ${Math.max(a1, 0)})`
          ctx!.moveTo(x1, y1)
          ctx!.lineTo(x2, y2)
        }
        ctx!.stroke()
      }
    }

    isDead() {
      return this.isFirework && this.alpha <= 0
    }
  }

  class DustParticle {
    x = Math.random() * W
    y = Math.random() * H
    size = Math.random() * 1.5 + 0.5
    hue = Math.random() * 360
    vx = (Math.random() - 0.5) * 0.05
    vy = (Math.random() - 0.5) * 0.05

    update() {
      this.x = (this.x + this.vx + W) % W
      this.y = (this.y + this.vy + H) % H
      this.hue = (this.hue + 0.1) % 360
    }

    draw() {
      ctx!.fillStyle = `hsla(${this.hue}, 30%, 70%, 0.3)`
      ctx!.beginPath()
      ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx!.fill()
    }
  }

  class Ripple {
    x: number
    y: number
    radius = 0
    maxRadius: number
    alpha = 0.5
    hue: number

    constructor(x: number, y: number, hue = 0, maxRadius = 30) {
      this.x = x
      this.y = y
      this.hue = hue
      this.maxRadius = maxRadius
    }

    update() {
      this.radius += 1.5
      this.alpha -= 0.01
      this.hue = (this.hue + 5) % 360
    }

    draw() {
      ctx!.strokeStyle = `hsla(${this.hue}, 80%, 60%, ${this.alpha})`
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx!.stroke()
    }

    isDone() {
      return this.alpha <= 0
    }
  }

  const particles: Particle[] = []
  const fireworkParticles: Particle[] = []
  const dustParticles: DustParticle[] = []
  const ripples: Ripple[] = []
  const techRipples: Ripple[] = []

  /** The pen's particle count for its canvas size. */
  const adjustParticleCount = () => {
    const heightConditions = [200, 300, 400, 500, 600]
    const widthConditions = [450, 600, 900, 1200, 1600]
    const particlesForHeight = [40, 60, 70, 90, 110]
    const particlesForWidth = [40, 50, 70, 90, 110]

    let numParticles = 130
    for (let i = 0; i < heightConditions.length; i++) {
      if (H < heightConditions[i]) {
        numParticles = particlesForHeight[i]
        break
      }
    }
    for (let i = 0; i < widthConditions.length; i++) {
      if (W < widthConditions[i]) {
        numParticles = Math.min(numParticles, particlesForWidth[i])
        break
      }
    }
    return numParticles
  }

  const createParticles = () => {
    particles.length = 0
    dustParticles.length = 0
    const numParticles = adjustParticleCount()
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(Math.random() * W, Math.random() * H))
    }
    for (let i = 0; i < 200; i++) dustParticles.push(new DustParticle())
  }

  /** In place of the pen's hue-walking gradient: black, as asked for this page. */
  const drawBackground = () => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)
  }

  const connectParticles = () => {
    const gridSize = 120
    const grid = new Map<string, Particle[]>()

    for (const p of particles) {
      const key = `${Math.floor(p.x / gridSize)},${Math.floor(p.y / gridSize)}`
      const cell = grid.get(key)
      if (cell) cell.push(p)
      else grid.set(key, [p])
    }

    ctx.lineWidth = 1.5
    for (const p of particles) {
      const gridX = Math.floor(p.x / gridSize)
      const gridY = Math.floor(p.y / gridSize)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cell = grid.get(`${gridX + dx},${gridY + dy}`)
          if (!cell) continue
          for (const neighbor of cell) {
            if (neighbor === p) continue
            const diffX = neighbor.x - p.x
            const diffY = neighbor.y - p.y
            const dist = diffX * diffX + diffY * diffY
            if (dist < 10000) {
              ctx.strokeStyle = `hsla(${(p.hue + neighbor.hue) / 2}, 80%, 60%, ${1 - Math.sqrt(dist) / 100})`
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(neighbor.x, neighbor.y)
              ctx.stroke()
            }
          }
        }
      }
    }
  }

  type Entity = { update: () => void; draw: () => void; isDone?: () => boolean; isDead?: () => boolean }

  /** One of the pen's frames. Only the last of a catch-up run is drawn. */
  const step = (draw: boolean) => {
    if (draw) drawBackground()
    const groups: Entity[][] = [dustParticles, particles, ripples, techRipples, fireworkParticles]
    for (const arr of groups) {
      for (let i = arr.length - 1; i >= 0; i--) {
        const obj = arr[i]
        obj.update()
        if (draw) obj.draw()
        if (obj.isDone?.() || obj.isDead?.()) arr.splice(i, 1)
      }
    }
    if (draw) connectParticles()
    frameCount++
  }

  const local = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerMove = (e: PointerEvent) => {
    const { x, y } = local(e)
    mouse.x = x
    mouse.y = y
    techRipples.push(new Ripple(x, y))
    autoDrift = false
  }
  const onPointerLeave = () => {
    mouse.x = null
    mouse.y = null
    autoDrift = true
  }
  const onClick = (e: MouseEvent) => {
    if (isInteractiveTarget(e.target)) return
    const rect = host.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    ripples.push(new Ripple(clickX, clickY, 0, 60))
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 2 + 1
      const particle = new Particle(clickX, clickY, true)
      particle.vx = Math.cos(angle) * speed
      particle.vy = Math.sin(angle) * speed
      fireworkParticles.push(particle)
    }
  }
  section.addEventListener('pointermove', onPointerMove)
  section.addEventListener('pointerleave', onPointerLeave)
  section.addEventListener('click', onClick)

  let stepsTaken = -1

  return {
    resize(w, h, dpr) {
      const changed = w !== W || h !== H || particles.length === 0
      W = w
      H = h
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // As the pen does on resize: a new field for the new size.
      if (changed) createParticles()
      drawBackground()
    },
    frame(seconds) {
      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < steps; i++) step(i === steps - 1)
    },
    dispose() {
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerleave', onPointerLeave)
      section.removeEventListener('click', onClick)
      particles.length = 0
      fireworkParticles.length = 0
      dustParticles.length = 0
      ripples.length = 0
      techRipples.length = 0
    },
  }
}

export function TwinkleBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--twinkle', className)} aria-hidden />
}
