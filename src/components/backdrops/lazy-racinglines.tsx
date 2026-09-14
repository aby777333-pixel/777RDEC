'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the Racing Lines scene's Three.js, for the reason every
 * other WebGL hero has one: three lands in a chunk of its own rather than in
 * the route's JavaScript. `ssr: false` because a WebGL canvas has no server
 * render worth having.
 */
const RacinglinesBackdrop = dynamic(
  () => import('./racinglines-backdrop').then((m) => m.RacinglinesBackdrop),
  { ssr: false },
)

export function LazyRacinglines({ className }: { className?: string }) {
  return <RacinglinesBackdrop className={className} />
}
