import Link from 'next/link'
import { RaptorLogo } from '@/components/ui/raptor-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ReduceMotionToggle } from './reduce-motion-toggle'
import { FOOTER_PRODUCT_LINKS, LEGAL_LINKS } from '@/lib/navigation'
import {
  COMPANY_NUMBER,
  JURISDICTION_NOTE,
  LEGAL_ENTITY_JURISDICTION,
  LEGAL_ENTITY_NAME,
  REGISTERED_ADDRESS,
  SITE_TAGLINE,
  TECHNOLOGY_PROVIDER_DISCLOSURE,
} from '@/lib/brand'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-line-1 bg-bg-1">
      <div className="container-raptor py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4">
            <RaptorLogo size="lg" showTagline />
            <p className="font-display text-[1.125rem] uppercase tracking-tight text-steel-300">
              {SITE_TAGLINE}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <ThemeToggle />
            <ReduceMotionToggle />
          </div>
        </div>

        <nav aria-label="Product" className="mt-12 border-t border-line-1 pt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {FOOTER_PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.9375rem] text-steel-300 transition-colors hover:text-steel-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex flex-col gap-6 border-t border-line-1 pt-8">
          <LegalEntityBlock />

          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-steel-500 transition-colors hover:text-steel-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="text-[0.8125rem] text-steel-500">
            © {year} {LEGAL_ENTITY_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

/**
 * Technology-provider disclosure + legal entity. Required on every page,
 * which is why it lives in the shared footer and reads from brand.ts.
 */
export function LegalEntityBlock() {
  return (
    <div className="flex max-w-4xl flex-col gap-3 text-[0.8125rem] leading-relaxed text-steel-500">
      <p>{TECHNOLOGY_PROVIDER_DISCLOSURE}</p>
      <p>
        {LEGAL_ENTITY_NAME} ({LEGAL_ENTITY_JURISDICTION}). Company No. {COMPANY_NUMBER}.{' '}
        {REGISTERED_ADDRESS}
      </p>
      <p>{JURISDICTION_NOTE}</p>
    </div>
  )
}
