'use client'

import { useLogoSources } from '@/components/layout/brand-provider'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'
import { motionIsReduced } from './motion'

/**
 * The Raptor warp intro, from the owner's own CodePen, ported.
 *
 * A thousand stars stream out of a vanishing point with market names — EUR/USD,
 * XAU/USD, NIFTY, BRENT — flying past among them, all leaving trails on a
 * near-black ground. It plays once, on a timeline: a second of ignition, two
 * seconds of full hyperspace with the streaks thickened into light, a hard
 * brake, and then a slow drift while the brand fades up out of a blur and the
 * status line underneath turns from "initializing" to "online".
 *
 * The star and label counts, the market list, the projection, the trail fade,
 * the glow, the timeline's stages, speeds and warp strengths, the easing, and
 * the brand's reveal transition are the pen's, values included.
 *
 * What changed:
 *
 * - **The logo, not the name.** The pen's brand block is an eyebrow, the word
 *   RAPTOR set huge, and a tagline. The word is replaced by the site's master
 *   logo, as asked; the eyebrow and tagline stay.
 * - **It shares the hero with its copy.** The pen owns a whole window and
 *   centres everything on it. Here the heading and lead sit on the left, so on
 *   a wide band the vanishing point, the glow and the brand are centred in the
 *   space to the right of them; on a narrow one, where the copy spans the band,
 *   the warp stays centred behind it and the brand and status line are not
 *   shown, rather than printed over the heading.
 * - **Its clock.** The pen eases its speed a fixed step per frame; here those
 *   steps are taken at its 60 a second, whatever the screen's rate. The
 *   timeline runs on the band's own clock, which pauses while the band is off
 *   screen, so a visitor who scrolls straight past does not miss the reveal.
 * - **A still band is a composed one.** With motion reduced there is one frame,
 *   and the timeline's end is the one worth showing: the brand is revealed and
 *   the stars are drawn at the pen's final drift.
 * - **Its size follows the band,** in CSS pixels at the screen's density.
 */

const STAR_COUNT = 1000
const MARKET_COUNT = 36

const MARKETS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'XAU/USD',
  'XAG/USD',
  'BTC/USD',
  'ETH/USD',
  'NASDAQ',
  'S&P 500',
  'DOW',
  'NIFTY',
  'SENSEX',
  'BRENT',
  'WTI',
  'DAX',
  'NIKKEI',
]

/** From this band width the copy leaves room on the right. Tailwind's `lg`. */
const WIDE_FROM = 1024
/** Where the vanishing point sits across a wide band. */
const WIDE_CENTRE_X = 0.72

const STEP_RATE = 60
const MAX_STEPS = 4

