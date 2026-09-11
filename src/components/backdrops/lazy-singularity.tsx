'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Gate in front of the Three.js scene.
 *
 * Three is by far the heaviest thing on this site, and the section it draws is
 * the last one on the page. Two levels of laziness keep it off the critical
 * path: `next/dynamic` puts it in its own chunk rather than the route bundle,
 * and the chunk is not even requested until the closing band is within 600px
 * of the viewport. A visitor who never scrolls that far never downloads it.
 *
 * `ssr: false` because there is no server render of a WebGL canvas worth
 * having — which is also why this wrapper is a client component: Next will not
 * allow that option from a server one.
 */
const SingularityBackdrop = dynamic(
  () => import('./singularity-backdrop').then((m) => m.SingularityBackdrop),
  { ssr: false },
)

export function LazySingularity({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element) return

    let done = false
    const arm = () => {
      if (done) return
      done = true
      setNear(true)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) arm()
      },
      { rootMargin: '600px' },
    )
    observer.observe(element)

    // Belt and braces: measure on scroll too, so the scene still arrives if the
    // observer never delivers.
    const onScroll = () => {
      const rect = element.getBoundingClientRect()
      if (rect.top < window.innerHeight + 600 && rect.bottom > -600) arm()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div ref={host} aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      {near ? <SingularityBackdrop /> : null}
    </div>
  )
}
