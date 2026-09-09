'use client'

import { createContext, useContext } from 'react'
import type { LogoSources } from '@/lib/brand-assets'

/**
 * Which logo files exist is a filesystem question, so it is answered once on
 * the server in the root layout and passed down. The logo lockup appears
 * inside client components (nav, mobile drawer, error boundary), so a context
 * is the only way to give all of them the answer without each one importing
 * server-only code.
 */
const BrandContext = createContext<LogoSources>({ default: null, light: null })

export function BrandProvider({
  logo,
  children,
}: {
  logo: LogoSources
  children: React.ReactNode
}) {
  return <BrandContext.Provider value={logo}>{children}</BrandContext.Provider>
}

export function useLogoSources(): LogoSources {
  return useContext(BrandContext)
}
