'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of THE BREACH, so Three.js lands in a chunk of its own rather
 * than in the route's JavaScript. `ssr: false` because a WebGL canvas has no
 * server render worth having.
 */
const BreachBackdrop = dynamic(
  () => import('./breach-backdrop').then((m) => m.BreachBackdrop),
  { ssr: false },
)

export function LazyBreach({ className }: { className?: string }) {
  return <BreachBackdrop className={className} />
}
