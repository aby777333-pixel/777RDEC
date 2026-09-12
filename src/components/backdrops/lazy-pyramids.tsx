'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the pyramid scene's Three.js, the same one <LazyMorph> uses
 * and for the same reason: the band is a hero and on screen immediately, so
 * there is nothing to wait for — what `next/dynamic` buys is that three lands
 * in a chunk of its own rather than in the route's JavaScript, and the page is
 * interactive without it.
 *
 * `ssr: false` because there is no server render of a WebGL canvas worth
 * having, which is also why this wrapper is a client component.
 */
const PyramidsBackdrop = dynamic(
  () => import('./pyramids-backdrop').then((m) => m.PyramidsBackdrop),
  { ssr: false },
)

export function LazyPyramids({ className }: { className?: string }) {
  return <PyramidsBackdrop className={className} />
}
