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
  /**
   * Buttons in the hero itself. Optional and opt-in: most pages want the
   * visitor to read the five answers before being asked for anything, so only
   * the pages that are a destination in their own right set this. The closing
   * CtaBand is separate and every page still has one.
   */
  heroActions?: readonly NextStep[]
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
