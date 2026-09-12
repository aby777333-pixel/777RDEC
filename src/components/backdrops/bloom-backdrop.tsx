'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * "6 Circles" by inclushe, ported.
 *
 * Six blended discs on the points of a hexagon. Each one is placed by
 * trigonometry in CSS — `translate(cos(a) * amplitude, sin(a) * amplitude)` —
 * so a single pair of registered custom properties, `--bloom-amplitude` and
 * `--bloom-scale`, drives the whole arrangement, and `mix-blend-mode: lighten`
 * does the rest where they overlap. The registration is the load-bearing part:
 * without `@property` giving them a type, neither one would interpolate and
 * the keyframes would jump.
 *
 * Its nature is that the pointer takes it over. While the pointer is in the
 * band the ambient animation is switched off and the two properties are driven
 * directly — x drives how far the discs throw, y drives how large they swell —
 * and when the pointer leaves, the animation comes back. That is kept exactly,
 * against this band rather than the window.
 *
 * Three changes, and they are the usual three:
 *
 * 1. **Scoped.** The pen styles `html` and `body`, including `overflow:
 *    hidden`, which would have reached the whole site.
 * 2. **The band's coordinates, not the window's.** The pen reads `clientX /
 *    window.innerWidth`; here the reading is taken against this element, so
 *    the discs answer to where the pointer is in the hero rather than where it
 *    is on the screen.
 * 3. **Sized in `em`.** The pen is written in px for a full window. One `em`
 *    is one of its 100px discs, and the scene's font-size is capped against
 *    both its column and the band's height, so the arrangement is the pen's at
 *    any hero size.
 *
 * There is no loop and no JavaScript animation — the ambient state is a CSS
 * keyframe, so the site's reduce-motion rules already stop it, and a hidden tab
 * already stops compositing it. The pointer path is direct manipulation and is
 * left alone.
 */

/** The pen's mapping, in `em` rather than its px: 500px of throw, 10x of swell. */
const MAX_AMPLITUDE_EM = 5
const MAX_SCALE = 10

export function BloomBackdrop({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const circles = Array.from(root.querySelectorAll<HTMLElement>('.circle'))
    if (circles.length === 0) return

    // The scene is `pointer-events: none` so it never takes a click meant for
    // the page, which makes the section the thing that hears the pointer.
    const section = root.parentElement ?? root

    const drive = (clientX: number, clientY: number) => {
      const r = root.getBoundingClientRect()
      if (!r.width || !r.height) return
      const percentX = (clientX - r.left) / r.width
      const percentY = (clientY - r.top) / r.height
      const amplitude = `${MAX_AMPLITUDE_EM * percentX}em`
      const scale = `${MAX_SCALE * percentY}`
      for (const el of circles) {
        el.setAttribute(
          'style',
          `animation: none; --bloom-amplitude: ${amplitude}; --bloom-scale: ${scale};`,
        )
      }
    }

    const release = () => {
      for (const el of circles) el.removeAttribute('style')
    }

    const onPointerMove = (e: PointerEvent) => drive(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) drive(t.clientX, t.clientY)
    }

    section.addEventListener('pointermove', onPointerMove)
    section.addEventListener('pointerleave', release)
    section.addEventListener('touchmove', onTouchMove, { passive: true })
    section.addEventListener('touchend', release)

    return () => {
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerleave', release)
      section.removeEventListener('touchmove', onTouchMove)
      section.removeEventListener('touchend', release)
      release()
    }
  }, [])

  return (
    <div ref={rootRef} className={cn('bloom-scene', className)} aria-hidden>
      <div className="bloom-core">
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
      </div>
    </div>
  )
}
