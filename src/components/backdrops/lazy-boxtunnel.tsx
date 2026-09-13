'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the Infinite tunnel's Three.js, the same one <LazyPyramids> uses:
 * three lands in a chunk of its own rather than in the JavaScript every page
 * shares, and only a browser rendering this band asks for it.
 */
const BoxtunnelBackdrop = dynamic(() => import('./boxtunnel-backdrop').then((m) => m.BoxtunnelBackdrop), {
  ssr: false,
})

export function LazyBoxtunnel({ className }: { className?: string }) {
  return <BoxtunnelBackdrop className={className} />
}
