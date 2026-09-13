'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of Chill the lion's Three.js, the same one <LazyPyramids> uses:
 * three lands in a chunk of its own rather than in the JavaScript every page
 * shares, and only a browser rendering this band asks for it.
 */
const LionBackdrop = dynamic(() => import('./lion-backdrop').then((m) => m.LionBackdrop), {
  ssr: false,
})

export function LazyLion({ className }: { className?: string }) {
  return <LionBackdrop className={className} />
}
