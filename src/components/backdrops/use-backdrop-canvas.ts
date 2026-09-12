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
 * - Under `prefers-reduced-motion` the loop never starts. One frame is drawn so
 *   the band is composed rather than blank, and that is where it stays.
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
    let raf = 0
    let running = false
    let start = 0

    const tick = (now: number) => {
      if (!start) start = now
      live.frame((now - start) / 1000)
      raf = requestAnimationFrame(tick)
    }
    const play = () => {
      if (running || reduced.matches) return
      running = true
      raf = requestAnimationFrame(tick)
    }
    const pause = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const resizeObserver = new ResizeObserver(applySize)
    resizeObserver.observe(host)

    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { rootMargin: '128px' },
    )
    visibility.observe(host)

    const onReducedChange = () => (reduced.matches ? pause() : play())
    reduced.addEventListener('change', onReducedChange)

    // One frame regardless, so a reduced-motion visitor gets a composed band
    // rather than an empty one.
    live.frame(0)

    return () => {
      pause()
      resizeObserver.disconnect()
      visibility.disconnect()
      reduced.removeEventListener('change', onReducedChange)
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
