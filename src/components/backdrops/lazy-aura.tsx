'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the Geometric Aura's Three.js, the same one <LazyPyramids>
 * uses: the band is on screen immediately, so what `next/dynamic` buys is that
 * three and its bloom pass land in a chunk of their own rather than in the
 * route's JavaScript. The pen's caption and loading notice arrive with it.
 */
const AuraBackdrop = dynamic(() => import('./aura-backdrop').then((m) => m.AuraBackdrop), {
  ssr: false,
})

export function LazyAura({ className }: { className?: string }) {
  return <AuraBackdrop className={className} />
}
