'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Long detail that folds away on a phone.
 *
 * Below `sm` the content starts collapsed behind a "Read more" button, so a
 * list of long cards can be scanned without scrolling through every one; from
 * `sm` up it is always shown and the button does not render. The content is
 * in the HTML either way — only its display changes — so nothing is hidden
 * from search or from a reader who opens it.
 *
 * `className` is the content's own layout (for example a grid), applied when
 * it is visible.
 */
export function ExpandOnMobile({
  children,
  className,
  moreLabel = 'Read more',
  lessLabel = 'Show less',
}: {
  children: React.ReactNode
  className?: string
  moreLabel?: string
  lessLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex items-center gap-1.5 self-start rounded-ui border border-line-2 px-3 py-1.5 text-[0.8125rem] text-steel-100 transition-colors hover:bg-bg-2 sm:hidden"
      >
        {open ? lessLabel : moreLabel}
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          aria-hidden
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <div id={id} className={cn(className, !open && 'max-sm:hidden')}>
        {children}
      </div>
    </>
  )
}
