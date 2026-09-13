'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { motionIsReduced } from './motion'

/**
 * "#codevember - 8 - Colored explosion" by matteobruni, ported.
 * https://codepen.io/matteobruni/pen/vYKzovR
 *
 * An emitter at the centre of the band throws out five particles every 0.3
 * seconds in every direction, each in one of nine colours. Every particle
 * starts as a point and grows as it flies, and is gone the moment it reaches
 * full size; each leaves a long trail that fades into the black, so the band is
 * a slow, continuous burst of colour.
 *
 * It runs on the library the pen runs on — tsParticles 1.18.11, the same
 * version, installed rather than loaded from a CDN — with the pen's options
 * object unchanged, so the emitter, the palette, the speed, the size animation
 * and the trail are the pen's by construction rather than by re-creation.
 *
 * What changed:
 *
 * - **The pen's "Made with tsParticles" badge and its GitHub star and fork
 *   buttons are left out**, and with them the GitHub buttons script and the
 *   Bootstrap stylesheet the pen loads for that badge. Nothing else in the pen
 *   used either.
 * - **The library is imported when the band mounts**, in a chunk of its own,
 *   so it costs the route's first load nothing.
 * - **It sits behind the band.** The canvas takes no pointer events and
 *   follows the band's size, not only the window's.
 * - **It rests when it should.** tsParticles already pauses in a hidden tab;
 *   this also pauses it off screen, and under the site's reduced motion it
 *   runs for a moment so the band is not an empty black and then holds still.
 */

/** The pen's options, verbatim. */
const OPTIONS = {
  fpsLimit: 60,
  interactivity: {
    detectsOn: 'canvas',
    events: {
      resize: true,
    },
  },
  particles: {
    color: {
      value: ['#3998D0', '#2EB6AF', '#A9BD33', '#FEC73B', '#F89930', '#F45623', '#D62E32', '#EB586E', '#9952CF'],
    },
    move: {
      attract: {
        enable: false,
        rotate: {
          x: 800,
          y: 800,
        },
      },
      direction: 'none',
      enable: true,
      outModes: {
        default: 'destroy',
      },
      random: false,
      speed: 3,
      straight: false,
      trail: {
        fillColor: '#000',
        length: 30,
        enable: true,
      },
    },
    number: { density: { enable: true, area: 800 }, value: 0 },
    opacity: {
      value: 1,
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: 25,
      animation: {
        startValue: 'min',
        enable: true,
        minimumValue: 1,
        speed: 2,
        destroy: 'max',
        sync: true,
      },
    },
  },
  detectRetina: true,
  emitters: {
    direction: 'none',
    rate: {
      quantity: 5,
      delay: 0.3,
    },
    size: {
      width: 0,
      height: 0,
    },
    position: {
      x: 50,
      y: 50,
    },
  },
} as const

/** Under reduced motion, how long the burst runs before it holds still. */
const STILL_AFTER_MS = 1500

export function ColorburstBackdrop({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let cleanup = () => {}

    void import('tsparticles').then(async ({ tsParticles }) => {
      if (disposed) return
      const id = `colorburst-${Math.random().toString(36).slice(2)}`
      // The pen's options, as the library's own types describe them.
      const container = await tsParticles.set(id, host, OPTIONS as Parameters<typeof tsParticles.set>[2])
      if (!container) return
      if (disposed) {
        container.destroy()
        return
      }

      // The library turns pointer events back on for its canvas; the band's
      // backdrop must never take a click, and the pen listens for none.
      const canvas = host.querySelector('canvas')
      if (canvas) canvas.style.pointerEvents = 'none'

      // The library resizes with the window; the band can change size on its
      // own (fonts arriving, the copy wrapping), so follow the band too.
      let lastSize = `${host.clientWidth}x${host.clientHeight}`
      const resizeObserver = new ResizeObserver(() => {
        const size = `${host.clientWidth}x${host.clientHeight}`
        if (size === lastSize) return
        lastSize = size
        container.canvas.windowResize()
      })
      resizeObserver.observe(host)

      let onScreen = true
      let stillTimer: ReturnType<typeof setTimeout> | undefined
      let hasRun = false

      const sync = () => {
        clearTimeout(stillTimer)
        if (!onScreen) {
          container.pause()
          return
        }
        if (motionIsReduced()) {
          if (hasRun) {
            container.pause()
          } else {
            container.play()
            stillTimer = setTimeout(() => {
              hasRun = true
              container.pause()
            }, STILL_AFTER_MS)
          }
          return
        }
        container.play()
      }

      const visibility = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry?.isIntersecting ?? false
          sync()
        },
        { rootMargin: '128px' },
      )
      visibility.observe(host)

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
      reduced.addEventListener('change', sync)
      const motionObserver = new MutationObserver(sync)
      motionObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-reduce-motion'],
      })

      cleanup = () => {
        clearTimeout(stillTimer)
        resizeObserver.disconnect()
        visibility.disconnect()
        motionObserver.disconnect()
        reduced.removeEventListener('change', sync)
        container.destroy()
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return <div ref={hostRef} className={cn('pen-scene pen-scene--colorburst', className)} aria-hidden />
}
