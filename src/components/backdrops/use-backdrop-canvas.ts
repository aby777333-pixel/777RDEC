'use client'

import { useEffect, useRef } from 'react'

/**
 * Shared lifecycle for the canvas pens behind the broker hero bands.
 *
 * Three of them draw to a canvas rather than to the DOM, and every one needs the
 * same four things doing correctly: sizing to the band in device pixels,
 * resizing with it, running only while it is on screen, and letting go of its
 * resources on unmount. Written once here so a mistake in any of them is a
 * mistake in one place.
 *
 * What it guarantees each scene:
 *
 * - The canvas is always the band's size in CSS pixels and `dpr` times that in
 *   backing pixels, capped at 2 — beyond that the cost is real and the gain is
 *   not.
 * - `frame` runs only while the band is on screen. A pen left running under
 *   three screens of scrolled-past page is a GPU bill for nothing.
 * - Motion stops when it should. That means the OS setting *and* the site's own
 *   "Reduce motion" toggle, which writes `data-reduce-motion` on <html> rather
 *   than firing an event, so it has to be watched; either one draws a single
 *   frame, so the band is composed rather than blank, and leaves it there.
 * - The loop also stops while the tab is hidden. Browsers throttle animation
 *   frames in a background tab but do not promise to stop them.
 * - `dispose` runs on unmount, and the canvas it drew on is thrown away with
 *   it. Client-side navigation away from one of these pages must hand back the
 *   WebGL context; browsers keep only a handful and silently drop the oldest.
 *
 * The canvas is the hook's, created here and appended to the host, rather than
 * a node handed down from JSX. That is what makes the line above safe: a scene
 * that hands its context back (see <ShaderBackdrop>) leaves the element it drew
 * on permanently lost, and React reuses DOM nodes across a remount, so a
 * JSX-owned canvas would come back dead — with a lost context every shader
 * fails to compile and the band renders blank. Strict Mode's double mount does
 * exactly this on every page load in development.
 */
export type BackdropScene = {
  /** Draw one frame. `seconds` is elapsed time since the scene started. */
  frame: (seconds: number) => void
  /** The band's new size, in CSS pixels, plus the backing-store ratio. */
  resize?: (width: number, height: number, dpr: number) => void
  /** Release anything that will not be garbage collected on its own. */
  dispose?: () => void
}

/**
 * `setup` must be a stable function — define it at module scope, not inline in
 * the component, or the scene will be torn down and rebuilt on every render.
 * It may return `null` to decline (no WebGL, for instance), and nothing else
 * is then started.
 */
