'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { MegaMenu } from './mega-menu'
import { MobileDrawer } from './mobile-drawer'
import { ButtonLink } from '@/components/ui/button'
import { RaptorLogoLink } from '@/components/ui/raptor-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300 ease-raptor',
        scrolled
          ? 'glass border-b border-line-1 shadow-soft'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      {/* 88px, to give the 64px mark room. Still under scroll-mt-24 (96px), so
          in-page anchors clear the header unchanged. */}
      <div className="container-raptor flex h-[5.5rem] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <RaptorLogoLink />
          <MegaMenu />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            title="Search"
            className={cn(
              'hidden h-9 w-9 items-center justify-center rounded-ui border border-line-2 text-steel-300 sm:inline-flex',
              'transition-colors duration-200 hover:border-signal hover:text-signal',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
            )}
          >
            <Search size={16} strokeWidth={1.5} aria-hidden />
          </Link>
          <ThemeToggle className="hidden sm:inline-flex" />
          <ButtonLink
            href="/request-demo"
            variant="primary"
            size="sm"
            className="hidden whitespace-nowrap sm:inline-flex"
          >
            Request Demo
          </ButtonLink>
          <MobileDrawer />
        </div>
      </div>
    </header>
  )
}
