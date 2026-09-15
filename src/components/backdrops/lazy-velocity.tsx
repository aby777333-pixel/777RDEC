'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the VELOCITY ride, so Three.js lands in a chunk of its own
 * rather than in the route's JavaScript. `ssr: false` because a WebGL canvas
 * has no server render worth having.
 */
const VelocityBackdrop = dynamic(
  () => import('./velocity-backdrop').then((m) => m.VelocityBackdrop),
  { ssr: false },
)

export function LazyVelocity({ className }: { className?: string }) {
  return <VelocityBackdrop className={className} />
}