export function useBackdropCanvas(
  setup: (canvas: HTMLCanvasElement, host: HTMLElement) => BackdropScene | null,
  /**
   * `maxDpr` lowers the backing store below the screen's own ratio. The
   * raymarched pens shade every pixel every frame, so full density on a
   * retina panel is four times the work for a backdrop nobody is inspecting.
   */
  options?: { maxDpr?: number },
) {
  const maxDpr = options?.maxDpr ?? 2
  const hostRef = useRef<HTMLDivElement>(null)
  const setupRef = useRef(setup)
  const maxDprRef = useRef(maxDpr)
  maxDprRef.current = maxDpr

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const canvas = document.createElement('canvas')
    host.appendChild(canvas)

    let scene: BackdropScene | null = null
    try {
      scene = setupRef.current(canvas, host)
    } catch {
      // A pen that cannot start is a blank band, not a broken page.
      scene = null
    }
    if (!scene) {
      canvas.remove()
      return
    }
    const live = scene

    let width = 0
    let height = 0
    const applySize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDprRef.current)
      const w = Math.max(1, host.clientWidth)
      const h = Math.max(1, host.clientHeight)
      if (w === width && h === height) return
      width = w
      height = h
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      live.resize?.(w, h, dpr)
    }
    applySize()

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motionIsReduced = () =>
      reduced.matches || document.documentElement.dataset.reduceMotion === 'true'

    let raf = 0
    let running = false
    let onScreen = false
    /**
     * Animation time delivered so far, in seconds, and the clock origin the
     * current run is measured from.
     *
     * A scene gets a clock that only ever moves forward, and does not move
     * while the scene is paused. Both halves matter: several scenes schedule
     * against the time they are handed — the next handshake, the next move,
     * the next sample — so a clock that restarts at zero on resume leaves them
     * waiting for a deadline that has already passed, and one that keeps
     * running through a pause jumps the scene forward by the length of it.
     */
    let elapsed = 0
    let origin = 0
    let rebase = true

    const tick = (now: number) => {
      if (rebase) {
        origin = now - elapsed * 1000
        rebase = false
      }
      elapsed = (now - origin) / 1000
      live.frame(elapsed)
      raf = requestAnimationFrame(tick)
    }
    const play = () => {
      if (running) return
      running = true
      rebase = true
      raf = requestAnimationFrame(tick)
    }
    const pause = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    /**
     * One place decides whether the loop should be running, so a visitor who
     * reduces motion and then scrolls, or scrolls and then switches tabs, gets
     * the same answer either way round.
     */
    const sync = () => {
      if (motionIsReduced()) {
        if (running) {
          pause()
          // Leave the band composed rather than mid-wipe.
          live.frame(elapsed)
        }
        return
      }
      if (onScreen && document.visibilityState === 'visible') {
        play()
      } else {
        pause()
      }
    }

    const resizeObserver = new ResizeObserver(applySize)
    resizeObserver.observe(host)

    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? false
        sync()
      },
      { rootMargin: '128px' },
    )
    visibility.observe(host)

    reduced.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    // The site's toggle flips an attribute rather than firing an event.
    const motionObserver = new MutationObserver(sync)
    motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-reduce-motion'],
    })

    // One frame regardless, so a reduced-motion visitor gets a composed band
    // rather than an empty one.
    live.frame(elapsed)

    return () => {
      pause()
      resizeObserver.disconnect()
      visibility.disconnect()
      motionObserver.disconnect()
      reduced.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      try {
        live.dispose?.()
      } catch {
        /* tearing down must not throw on the way out */
      }
      canvas.remove()
    }
  }, [])

  return { hostRef }
}

export type Rgb = [number, number, number]

/**
 * Reads a colour token off the band itself.
 *
 * Off the band, not off the document: a hero is a `force-dark` subtree, so the
 * root would hand back the light palette's steel to be painted on a black
 * band. Every scene here takes its colour from the element it draws into, so
 * one definition serves them all and no scene carries a hex literal.
 */
export function tokenRgb(host: HTMLElement, name: string, fallback: Rgb): Rgb {
  const raw = getComputedStyle(host).getPropertyValue(name).trim()
  if (!raw) return fallback
  const hex = raw.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const n = parseInt(hex[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const rgb = raw.match(/(-?[\d.]+)[,\s]+(-?[\d.]+)[,\s]+(-?[\d.]+)/)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  return fallback
}

/** `rgba()` from a token triple. */
export function rgba(c: Rgb, alpha: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`
}

/** Mixes two token colours; `t` 0 gives `a`. */
export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

/**
 * Anything the visitor might be pressing on purpose, rather than pressing the
 * band. Several pens answer to a click — a chain reaction, the next bloom, the
 * next figure — and the hero also carries real controls: the sound button, and
 * whatever links a page puts in its hero. A pen must not fire on those, and
 * must never call `preventDefault` over them, which in some browsers takes the
 * click with it.
 */
const INTERACTIVE = 'a, button, input, select, textarea, summary, [role="button"], [tabindex]'

export function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(INTERACTIVE) !== null
}

/**
 * Pointer position over the band, normalised to 0..1, for the pens whose
 * nature is to answer to it. Listens on the section rather than the backdrop,
 * because the backdrop is `pointer-events: none` and must stay that way.
 */
export function trackPointer(
  host: HTMLElement,
  onMove: (x: number, y: number, e: PointerEvent) => void,
  onLeave?: () => void,
) {
  const section = host.parentElement ?? host
  const handle = (e: PointerEvent) => {
    const r = host.getBoundingClientRect()
    if (!r.width || !r.height) return
    onMove((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, e)
  }
  const leave = () => onLeave?.()
  section.addEventListener('pointermove', handle)
  section.addEventListener('pointerleave', leave)
  return () => {
    section.removeEventListener('pointermove', handle)
    section.removeEventListener('pointerleave', leave)
  }
}
