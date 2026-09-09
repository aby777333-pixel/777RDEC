'use client'

import { useEffect, useState } from 'react'
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
        scrolled ? 'glass border-b border-line-1' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="container-raptor flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <RaptorLogoLink />
          <MegaMenu />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <ButtonLink href="/platform" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Platform
          </ButtonLink>
          <ButtonLink href="/request-demo" variant="primary" size="sm" className="hidden sm:inline-flex">
            Request Demo
          </ButtonLink>
          <MobileDrawer />
        </div>
      </div>
    </header>
  )
}
