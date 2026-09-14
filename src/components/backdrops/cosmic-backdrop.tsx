'use client'

import { useLogoSources } from '@/components/layout/brand-provider'
import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'
import { motionIsReduced } from './motion'

/**
 * The Raptor deep-space warp, from the owner's own CodePen, ported.
 *
 * A twenty-second voyage on a loop. It opens adrift in deep space among
 * slow-moving nebula clouds and coloured dust, drifts towards the nebula,
 * accelerates until seventeen hundred stars stretch into coloured streaks with
 * white-hot cores, holds at warp, brakes, and then — out of a blur and a flash
 * of brightness — the 777 Raptor logo resolves at the vanishing point while the
 * stars fall almost still. A phase line along the foot of the band names each
 * stage. The pointer steers the camera, very slightly, until the logo is up.
 *
 * The star, dust and nebula counts, the palette, the projection, the three-layer
 * streaks, the warp glow, the timeline's six stages with their speeds and
 * intensities, the easing, the trail persistence, the steering and the logo's
 * reveal transition are the pen's, values included.
 *
 * What changed:
 *
 * - **The logo is the site's.** The pen leaves a placeholder where its logo URL
 *   goes, so on CodePen nothing appears; here it is the master logo the header
 *   uses, so the reveal the timeline builds to actually lands.
 * - **It shares the hero with its copy.** The pen centres everything on its
 *   window. Here the heading and lead sit on the left, so on a wide band the
 *   vanishing point, the steering and the logo are centred in the space to the
 *   right of them; on a narrow one the warp stays centred behind the copy, and
 *   the logo and phase line are not shown rather than printed over the heading.
 *   The logo's size is capped to fit that space.
 * - **The pointer is the hero's.** The pen steers from the mouse over its
 *   window and recentres when it leaves; here the same, over this band.
 * - **Its clock.** The pen moves and eases a fixed step per frame; here those
 *   steps are taken at its 60 a second, whatever the screen's rate. The loop
 *   runs on the band's own clock, which pauses while the band is off screen.
 * - **A still band is a composed one.** With motion reduced there is one frame,
 *   and it is the reveal: the logo up, the stars nearly still.
 * - **Its size follows the band,** in CSS pixels at the screen's density.
 */

const COSMIC_COLORS: readonly (readonly [number, number, number])[] = [
  [70, 120, 255],
  [100, 40, 255],
  [185, 55, 255],
  [255, 50, 180],
  [255, 90, 90],
  [255, 170, 70],
  [70, 220, 255],
]

const STAR_COUNT = 1700
const DEPTH = 2400
const DUST_COUNT = 350
const NEBULA_COUNT = 9
const FOV = 520
const LOOP = 20

/** From this band width the copy leaves room on the right. Tailwind's `lg`. */
const WIDE_FROM = 1024
/** Where the vanishing point sits across a wide band. */
const WIDE_CENTRE_X = 0.72

const STEP_RATE = 60
const MAX_STEPS = 4

type Rgb = readonly [number, number, number]
type Star = { x: number; y: number; z: number; previousZ: number; size: number; color: Rgb; brightness: number }
type Dust = { x: number; y: number; radius: number; alpha: number; drift: number; color: Rgb }
type Nebula = { x: number; y: number; radius: number; color: Rgb; alpha: number; driftX: number; driftY: number }
type State = { nebula: number; dust: number; stars: number; warp: number }

const PHASES = {
  deep: 'DEEP SPACE',
  drift: 'COSMIC DRIFT',
  accel: 'ACCELERATING',
  warp: 'WARP VELOCITY',
  decel: 'DECELERATING',
  logo: '777 RAPTOR',
} as const

