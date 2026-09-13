'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the Sacred Geometry Reactor's Three.js, the same one
 * <LazyPyramids> uses: three, its bloom and output passes, and the pen's HUD
 * land in a chunk of their own rather than in the route's JavaScript.
 */
const ReactorBackdrop = dynamic(
  () => import('./reactor-backdrop').then((m) => m.ReactorBackdrop),
  { ssr: false },
)

export function LazyReactor({ className }: { className?: string }) {
  return <ReactorBackdrop className={className} />
}
