'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the tube scene's Three.js, the same one <LazyPyramids> uses
 * and for the same reason: the band is a hero and on screen immediately, so
 * there is nothing to wait for — what `next/dynamic` buys is that three lands
 * in a chunk of its own rather than in the route's JavaScript, and the page is
 * interactive without it.
 *
 * `ssr: false` because there is no server render of a WebGL canvas worth
 * having, which is also why this wrapper is a client component.
 */
const TubeBackdrop = dynamic(() => import('./tube-backdrop').then((m) => m.TubeBackdrop), {
  ssr: false,
})

export function LazyTube({ className }: { className?: string }) {
  return <TubeBackdrop className={className} />
}
