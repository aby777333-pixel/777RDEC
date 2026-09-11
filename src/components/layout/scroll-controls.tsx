'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Page-scroll control: one viewport up, one viewport down.
 *
 * Sits on the right edge at the vertical centre rather than the usual
 * bottom-right corner, because the cookie banner already owns that corner
 * (`fixed bottom-4 right-6 z-50`) and two floating controls fighting over the
 * same space is worse than an unusual position.
 *
 * Hidden entirely when the page does not scroll, so short pages — a legal
 * notice, a 404 — do not carry a control that would do nothing. Each button
 * disables itself at its end of the page rather than disappearing, so the
 * control does not change size under the pointer.
 */

/** Matches the hook used by the backdrops: OS preference or the site's toggle. */
function motionIsReduced(): boolean {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.reduceMotion === 'true'
  )
}

export function ScrollControls() {
  const [scrollable, setScrollable] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const read = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setScrollable(max > 240)
      setAtTop(window.scrollY <= 8)
      setAtBottom(window.scrollY >= max - 8)
    }

    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    // Content below the fold can change height after hydration (images, the
    // MDX body), which changes whether the page scrolls at all.
    const observer = new ResizeObserver(read)
    observer.observe(document.body)

    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
      observer.disconnect()
    }
  }, [])

  if (!scrollable) return null

  const page = (direction: 1 | -1) => {
    window.scrollBy({
      top: direction * window.innerHeight * 0.9,
      behavior: motionIsReduced() ? 'auto' : 'smooth',
    })
  }

  return (
    <div
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-px overflow-hidden rounded-full border border-signal/40 shadow-panel ring-1 ring-signal/15 sm:flex md:right-5"
      // Decorative-adjacent, but the buttons are real controls, so the group
      // gets a name rather than being hidden from assistive tech.
      role="group"
      aria-label="Scroll the page"
    >
      <Step label="Scroll up" onClick={() => page(-1)} disabled={atTop}>
        <ChevronUp size={20} strokeWidth={2} aria-hidden />
      </Step>
      <Step label="Scroll down" onClick={() => page(1)} disabled={atBottom}>
        <ChevronDown size={20} strokeWidth={2} aria-hidden />
      </Step>
    </div>
  )
}

function Step({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex h-12 w-12 items-center justify-center bg-bg-1 transition-colors duration-200',
        disabled
          ? 'cursor-default text-steel-700'
          : 'text-signal hover:bg-signal hover:text-bg-0',
      )}
    >
      {children}
    </button>
  )
}
