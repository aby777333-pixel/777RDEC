'use client'

import dynamic from 'next/dynamic'

/**
 * Gate in front of the Particle Explosion's Three.js, the same one
 * <LazyPyramids> uses: three lands in a chunk of its own rather than in the
 * route's JavaScript, and the pen's tag arrives with it.
 */
const ExplosionBackdrop = dynamic(
  () => import('./explosion-backdrop').then((m) => m.ExplosionBackdrop),
  { ssr: false },
)

export function LazyExplosion({ className }: { className?: string }) {
  return <ExplosionBackdrop className={className} />
}
