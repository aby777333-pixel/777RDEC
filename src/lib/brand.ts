/**
 * Single source of truth for brand + legal constants.
 * Nothing in this file may be hard-coded anywhere else in the app.
 */

export const SITE_NAME = '777 Raptor'
export const SITE_DOMAIN = '777raptor.com'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://777raptor.com'
export const SITE_TAGLINE = 'Trading Technology. Evolved.'
export const LOGO_TAGLINE = 'PRECISION. POWER. PERFORMANCE.'

/**
 * The brief says "Evolving"; the live cockpit says "Evolutionary".
 * The brief wins. Change it here and it changes everywhere.
 */
export const EMIL_EXPANSION = 'Evolving Market Intelligence Layer'
export const EMIL_SHORT = 'EMIL'

/** Legal entity block. Rendered by <LegalEntityBlock> in the footer. */
export const LEGAL_ENTITY_NAME = '777 Capital Markets Limited'
export const LEGAL_ENTITY_JURISDICTION = 'United Kingdom'
export const COMPANY_NUMBER = '17049134'
/**
 * TODO_CONFIRM — two different registered addresses appear in prior
 * materials. Abe to confirm before launch. Rendered verbatim, including
 * the marker, so it cannot ship unnoticed.
 */
export const REGISTERED_ADDRESS = 'TODO_CONFIRM — registered address pending confirmation'
export const JURISDICTION_NOTE =
  'Availability of products, markets, instruments and automation features differs by jurisdiction. Not all features described on this site are available or permitted in all regions.'

/** Technology-provider disclosure. Required in the footer of every page. */
export const TECHNOLOGY_PROVIDER_DISCLOSURE =
  '777 Raptor is a technology provider. It does not provide brokerage services, investment advice, portfolio management, liquidity provision or custody unless a named legal entity is authorised to do so in the relevant jurisdiction.'

/** Short-form risk line. Required on every EMIL and risk surface. */
export const RISK_LINE_SHORT =
  'Trading leveraged products carries a high level of risk to capital. Technology can improve analysis and controls; it cannot remove market risk.'


export const CONTACT_EMAIL = `hello@${SITE_DOMAIN}`
export const DEVELOPERS_EMAIL = `developers@${SITE_DOMAIN}`

/** Ecosystem pillars — the six blocks that dock together on the homepage. */
export const ECOSYSTEM_PILLARS = [
  { id: 'terminal', label: 'Terminal', href: '/platform/terminal', line: 'Where analysis becomes execution.' },
  { id: 'crm', label: 'CRM', href: '/brokers/crm', line: 'Every client relationship, in context.' },
  { id: 'portal', label: 'Client Portal', href: '/brokers/client-portal', line: 'Onboarding, funding, verification.' },
  { id: 'risk', label: 'Risk Engine', href: '/platform/risk', line: 'Exposure, limits and controls.' },
  { id: 'api', label: 'API Hub', href: '/technology/api', line: 'REST, WebSocket, FIX, webhooks.' },
  { id: 'emil', label: EMIL_SHORT, href: '/platform/emil', line: 'The intelligence layer underneath.' },
] as const

export type EcosystemPillar = (typeof ECOSYSTEM_PILLARS)[number]
