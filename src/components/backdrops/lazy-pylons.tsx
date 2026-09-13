'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the Pylon Terrain's WebGPU build of three, the same one
 * <LazyPyramids> uses: three's WebGPU renderer, TSL and the GTAO and bloom
 * nodes land in a chunk of their own, and only a browser that renders the
 * search page ever asks for it.
 */
const PylonsBackdrop = dynamic(() => import('./pylons-backdrop').then((m) => m.PylonsBackdrop), {
  ssr: false,
})

export function LazyPylons({ className }: { className?: string }) {
  return <PylonsBackdrop className={className} />
}
