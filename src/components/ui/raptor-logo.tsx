'use client'

import Link from 'next/link'
import { LOGO_TAGLINE } from '@/lib/brand'
import { useLogoSources } from '@/components/layout/brand-provider'
import { cn } from '@/lib/utils'

const SCALE = {
  sm: { type: 'text-[1.125rem]', wing: 'h-5 w-9', raster: 'h-6', tagline: 'text-[0.5rem]' },
  md: { type: 'text-[1.375rem]', wing: 'h-6 w-11', raster: 'h-8', tagline: 'text-[0.5625rem]' },
  lg: { type: 'text-[2.5rem]', wing: 'h-11 w-20', raster: 'h-16', tagline: 'text-[0.5625rem]' },
} as const

type Size = keyof typeof SCALE

/**
 * The logo lockup.
 *
 * Uses the master file from public/brand/ when it is there, and otherwise
 * composes the lockup from live type plus the abstracted five-feather wing —
 * crisp at every size and re-themes with the palette. Which files exist is
 * resolved on the server in the root layout and supplied via BrandProvider, so
 * a missing file is never requested.
 *
 * When a darker-inked variant exists it is used for the light theme, since the
 * master mark is brushed silver and washes out against white.
 */
export function RaptorLogo({
  className,
  showTagline = false,
  size = 'md',
}: {
  className?: string
  showTagline?: boolean
  size?: Size
}) {
  const scale = SCALE[size]
  const sources = useLogoSources()

  if (sources.default) {
    return (
      <span className={cn('inline-flex items-center', className)}>
        {sources.light ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no optimisation needed */}
            <img
              src={sources.light}
              alt="777 Raptor"
              className={cn('w-auto object-contain dark:hidden', scale.raster)}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no optimisation needed */}
            <img
              src={sources.default}
              alt=""
              aria-hidden
              className={cn('hidden w-auto object-contain dark:block', scale.raster)}
            />
          </>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no optimisation needed */
          <img
            src={sources.default}
            alt="777 Raptor"
            className={cn('w-auto object-contain', scale.raster)}
          />
        )}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span className={cn('shrink-0 text-steel-300', scale.wing)}>
        <WingGlyph />
      </span>
      <span className="h-8 w-px shrink-0 bg-line-2" aria-hidden />
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline gap-1.5">
          <span className={cn('font-display font-bold tracking-tight text-chrome', scale.type)}>777</span>
          <span
            className={cn('font-display font-bold uppercase tracking-tight text-steel-100', scale.type)}
          >
            Raptor
          </span>
        </span>
        {showTagline ? (
          <span className={cn('mt-1.5 uppercase tracking-[0.28em] text-steel-500', scale.tagline)}>
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
