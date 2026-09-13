/**
 * Whether motion should stop: the OS setting, or the site's own "Reduce
 * motion" toggle, which writes `data-reduce-motion` on <html>.
 *
 * Its own module so a 2D pen can ask without importing Three.js.
 */
export function motionIsReduced() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.reduceMotion === 'true'
  )
}
