'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const KEY = 'raptor-reduce-motion'

/**
 * Manual motion control, persisted. Sits alongside the OS-level
 * prefers-reduced-motion handling in globals.css rather than replacing it.
 */
export function ReduceMotionToggle({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY)
    if (stored === 'true') {
      setReduced(true)
      document.documentElement.dataset.reduceMotion = 'true'
    }
  }, [])

  function toggle() {
    const next = !reduced
    setReduced(next)
    if (next) {
      document.documentElement.dataset.reduceMotion = 'true'
    } else {
      delete document.documentElement.dataset.reduceMotion
    }
    window.localStorage.setItem(KEY, String(next))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={reduced}
      className={cn(
        'inline-flex items-center gap-2 text-[0.8125rem] text-steel-500 transition-colors hover:text-steel-300',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'relative h-4 w-7 rounded-full border transition-colors duration-200',
          reduced ? 'border-signal bg-signal/25' : 'border-line-2 bg-bg-2',
        )}
      >
        <span
          className={cn(
            'absolute top-[2px] h-[10px] w-[10px] rounded-full transition-all duration-200 ease-raptor',
            reduced ? 'left-[14px] bg-signal' : 'left-[2px] bg-steel-500',
          )}
        />
      </span>
      Reduce motion
    </button>
  )
}