function randomColor(): Rgb {
  return COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)]
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const logo = host.querySelector<HTMLElement>('[data-cosmic-logo]')
  const phaseLabel = host.querySelector<HTMLElement>('[data-cosmic-phase]')

  let w = 0
  let h = 0
  /** The band's resting centre, which the steering is measured from. */
  let homeX = 0
  let homeY = 0
  let cx = 0
  let cy = 0
  let targetCX = 0
  let targetCY = 0

  let speed = 0.4
  let targetSpeed = 0.4
  let logoShown = false
  let phase = ''

  const stars: Star[] = []
  const dust: Dust[] = []
  const nebulae: Nebula[] = []

  const makeStar = (): Star => ({
    x: (Math.random() - 0.5) * w * 3,
    y: (Math.random() - 0.5) * h * 3,
    z: Math.random() * DEPTH + 1,
    previousZ: 0,
    size: Math.random() * 1.5 + 0.2,
    color: randomColor(),
    brightness: Math.random() * 0.65 + 0.35,
  })

  const resetStar = (star: Star) => {
    star.x = (Math.random() - 0.5) * w * 3
    star.y = (Math.random() - 0.5) * h * 3
    star.z = DEPTH
    star.previousZ = DEPTH
    star.color = randomColor()
  }

  const populate = () => {
    stars.length = 0
    for (let i = 0; i < STAR_COUNT; i++) stars.push(makeStar())

    dust.length = 0
    for (let i = 0; i < DUST_COUNT; i++) {
      dust.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 2,
        alpha: Math.random() * 0.3,
        drift: Math.random() * 0.15 + 0.02,
        color: randomColor(),
      })
    }

    nebulae.length = 0
    for (let i = 0; i < NEBULA_COUNT; i++) {
      nebulae.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 400 + 250,
        color: randomColor(),
        alpha: Math.random() * 0.08 + 0.025,
        driftX: (Math.random() - 0.5) * 0.08,
        driftY: (Math.random() - 0.5) * 0.05,
      })
    }
  }

  const project = (x: number, y: number, z: number) => {
    const scale = FOV / z
    return { x: cx + x * scale, y: cy + y * scale }
  }

  const drawNebulae = (intensity: number) => {
    for (const n of nebulae) {
      n.x += n.driftX
      n.y += n.driftY
      const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius)
      const [r, g, b] = n.color
      gradient.addColorStop(0, `rgba(${r},${g},${b},${n.alpha * intensity})`)
      gradient.addColorStop(0.3, `rgba(${r},${g},${b},${n.alpha * 0.45 * intensity})`)
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2)
    }
  }

  const drawDust = (intensity: number) => {
    for (const d of dust) {
      d.y += d.drift * (1 + speed * 0.1)
      if (d.y > h) {
        d.y = 0
        d.x = Math.random() * w
      }
      const [r, g, b] = d.color
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r},${g},${b},${d.alpha * intensity})`
      ctx.fill()
    }
  }

  const drawStars = (starIntensity: number) => {
    const speedFactor = Math.min(1, speed / 14)
    for (const star of stars) {
      star.previousZ = star.z
      star.z -= speed * 17
      if (star.z <= 1) resetStar(star)

      const current = project(star.x, star.y, star.z)
      const previous = project(star.x, star.y, star.previousZ + speed * 65)
      const [r, g, b] = star.color
      const alpha = star.brightness * starIntensity

      // coloured glow
      ctx.beginPath()
      ctx.moveTo(previous.x, previous.y)
      ctx.lineTo(current.x, current.y)
      ctx.lineWidth = star.size * (2 + speedFactor * 5)
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.18})`
      ctx.stroke()

      // main streak
      ctx.beginPath()
      ctx.moveTo(previous.x, previous.y)
      ctx.lineTo(current.x, current.y)
      ctx.lineWidth = star.size * (1 + speedFactor * 1.8)
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.stroke()

      // white-hot core
      if (speedFactor > 0.35) {
        ctx.beginPath()
        ctx.moveTo(previous.x, previous.y)
        ctx.lineTo(current.x, current.y)
        ctx.lineWidth = Math.max(0.25, star.size * 0.28)
        ctx.strokeStyle = `rgba(255,255,255,${alpha * speedFactor})`
        ctx.stroke()
      }
    }
  }

  const drawWarpCore = (intensity: number) => {
    const radius = Math.min(w, h) * 0.5
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    glow.addColorStop(0, `rgba(255,255,255,${0.08 * intensity})`)
    glow.addColorStop(0.08, `rgba(80,200,255,${0.08 * intensity})`)
    glow.addColorStop(0.25, `rgba(130,50,255,${0.04 * intensity})`)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
  }

  const setPhase = (label: string) => {
    if (label === phase) return
    phase = label
    if (phaseLabel) phaseLabel.textContent = label
  }

  const setLogo = (show: boolean) => {
    if (show === logoShown) return
    logoShown = show
    logo?.classList.toggle('show', show)
  }

  /** The pen's timeline, for seconds into the loop. */
  const timeline = (elapsed: number): State => {
    const t = elapsed % LOOP

    if (t < 3) {
      targetSpeed = 0.25
      setPhase(PHASES.deep)
      setLogo(false)
      return { nebula: 0.5, dust: 0.8, stars: 0.65, warp: 0.1 }
    }
    if (t < 6) {
      targetSpeed = 1
      setPhase(PHASES.drift)
      setLogo(false)
      return { nebula: 1.2, dust: 1, stars: 0.85, warp: 0.25 }
    }
    if (t < 10) {
      const p = (t - 6) / 4
      targetSpeed = 1 + p * 11
      setPhase(PHASES.accel)
      setLogo(false)
      return { nebula: 1 - p * 0.7, dust: 1 - p * 0.6, stars: 1, warp: 0.4 + p }
    }
    if (t < 14) {
      targetSpeed = 15
      setPhase(PHASES.warp)
      setLogo(false)
      return { nebula: 0.15, dust: 0.3, stars: 1, warp: 1.6 }
    }
    if (t < 16) {
      const p = (t - 14) / 2
      targetSpeed = 15 - p * 14.8
      setPhase(PHASES.decel)
      setLogo(false)
      return { nebula: 0.15 + p * 0.4, dust: 0.2 + p * 0.4, stars: 1 - p * 0.65, warp: 1.5 - p }
    }
    targetSpeed = 0.03
    setPhase(PHASES.logo)
    setLogo(true)
    return { nebula: 0.22, dust: 0.12, stars: 0.15, warp: 0.12 }
  }

  /** One of the pen's frames. */
  const step = (elapsed: number) => {
    const state = timeline(elapsed)

    speed += (targetSpeed - speed) * 0.028
    cx += (targetCX - cx) * 0.025
    cy += (targetCY - cy) * 0.025

    // longer persistence at warp speed
    ctx.fillStyle = `rgba(0,0,0,${speed > 8 ? 0.18 : 0.32})`
    ctx.fillRect(0, 0, w, h)

    drawNebulae(state.nebula)
    drawDust(state.dust)
    drawWarpCore(state.warp)
    drawStars(state.stars)
  }

  const untrack = trackPointer(
    host,
    (nx, ny) => {
      if (logoShown) return
      const amount = 0.07
      targetCX = homeX + (nx * w - homeX) * amount
      targetCY = homeY + (ny * h - homeY) * amount
    },
    () => {
      targetCX = homeX
      targetCY = homeY
    },
  )

  let stepsTaken = -1

  return {
    resize(width, height, dpr) {
      w = width
      h = height
      homeX = w >= WIDE_FROM ? w * WIDE_CENTRE_X : w / 2
      homeY = h / 2
      cx = targetCX = homeX
      cy = targetCY = homeY
      host.style.setProperty('--cosmic-x', `${homeX}px`)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      populate()
    },
    frame(seconds) {
      if (stepsTaken < 0 && motionIsReduced()) {
        // The reveal, settled, is the frame worth keeping.
        speed = 0.03
        for (let i = 0; i < 30; i++) step(LOOP - 2)
        stepsTaken = 0
        return
      }

      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const count = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < count; i++) step(seconds)
    },
    dispose() {
      untrack()
    },
  }
}

export function CosmicBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  const logo = useLogoSources().default

  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--cosmic', className)} aria-hidden>
      <div className="cosmic-overlay">
        <div className="cosmic-reveal">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- static brand asset, no optimisation needed
            <img src={logo} alt="" className="cosmic-logo" data-cosmic-logo />
          ) : null}
        </div>
        <div className="cosmic-hud" data-cosmic-phase>
          DEEP SPACE
        </div>
      </div>
    </div>
  )
}
