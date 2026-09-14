'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the ZERO-POINT scene, so Three.js, its post-processing and
 * the cannon-es physics engine land in a chunk of their own rather than in the
 * route's JavaScript. `ssr: false` because a WebGL canvas has no server render
 * worth having.
 */
const ZeropointBackdrop = dynamic(
  () => import('./zeropoint-backdrop').then((m) => m.ZeropointBackdrop),
  { ssr: false },
)

export function LazyZeropoint({ className }: { className?: string }) {
  return <ZeropointBackdrop className={className} />
}
