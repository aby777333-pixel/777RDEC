import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LOGO_TAGLINE } from '@/lib/brand'

/**
 * Logo lockup, rendered as type + the abstracted wing so it is crisp at every
 * size and re-themes with the palette.
 *
 * When the master raster asset is added at /public/brand/raptor-logo.png it can
 * be swapped in here — this is the only place that decision lives.
 */
export function RaptorLogo({
  className,
  showTagline = false,
  size = 'md',
}: {
  className?: string
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const scale = {
    sm: { seven: 'text-[1.125rem]', raptor: 'text-[1.125rem]', wing: 'h-5 w-9' },
    md: { seven: 'text-[1.375rem]', raptor: 'text-[1.375rem]', wing: 'h-6 w-11' },
    lg: { seven: 'text-[2.5rem]', raptor: 'text-[2.5rem]', wing: 'h-11 w-20' },
  }[size]

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span className={cn('shrink-0 text-steel-300', scale.wing)}>
        <WingGlyph />
      </span>
      <span className="h-8 w-px shrink-0 bg-line-2" aria-hidden />
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline gap-1.5">
          <span className={cn('font-display font-bold tracking-tight text-chrome', scale.seven)}>777</span>
          <span
            className={cn('font-display font-bold uppercase tracking-tight text-steel-100', scale.raptor)}
          >
            Raptor
          </span>
        </span>
        {showTagline ? (
          <span className="mt-1.5 text-[0.5625rem] uppercase tracking-[0.28em] text-steel-500">
            {LOGO_TAGLINE}
          </span>
        ) : null}
      </span>
    </span>
  )
}

function WingGlyph() {
  return (
    <svg viewBox="0 0 44 24" fill="none" className="h-full w-full" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M2 21 C 12 18, 26 12, 42 2" />
        <path d="M2 17.5 C 11 15, 22 10, 34 2.5" opacity="0.75" />
        <path d="M2 14 C 10 12, 18 8.5, 27 3" opacity="0.55" />
        <path d="M2 10.5 C 9 9, 15 7, 21 3.5" opacity="0.38" />
        <path d="M2 7 C 8 6, 12 5, 16 4" opacity="0.22" />
      </g>
    </svg>
  )
}

export function RaptorLogoLink({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group rounded-ui', className)} aria-label="777 Raptor — home">
      <RaptorLogo />
    </Link>
  )
}
