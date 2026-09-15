import Link from 'next/link'
import { RaptorLogo } from '@/components/ui/raptor-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ReduceMotionToggle } from './reduce-motion-toggle'
import { NewsletterForm } from '@/components/forms/newsletter-form'
import { CookiePreferencesButton } from './cookie-banner'
import { SocialLinks } from './social-links'
import { FOOTER_PRODUCT_LINKS, LEGAL_LINKS } from '@/lib/navigation'
import { ArrowUpRight, Download, FileText, MapPin, Phone } from 'lucide-react'
import { ButtonAnchor } from '@/components/ui/button'
import {
  BROCHURE,
  COMPANY_NUMBER,
  CONTACT_EMAIL,
  HQ_ADDRESS_LINES,
  JURISDICTION_NOTE,
  LEGAL_ENTITY_JURISDICTION,
  LEGAL_ENTITY_NAME,
  PHONE_DISPLAY,
  PHONE_E164,
  REGISTERED_ADDRESS,
  RETAIL_PARTNER,
  RISK_LINE_SHORT,
  SITE_TAGLINE,
  TECHNOLOGY_PROVIDER_DISCLOSURE,
} from '@/lib/brand'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="wash relative border-t border-line-1 bg-bg-1">
      <div className="container-raptor py-16">
        {/* Display preferences sit apart, top right, so the columns below
            start level with each other. */}
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-3">
          <ReduceMotionToggle />
          <ThemeToggle />
        </div>

        {/* The brand and the three ways to reach the company share one row,
            spread across the full width rather than stacked to the left. */}
        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <RaptorLogo size="lg" showTagline />
            <p className="font-display text-[1.125rem] uppercase tracking-tight text-steel-300">
              {SITE_TAGLINE}
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <span className="tint-2 tint-ink text-eyebrow uppercase">Follow us</span>
              <SocialLinks />
            </div>
          </div>
          <ContactBlock />
        </div>

        <div className="mt-12 grid gap-10 border-t border-line-1 pt-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <BrochureBlock />
          <RetailBlock />
          <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-1">
            <span className="tint-6 tint-ink text-eyebrow uppercase">Occasional dispatches</span>
            <p className="text-[0.9375rem] leading-relaxed text-steel-300">
              Method notes, release notes and market-structure writing. No signals, no
              performance claims, and nothing on a schedule.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <nav aria-label="Product" className="mt-10 border-t border-line-1 pt-8">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
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

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

            <p className="shrink-0 text-[0.8125rem] text-steel-500">
              © {year} {LEGAL_ENTITY_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

/** The product brochure: view it in a new tab, or download the PDF. */
function BrochureBlock() {
  return (
    <div className="flex flex-col gap-3">
      <span className="tint-5 tint-ink text-eyebrow uppercase">Brochure</span>
      <p className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-steel-300">
        <FileText size={15} strokeWidth={1.5} aria-hidden className="mt-1 shrink-0 text-steel-500" />
        <span>
          The platform, EMIL, the broker stack and the architecture in one document.
          <span className="block text-steel-500">
            PDF · {BROCHURE.pages} pages · {BROCHURE.size}
          </span>
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <ButtonAnchor href={BROCHURE.href} target="_blank" rel="noopener" size="sm">
          View brochure
          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </ButtonAnchor>
        <ButtonAnchor href={BROCHURE.href} download={BROCHURE.downloadName} size="sm">
          <Download size={14} strokeWidth={1.75} aria-hidden />
          Download PDF
        </ButtonAnchor>
      </div>
    </div>
  )
}

/** Retail traders use EMIL through the retail partner, not through Raptor directly. */
function RetailBlock() {
  return (
    <div className="flex flex-col gap-3">
      <span className="tint-2 tint-ink text-eyebrow uppercase">For retail traders</span>
      <a
        href={RETAIL_PARTNER.url}
        target="_blank"
        rel="noopener"
        aria-label={`Trade with EMIL on ${RETAIL_PARTNER.name} (opens in a new tab)`}
        className="group flex w-fit flex-col gap-3 rounded-card border border-line-2 bg-bg-0 p-4 transition-colors hover:border-steel-700 hover:bg-bg-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- small static partner mark, no optimisation needed */}
        <img
          src={RETAIL_PARTNER.logo}
          alt={RETAIL_PARTNER.name}
          width={RETAIL_PARTNER.logoWidth}
          height={RETAIL_PARTNER.logoHeight}
          loading="lazy"
          // self-start: as a flex-column child the image would otherwise be
          // stretched to the width of the line under it, squashing the mark.
          className="h-14 w-auto self-start sm:h-16"
        />
        <span className="inline-flex items-center gap-1.5 text-[0.9375rem] text-steel-300 transition-colors group-hover:text-steel-100">
          Trade with EMIL on {RETAIL_PARTNER.name}
          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
        </span>
      </a>
      <p className="max-w-md text-[0.8125rem] leading-relaxed text-steel-500">{RISK_LINE_SHORT}</p>
    </div>
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
