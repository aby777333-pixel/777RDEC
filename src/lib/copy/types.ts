/**
 * Typed copy dictionaries. Every user-facing string on a standard page lives
 * here, so translation is a file swap rather than a refactor (§1 i18n rule).
 */

export type Module = {
  title: string
  body: string
}

/** The five questions every product page must answer (§ build order, Phase 6). */
export type FiveAnswers = {
  what: string
  who: string
  why: string
  connects: string
  next: string
}

export type NextStep = {
  label: string
  href: string
  variant?: 'primary' | 'ghost'
}

export type PageCopy = {
  /** Metadata */
  title: string
  description: string
  /** Hero */
  eyebrow: string
  heading: string
  lead: string
  /** Body */
  answers: FiveAnswers
  modules: readonly Module[]
  /** Conversion */
  ctaHeading: string
  ctaBody: string
  ctaActions: readonly NextStep[]
  /** Optional flags */
  showRiskLine?: boolean
  noindex?: boolean
}

export const DEFAULT_CTA_ACTIONS: readonly NextStep[] = [
  { label: 'Request a demo', href: '/request-demo', variant: 'primary' },
  { label: 'See the platform', href: '/platform', variant: 'ghost' },
]
