'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { isInteractiveTarget } from './use-backdrop-canvas'

/**
 * "CSS Pyramid Diamond ♦️ - Explosion" by konstantindenerz, ported.
 * https://codepen.io/konstantindenerz/pen/VwEVRXa
 *
 * A diamond built from nothing but CSS 3D: two stepped stacks of thirty
 * translucent pyramids, one inverted under the other, turning on an eased
 * ten-second loop. Press, and it explodes — the pyramids fly apart to thirty
 * times their spacing and spring back on an overshooting curve, while a little
 * cube with a face appears in the middle and talks for the length of it.
 *
 * The markup (four layers, as the Pug builds it), the stylesheet (the SCSS
 * compiled — every pyramid's place in its layer is written out in
 * globals.css), the three animated custom properties, the keyframes, both
 * easings and the press-to-explode script are the pen's.
 *
 * What changed:
 *
 * - **The window is the band.** The pen is sized in `vmin` against its window
 *   and centred in its body; here the band is a size container, the same
 *   values are in `cqmin`, and the diamond centres in the band — right of the
 *   copy on a wide one.
 * - **Names are prefixed.** The pen's `.front`, `.cube`, `--a`, `rotation` and
 *   the rest would be global on this site, so they are `diamond-`.
 * - **The mask is inline.** The pen masks each face with a triangle SVG from
 *   CodePen's asset host; the same one-path triangle is a data URI here.
 * - **A press on the band, not the body**, so a press on a link or a button in
 *   the hero is left alone.
 * - **Reduced motion** is the site's rule for every CSS animation: the turn
 *   stops, and a press settles at once rather than exploding.
 */

/** The pen's `$size`: four layers per stack. */
const SIZE = 4

const FACES = ['front', 'back', 'left', 'right', 'bottom'] as const

function Pyramids() {
  const items: number[] = []
  for (let level = 1; level <= SIZE; level++) {
    for (let item = 0; item < level * level; item++) items.push(items.length + 1)
  }
  return (
    <>
      {items.map((index) => (
        <div key={index} className="diamond-pyramid">
          {FACES.map((face) => (
            <div key={face} className={`diamond-${face}`} />
          ))}
        </div>
      ))}
    </>
  )
}

export function DiamondBackdrop({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const objectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const object = objectRef.current
    const section = host?.parentElement
    if (!host || !object || !section) return

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === 'diamond-rotation') object.classList.remove('expand')
    }
    object.addEventListener('animationend', onAnimationEnd)

    let timer: ReturnType<typeof setTimeout> | undefined
    const onClick = (event: MouseEvent) => {
      if (isInteractiveTarget(event.target)) return
      if (object.classList.contains('expand')) {
        object.classList.remove('expand')
        timer = setTimeout(() => {
          object.classList.add('expand')
        })
      } else {
        object.classList.add('expand')
      }
    }
    section.addEventListener('click', onClick)
    // The pen's body has a pointer cursor: the whole page is the button.
    const previousCursor = section.style.cursor
    section.style.cursor = 'pointer'

    return () => {
      clearTimeout(timer)
      object.removeEventListener('animationend', onAnimationEnd)
      section.removeEventListener('click', onClick)
      section.style.cursor = previousCursor
    }
  }, [])

  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--diamond', className)} aria-hidden>
      <div className="diamond-scene">
        <div ref={objectRef} className="diamond-object">
          <div className="diamond-top-triangle">
            <Pyramids />
          </div>
          <div className="diamond-cube">
            {FACES.map((face) => (
              <div key={face} className={`diamond-${face}`} />
            ))}
          </div>
          <div className="diamond-bottom-triangle">
            <Pyramids />
          </div>
        </div>
      </div>
    </div>
  )
}
