import Link from 'next/link'
import { RaptorLogo } from '@/components/ui/raptor-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ReduceMotionToggle } from './reduce-motion-toggle'
import { NewsletterForm } from '@/components/forms/newsletter-form'
import { CookiePreferencesButton } from './cookie-banner'
import { FOOTER_PRODUCT_LINKS, LEGAL_LINKS } from '@/lib/navigation'
import { MapPin, Phone } from 'lucide-react'
import {
  COMPANY_NUMBER,
  CONTACT_EMAIL,
  HQ_ADDRESS_LINES,
  JURISDICTION_NOTE,
  LEGAL_ENTITY_JURISDICTION,
  LEGAL_ENTITY_NAME,
  PHONE_DISPLAY,
  PHONE_E164,
  REGISTERED_ADDRESS,
  SITE_TAGLINE,
  TECHNOLOGY_PROVIDER_DISCLOSURE,
} from '@/lib/brand'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="wash relative border-t border-line-1 bg-bg-1">
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

        <div className="mt-12 grid gap-8 border-t border-line-1 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <ContactBlock />
        </div>

        <div className="mt-10 grid gap-6 border-t border-line-1 pt-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,32rem)] lg:gap-12">
          <div className="flex flex-col gap-2">
            <span className="tint-6 tint-ink text-eyebrow uppercase">Occasional dispatches</span>
            <p className="text-[0.9375rem] leading-relaxed text-steel-300">
              Method notes, release notes and market-structure writing. No signals, no
              performance claims, and nothing on a schedule.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <nav aria-label="Product" className="mt-10 border-t border-line-1 pt-8">
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
              <li>
                <CookiePreferencesButton className="text-[0.8125rem] text-steel-500 transition-colors hover:text-steel-300" />
              </li>
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

/** Headquarters and how to reach a person, in the footer of every page. */
function ContactBlock() {
  return (
    <>
      <address className="flex flex-col gap-2 not-italic">
        <span className="tint-1 tint-ink text-eyebrow uppercase">Headquarters</span>
        <span className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-steel-300">
          <MapPin size={15} strokeWidth={1.5} aria-hidden className="mt-1 shrink-0 text-steel-500" />
          <span>
            {HQ_ADDRESS_LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </span>
        </span>
      </address>

      <div className="flex flex-col gap-2">
        <span className="tint-4 tint-ink text-eyebrow uppercase">Talk to us</span>
        <a
          href={`tel:${PHONE_E164}`}
          className="inline-flex items-center gap-2.5 text-[0.9375rem] text-steel-300 transition-colors hover:text-steel-100"
        >
          <Phone size={15} strokeWidth={1.5} aria-hidden className="shrink-0 text-steel-500" />
          <span data-numeric>{PHONE_DISPLAY}</span>
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-[0.9375rem] text-steel-300 transition-colors hover:text-steel-100"
        >
          {CONTACT_EMAIL}
        </a>
      </div>

      <div className="flex flex-col gap-2">
        <span className="tint-3 tint-ink text-eyebrow uppercase">Registered entity</span>
        <p className="text-[0.9375rem] leading-relaxed text-steel-300">
          {LEGAL_ENTITY_NAME}
          <span className="block text-steel-500">
            {LEGAL_ENTITY_JURISDICTION} · Company No. {COMPANY_NUMBER}
          </span>
        </p>
      </div>
    </>
  )
}

/**
 * Technology-provider disclosure + legal entity. Required on every page,
 * which is why it lives in the shared footer and reads from brand.ts.
 */
export function LegalEntityBlock() {
  return (
    <div className="flex flex-col gap-3 text-[0.8125rem] leading-relaxed text-steel-500 lg:max-w-[95%]">
      <p>{TECHNOLOGY_PROVIDER_DISCLOSURE}</p>
      <p>
        {LEGAL_ENTITY_NAME} ({LEGAL_ENTITY_JURISDICTION}). Company No. {COMPANY_NUMBER}.{' '}
        {REGISTERED_ADDRESS}
      </p>
      <p>{JURISDICTION_NOTE}</p>
    </div>
  )
}
