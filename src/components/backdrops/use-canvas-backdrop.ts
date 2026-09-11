'use client'

import { useEffect, useRef } from 'react'

/**
 * What a backdrop hands back to the hook after it has claimed the canvas.
 * `draw` is called with seconds since start; `resize` with device pixels.
 */
export type BackdropRenderer = {
  draw: (seconds: number) => void
  resize: (width: number, height: number) => void
  dispose: () => void
}

export type BackdropOptions = {
  /**
   * Fraction of device pixels to render at. These sit behind a scrim at low
   * opacity, so half resolution is invisible and roughly quarters the fill
   * cost. The shader backdrop is fill-bound, which makes this the single
   * most effective lever there is.
   */
  resolution?: number
  /** Hard ceiling on devicePixelRatio. 3x retina at full res is wasted work. */
  maxDpr?: number
}

/** How far outside the viewport still counts as on screen. */
const MARGIN = 120

function motionIsReduced(): boolean {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.reduceMotion === 'true'
  )
}

/**
 * Canvas lifecycle for the decorative backdrops.
 *
 * Everything expensive is conditional. The loop runs only while the canvas is
 * actually on screen and the tab is actually visible, and not at all when
 * motion is reduced — in that case a single frame is drawn so the section
 * keeps its texture without anything moving. The site's own "Reduce motion"
 * toggle sets `data-reduce-motion` on <html>, so that is observed too and
 * takes effect without a reload.
 *
 * `setup` returning null means the context could not be created — an old
 * browser, a blocked GPU, a software renderer refusing WebGL. The canvas then
 * stays blank and the section falls back to the gradient underneath it, which
 * is exactly what it looks like today.
 */
export function useCanvasBackdrop(
  setup: (canvas: HTMLCanvasElement) => BackdropRenderer | null,
  { resolution = 0.5, maxDpr = 1.5 }: BackdropOptions = {},
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // Held in a ref so changing it never re-runs the effect and re-creates the
  // GL context; the effect is deliberately mount-only.
  const setupRef = useRef(setup)
  setupRef.current = setup

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = setupRef.current(canvas)
    if (!renderer) return

    let frame = 0
    let start = 0
    let running = false
    let disposed = false
    let lastDrawAt = 0

    /**
     * Measured, never remembered.
     *
     * This used to be a flag the IntersectionObserver wrote. A hidden tab makes
     * the observer report "not intersecting", so the flag latched false, and
     * when the tab came back `visibilitychange` re-ran this check against the
     * stale false and never restarted the loop. Switching windows once killed
     * the canvas for good. Reading the rectangle costs nothing at the rate this
     * is called, and cannot go stale.
     */
    const isOnScreen = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      return rect.bottom > -MARGIN && rect.top < window.innerHeight + MARGIN
    }

    const scale = () => Math.min(window.devicePixelRatio || 1, maxDpr) * resolution

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = scale()
      const width = Math.max(1, Math.round(rect.width * dpr))
      const height = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width === width && canvas.height === height) return
      canvas.width = width
      canvas.height = height
      renderer.resize(width, height)
    }

    const tick = (now: number) => {
      if (disposed) return
      if (start === 0) start = now
      renderer.draw((now - start) / 1000)
      lastDrawAt = Date.now()
      frame = window.requestAnimationFrame(tick)
    }

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      running = false
    }

    /** Start, restart after a pause, or draw the one static frame. */
    const sync = () => {
      if (disposed) return
      resize()

      if (motionIsReduced()) {
        stop()
        renderer.draw(0)
        return
      }

      const shouldRun = isOnScreen() && document.visibilityState === 'visible'
      if (shouldRun && !running) {
        running = true
        // Rebase so a pause does not jump the animation forward by its length.
        start = 0
        frame = window.requestAnimationFrame(tick)
      } else if (!shouldRun && running) {
        stop()
      }
    }

    // Purely a trigger: it tells us *when* to re-check, never *what* the
    // answer is.
    const observer = new IntersectionObserver(() => sync(), {
      rootMargin: `${MARGIN}px`,
    })
    observer.observe(canvas)

    const resizeObserver = new ResizeObserver(() => sync())
    resizeObserver.observe(canvas)

    // The manual toggle flips an attribute on <html> rather than firing an
    // event, so it has to be watched.
    const motionObserver = new MutationObserver(() => sync())
    motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-reduce-motion'],
    })

    /**
     * A dropped animation frame chain is silent: nothing fires, and the canvas
     * holds whatever it last drew, which reads as a still image rather than as
     * a fault. Symptom seen in the wild — both canvases sitting at uTime 0,
     * having drawn frame one and stopped.
     *
     * So the loop is supervised rather than trusted. If it should be running
     * and has not drawn for a second, restart it. A timer per canvas is a
     * rounding error next to the render it is guarding, and browsers throttle
     * this alongside everything else when the tab is hidden, which is exactly
     * when we want it quiet anyway.
     */
    const watchdog = window.setInterval(() => {
      if (disposed || motionIsReduced()) return
      const shouldRun = isOnScreen() && document.visibilityState === 'visible'
      if (!shouldRun) return
      if (!running || Date.now() - lastDrawAt > 1000) {
        stop()
        running = true
        start = 0
        lastDrawAt = Date.now()
        frame = window.requestAnimationFrame(tick)
      }
    }, 1000)

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    media.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)

    sync()

    return () => {
      disposed = true
      stop()
      window.clearInterval(watchdog)
      observer.disconnect()
      resizeObserver.disconnect()
      motionObserver.disconnect()
      media.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      renderer.dispose()
    }
  }, [resolution, maxDpr])

  return canvasRef
}

/**
 * Reads a colour token off the document and returns it as normalised RGB for a
 * uniform. Keeps the shaders inside the token system — no colour literal ends
 * up in GLSL, and both themes stay correct because the variable is re-read
 * whenever the backdrop re-reads its palette.
 */
export function tokenRgb(name: string, fallback: [number, number, number]): [number, number, number] {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!raw) return fallback

  // Tokens are either `#rrggbb` or a bare `r, g, b` triplet.
  if (raw.startsWith('#') && raw.length >= 7) {
    const int = Number.parseInt(raw.slice(1, 7), 16)
    if (Number.isNaN(int)) return fallback
    return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255]
  }

  const parts = raw.split(',').map((part) => Number.parseFloat(part))
  if (parts.length >= 3 && parts.every((part) => !Number.isNaN(part))) {
    return [parts[0] / 255, parts[1] / 255, parts[2] / 255]
  }
  return fallback
}
