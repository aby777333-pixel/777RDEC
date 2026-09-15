/**
 * Whether the page is being scrolled right now.
 *
 * The hero bands animate every frame — WebGL scenes, full-band canvases, and
 * CSS scenes of dozens of translucent 3D layers. While the page scrolls, that
 * work competes with the scroll itself for the same frame budget, and on an
 * ordinary laptop the scroll loses: it stutters, or seems to hang for a moment
 * over the hero. So while a scroll is in progress the bands hold still, and
 * they carry on a moment after it stops.
 *
 * - The canvas hooks subscribe here and skip drawing while this is true, with
 *   their clocks held so nothing jumps when they resume.
 * - CSS-animated scenes pause through `data-scrolling` on <html>, which the
 *   stylesheet reads (see `.hero-band` in globals.css).
 *
 * One passive listener for the whole page, attached on first use.
 */

/** How long after the last scroll event the page counts as still. */
const IDLE_MS = 150

let scrolling = false
let idleTimer = 0
let attached = false
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

function onScroll() {
  if (!scrolling) {
    scrolling = true
    document.documentElement.dataset.scrolling = 'true'
    notify()
  }
  window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => {
    scrolling = false
    delete document.documentElement.dataset.scrolling
    notify()
  }, IDLE_MS)
}

function attach() {
  if (attached || typeof window === 'undefined') return
  attached = true
  window.addEventListener('scroll', onScroll, { passive: true })
}

export function isScrolling(): boolean {
  return scrolling
}

/** Calls `listener` whenever scrolling starts or settles. Returns an unsubscribe. */
export function subscribeScrollActivity(listener: () => void): () => void {
  attach()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Starts tracking without subscribing — for pages whose scenes are CSS only. */
export function startScrollActivity(): void {
  attach()
}
