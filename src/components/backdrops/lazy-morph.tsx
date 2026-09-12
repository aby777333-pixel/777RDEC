'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the morph scene's Three.js.
 *
 * Unlike the singularity, which sits at the bottom of the home page and can
 * wait for a scroll, this one backs a hero and is on screen immediately — so
 * there is nothing to wait for, and the gate is only about the bundle. What
 * `next/dynamic` buys is that Three lands in a chunk of its own rather than in
 * the route's JavaScript: the page's copy, nav and call to action parse and
 * become interactive without it, and the scene fades in a beat later.
 *
 * `ssr: false` because there is no server render of a WebGL canvas worth
 * having — which is also why this wrapper is a client component: Next will not
 * allow that option from a server one.
 */
const MorphBackdrop = dynamic(
  () => import('./morph-backdrop').then((m) => m.MorphBackdrop),
  { ssr: false },
)

export function LazyMorph({ className }: { className?: string }) {
  return <MorphBackdrop className={className} />
}
