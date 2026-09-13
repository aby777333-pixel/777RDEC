'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { motionIsReduced } from './motion'

/**
 * "Follow Me Sphere / TypeScript + Sprite Sheet" by pjkarlik, ported.
 * https://codepen.io/pjkarlik/pen/yyebgEo
 *
 * A cracked crimson sphere with a spike on it, drawn from a sprite sheet of a
 * hundred and twenty-one pre-rendered turns. It drifts after the pointer —
 * slowly, a half of one percent of the way each frame — bobbing up and down as
 * it goes, with a soft shadow under it, and the frame it shows is picked by the
 * direction to the pointer, so the spike always points where you are. Hovered,
 * it takes a pink glow.
 *
 * The sheet, the frame size, the frame count and its offset, the follow rate,
 * the float, the shadow and the hover filter are the pen's, values included.
 * The sheet is served from this site (`/pens/follow-sphere/`) rather than
 * from CodePen's asset host.
 *
 * On /company it floats over the Cosmic Anomaly band, which is its ground in
 * place of the pen's tiled one: above the scene, below the copy.
 *
 * What changed:
 *
 * - **Band coordinates.** The pen follows `mousemove` on the window and places
 *   the sphere in viewport pixels. Here it follows the pointer over the hero
 *   and is placed in the hero, so it scrolls with the band it lives in, and it
 *   starts in the middle of the band rather than of the window.
 * - **Hover without catching the pointer.** The pen's sprite is a hoverable
 *   element. One that follows the pointer ends up under it, and would then
 *   take the clicks meant for the headline's links. So it is
 *   `pointer-events: none`, and its hover is a hit test of the pointer against
 *   the sprite's box, which is the same box CSS `:hover` uses.
 * - **Its clock.** The follow is per frame in the pen, so it chased twice as
 *   fast on a 120Hz screen. Here the same rate is applied per sixtieth of a
 *   second.
 * - **It rests when it should**: off screen, in a hidden tab, and under
 *   reduced motion, where it stays where it is.
 */

const SHEET_URL = '/pens/follow-sphere/sphere-sprite2.png'
const FRAME_WIDTH = 320
const FRAME_HEIGHT = 320
const COLUMNS = 5
const TOTAL_FRAMES = 121
const START_OFFSET = 105
const LERP_SPEED = 0.005
const FLOAT_AMPLITUDE = 8
const FLOAT_FREQUENCY = 0.75

export function FollowSphere({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const spriteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const container = containerRef.current
    const sprite = spriteRef.current
    const section = root?.parentElement
    if (!root || !container || !sprite || !section) return

    let posX = root.clientWidth / 2
    let posY = root.clientHeight / 2
    let targetX = posX
    let targetY = posY
    let floatY = 0
    let pointerX = -1
    let pointerY = -1

    const start = performance.now()
    let last = start

    const draw = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000))
      last = now
      const elapsed = (now - start) / 1000

      // Smooth follow — the pen's per-frame lerp, per sixtieth of a second.
      const follow = 1 - Math.pow(1 - LERP_SPEED, dt * 60)
      posX += (targetX - posX) * follow
      posY += (targetY - posY) * follow

      // Floating motion.
      floatY = Math.sin(elapsed * FLOAT_FREQUENCY * Math.PI * 2) * FLOAT_AMPLITUDE

      // Rotation toward the pointer.
      const dx = targetX - posX
      const dy = targetY - posY
      let angle = Math.atan2(dy, dx)
      if (angle < 0) angle += Math.PI * 2

      let frameIndex = Math.floor((angle / (Math.PI * 2)) * TOTAL_FRAMES)
      frameIndex = (frameIndex + START_OFFSET) % TOTAL_FRAMES

      container.style.left = `${posX}px`
      container.style.top = `${posY}px`
      sprite.style.top = `${floatY}px`

      const col = frameIndex % COLUMNS
      const row = Math.floor(frameIndex / COLUMNS)
      sprite.style.backgroundPosition = `${-(col * FRAME_WIDTH)}px ${-(row * FRAME_HEIGHT)}px`

      updateHover()
    }

    /** CSS :hover, by hand: is the pointer inside the sprite's box? */
    const updateHover = () => {
      const left = posX - FRAME_WIDTH / 2
      const top = posY + floatY - FRAME_HEIGHT / 2
      const over =
        pointerX >= left &&
        pointerX <= left + FRAME_WIDTH &&
        pointerY >= top &&
        pointerY <= top + FRAME_HEIGHT
      sprite.classList.toggle('is-hovered', over)
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      pointerX = e.clientX - rect.left
      pointerY = e.clientY - rect.top
      targetX = pointerX
      targetY = pointerY
      if (!running) updateHover()
    }
    const onPointerLeave = () => {
      // The pen's target stays where the pointer was last seen; only the
      // hover goes.
      pointerX = -1
      pointerY = -1
      sprite.classList.remove('is-hovered')
    }
    section.addEventListener('pointermove', onPointerMove)
    section.addEventListener('pointerleave', onPointerLeave)

    let raf = 0
    let running = false
    let onScreen = false

    const tick = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(tick)
    }
    const sync = () => {
      const shouldRun = onScreen && document.visibilityState === 'visible' && !motionIsReduced()
      if (shouldRun && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(tick)
      } else if (!shouldRun && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }

    // Composed from the first paint, whatever happens next.
    draw(start)

    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? false
        sync()
      },
      { rootMargin: '128px' },
    )
    visibility.observe(root)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    const motionObserver = new MutationObserver(sync)
    motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-reduce-motion'],
    })

    return () => {
      running = false
      cancelAnimationFrame(raf)
      visibility.disconnect()
      motionObserver.disconnect()
      reduced.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <div ref={rootRef} className={cn('follow-sphere', className)} aria-hidden>
      <div ref={containerRef} className="follow-sphere__container">
        <div className="follow-sphere__shadow" />
        <div
          ref={spriteRef}
          className="follow-sphere__sprite"
          style={{
            backgroundImage: `url(${SHEET_URL})`,
            width: `${FRAME_WIDTH}px`,
            height: `${FRAME_HEIGHT}px`,
          }}
        />
      </div>
    </div>
  )
}