type Star = { x: number; y: number; z: number; pz: number; size: number }
type Label = { name: string; x: number; y: number; z: number; alpha: number }

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const brand = host.querySelector<HTMLElement>('[data-warp-brand]')
  const status = host.querySelector<HTMLElement>('[data-warp-status]')
  const labelFont = getComputedStyle(host).fontFamily || 'Inter, Arial, sans-serif'

  let w = 0
  let h = 0
  let cx = 0
  let cy = 0

  let stars: Star[] = []
  let labels: Label[] = []

  let speed = 0.035
  let targetSpeed = 0.035
  let warpPower = 1
  let revealed = false

  const pick = () => MARKETS[Math.floor(Math.random() * MARKETS.length)]

  const createStars = () => {
    stars = []
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * w * 2,
        y: (Math.random() - 0.5) * h * 2,
        z: Math.random() * w,
        pz: 0,
        size: Math.random() * 1.5 + 0.2,
      })
    }
  }

  const createLabels = () => {
    labels = []
    for (let i = 0; i < MARKET_COUNT; i++) {
      labels.push({
        name: pick(),
        x: (Math.random() - 0.5) * w * 1.8,
        y: (Math.random() - 0.5) * h * 1.8,
        z: Math.random() * w + 150,
        alpha: Math.random() * 0.5 + 0.2,
      })
    }
  }

  const resetStar = (star: Star) => {
    star.x = (Math.random() - 0.5) * w * 2
    star.y = (Math.random() - 0.5) * h * 2
    star.z = w
    star.pz = star.z
  }

  /** The pen's per-frame motion, without drawing. */
  const moveStars = () => {
    for (const s of stars) {
      s.pz = s.z
      s.z -= speed * w
      if (s.z < 1) resetStar(s)
    }
    for (const l of labels) {
      l.z -= speed * w * 0.85
      if (l.z < 20) {
        l.x = (Math.random() - 0.5) * w * 1.8
        l.y = (Math.random() - 0.5) * h * 1.8
        l.z = w + Math.random() * 300
        l.name = pick()
      }
    }
  }

  const drawStars = () => {
    for (const s of stars) {
      const sx = (s.x / s.z) * w + cx
      const sy = (s.y / s.z) * w + cy
      const px = (s.x / s.pz) * w + cx
      const py = (s.y / s.pz) * w + cy
      const distance = Math.hypot(sx - cx, sy - cy)
      const alpha = Math.min(1, 0.15 + distance / Math.max(w, h))

      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(sx, sy)
      ctx.lineWidth = Math.max(0.4, s.size * warpPower)
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`
      ctx.stroke()

      if (warpPower < 2) {
        ctx.beginPath()
        ctx.arc(sx, sy, Math.max(0.2, s.size), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      }
    }
  }

  const drawLabels = () => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const l of labels) {
      const sx = (l.x / l.z) * w + cx
      const sy = (l.y / l.z) * w + cy
      const scale = Math.min(3, Math.max(0.15, 350 / l.z))
      const opacity = Math.min(0.8, l.alpha * scale)
      ctx.font = `${Math.max(8, 13 * scale)}px ${labelFont}`
      ctx.fillStyle = `rgba(255,255,255,${opacity})`
      ctx.fillText(l.name, sx, sy)
    }
  }

  const drawGlow = () => {
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5)
    gradient.addColorStop(0, `rgba(255,255,255,${0.06 * warpPower})`)
    gradient.addColorStop(0.2, `rgba(255,255,255,${0.015 * warpPower})`)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }

  const reveal = () => {
    if (revealed) return
    revealed = true
    brand?.classList.add('show')
    if (status) status.textContent = 'GLOBAL MARKETS ONLINE'
  }

  /** The pen's timeline, in milliseconds since the band started. */
  const timeline = (elapsed: number) => {
    if (elapsed < 1200) {
      targetSpeed = 0.05
      warpPower = 1.2
    } else if (elapsed < 3400) {
      targetSpeed = 0.14
      warpPower = 4.5
    } else if (elapsed < 4300) {
      targetSpeed = 0.015
      warpPower = 1.3
    } else {
      targetSpeed = 0.003
      warpPower = 0.8
      reveal()
    }
    speed += (targetSpeed - speed) * 0.035
  }

  const paint = () => {
    ctx.fillStyle = 'rgba(2,3,6,0.33)'
    ctx.fillRect(0, 0, w, h)
    drawGlow()
    drawStars()
    drawLabels()
  }

  let stepsTaken = -1

  return {
    resize(width, height, dpr) {
      w = width
      h = height
      cx = w >= WIDE_FROM ? w * WIDE_CENTRE_X : w / 2
      cy = h / 2
      host.style.setProperty('--warp-x', `${cx}px`)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Resizing wipes the canvas; start again from the pen's ground.
      ctx.fillStyle = '#020306'
      ctx.fillRect(0, 0, w, h)
      createStars()
      createLabels()
    },
    frame(seconds) {
      if (stepsTaken < 0 && motionIsReduced()) {
        // The end of the timeline, settled, is the frame to keep.
        speed = 0.003
        warpPower = 0.8
        moveStars()
        reveal()
        paint()
        stepsTaken = 0
        return
      }

      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < steps; i++) {
        timeline(seconds * 1000)
        moveStars()
        paint()
      }
    },
  }
}

export function WarpBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  const logo = useLogoSources().default

  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--warp', className)} aria-hidden>
      <div className="warp-overlay">
        <div className="warp-brand" data-warp-brand>
          <div className="warp-eyebrow">777 TECHNOLOGIES</div>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- static brand asset, no optimisation needed
            <img src={logo} alt="" className="warp-logo" />
          ) : null}
          <div className="warp-tagline">MARKETS. AT RAPTOR SPEED.</div>
        </div>
        <div className="warp-status" data-warp-status>
          INITIALIZING GLOBAL MARKET ENGINE
        </div>
      </div>
    </div>
  )
}
