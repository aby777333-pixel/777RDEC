'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * The interactive half of <AppShotFrame>.
 *
 * A cockpit screen is dense — a board of quotes, a twenty-nine step pipeline,
 * an options chain — and at the width of a page column none of it is legible.
 * So the framed capture is a teaser: click it and the whole image opens at the
 * size of the window, click anywhere outside the image and it goes back.
 *
 * Escape closes it too, focus returns to the frame that opened it, and the
 * page behind is locked so a scroll gesture does not move it. The overlay is a
 * real dialog for screen readers rather than a div that happens to be on top.
 *
 * Inline the image is `contain`, not `cover`: a cropped screenshot of a
 * trading surface cuts off exactly the panel someone wanted to see, and the
 * point of a capture is that it is the whole screen.
 */
export function AppShotZoom({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    // Hold the page still underneath, and put the scrollbar's width back so
    // the layout does not jump sideways as the overlay opens.
    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      document.removeEventListener('keydown', onKey)
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [open, close])

  useEffect(() => {
    // Coming back from the overlay, the frame that opened it is where the
    // visitor was, so that is where the focus ring belongs.
    if (!open) triggerRef.current?.focus({ preventScroll: true })
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${alt} — open full size`}
        className={cn(
          'group relative block w-full cursor-zoom-in overflow-hidden rounded-card border border-line-2 bg-bg-1 shadow-soft transition-colors duration-200 ease-raptor hover:border-steel-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
          className,
        )}
      >
        {/* 16:9 is close to the shape of a full trading screen, so `contain`
            leaves only a hairline of ground rather than real letterboxing. */}
        <span className="relative block aspect-[16/9]">
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 1100px, (min-width: 768px) 90vw, 100vw"
            className="object-contain object-center"
          />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 right-3 rounded-ui border border-line-2 bg-bg-0/80 px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Click to enlarge
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          // The backdrop is the close affordance: anything that is not the
          // image itself dismisses, which is what "click outside" means.
          onClick={close}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-bg-0/80 p-4 backdrop-blur-sm motion-safe:animate-ticker-in md:p-10"
        >
          {/* Stop the click here so pressing the image does not dismiss it —
              a visitor reading an options chain wants to point at a row. The
              width and height are the shape of a capture, not its real pixels:
              the CSS sizes it, and they only tell Next what ratio to reserve. */}
          <Image
            src={src}
            alt={alt}
            width={2560}
            height={1440}
            onClick={(event) => event.stopPropagation()}
            className="h-auto max-h-full w-auto max-w-full cursor-default rounded-card border border-line-2 object-contain shadow-raised"
          />
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-ui border border-line-2 bg-bg-1 px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-300 transition-colors duration-200 hover:border-steel-700 hover:text-steel-100 md:right-8 md:top-8"
          >
            Close
          </button>
        </div>
      ) : null}
    </>
  )
}
