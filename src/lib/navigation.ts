import { EMIL_SHORT } from './brand'

export type NavLink = { label: string; href: string; description: string }
export type NavGroup = { label: string; href: string; blurb: string; links: readonly NavLink[] }

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'Platform',
    href: '/platform',
    blurb: 'The trading surface and everything that makes it decisive.',
    links: [
      { label: 'Raptor Terminal', href: '/platform/terminal', description: 'Analysis and execution in one surface.' },
      { label: 'Modules', href: '/platform/modules', description: 'The twenty modules the stack is built from.' },
      { label: EMIL_SHORT, href: '/platform/emil', description: 'The intelligence layer inside the terminal.' },
      { label: 'Global Markets', href: '/platform/markets', description: 'Multi-asset coverage, session by session.' },
      { label: 'Trading Tools', href: '/platform/trading-tools', description: 'Charting, scanners, alerts, journaling.' },
      { label: 'Raptor Risk Engine', href: '/platform/risk', description: 'Exposure, limits, kill switches.' },
    ],
  },
  {
    label: 'Broker Solutions',
    href: '/brokers',
    blurb: 'Your brand. Your clients. Raptor underneath.',
    links: [
      { label: 'Broker Platform', href: '/brokers/platform', description: 'Run a brokerage on one stack.' },
      { label: 'Raptor CRM', href: '/brokers/crm', description: 'Every client relationship, in context.' },
      { label: 'Client Portal', href: '/brokers/client-portal', description: 'Onboarding, funding, verification.' },
      { label: 'Back Office', href: '/brokers/back-office', description: 'Least-privilege admin command centre.' },
      { label: 'White Label', href: '/brokers/white-label', description: 'Your identity, end to end.' },
      { label: 'Liquidity & Connectivity', href: '/brokers/liquidity', description: 'Connect the venues you choose.' },
      { label: 'IB & Affiliates', href: '/brokers/ib-affiliates', description: 'Partner networks that track themselves.' },
    ],
  },
  {
    label: 'Technology',
    href: '/technology',
    blurb: 'One connected ecosystem, documented and inspectable.',
    links: [
      { label: 'Architecture', href: '/technology/architecture', description: 'How the pieces actually connect.' },
      { label: 'API Hub', href: '/technology/api', description: 'REST, WebSocket, FIX, webhooks.' },
      { label: 'Integrations', href: '/technology/integrations', description: 'What Raptor already speaks to.' },
      { label: 'Security', href: '/technology/security', description: 'Controls in plain language.' },
      { label: 'Infrastructure', href: '/technology/infrastructure', description: 'Where it runs and how it stays up.' },
    ],
  },
  {
    label: 'Intelligence',
    href: '/intelligence',
    blurb: 'Understanding what is moving the market.',
    links: [
      { label: 'Market Intelligence', href: '/intelligence/market', description: 'Cross-asset context, not signals.' },
      { label: 'Risk Intelligence', href: '/intelligence/risk', description: 'Exposure seen before it hurts.' },
      { label: `${EMIL_SHORT} Lab`, href: '/intelligence/emil-lab', description: 'Arm it yourself, inside limits.' },
      { label: 'Research', href: '/intelligence/research', description: 'Method notes and market structure.' },
    ],
  },
  {
    label: 'Blog',
    href: '/blog',
    blurb: 'How this is built, and how we think about markets.',
    links: [
      { label: 'All posts', href: '/blog', description: 'Everything we have published.' },
      { label: `${EMIL_SHORT}`, href: '/blog/category/emil', description: 'The intelligence layer in depth.' },
      { label: 'Risk', href: '/blog/category/risk', description: 'Exposure, limits and capital protection.' },
      { label: 'Brokerage', href: '/blog/category/brokerage', description: 'Operating a brokerage on one stack.' },
      { label: 'Engineering', href: '/blog/category/engineering', description: 'How the platform is built.' },
      { label: 'Markets', href: '/blog/category/markets', description: 'Structure, sessions and cross-asset behaviour.' },
    ],
  },
  {
    label: 'Company',
    href: '/company',
    blurb: 'Who builds this, and how to reach them.',
    links: [
      { label: 'About', href: '/company/about', description: 'Why Raptor exists.' },
      { label: 'Partners', href: '/company/partners', description: 'Who we build alongside.' },
      { label: 'Careers', href: '/company/careers', description: 'Engineering for market hours.' },
      { label: 'How We Engage', href: '/company/engagement', description: 'Scoping, delivery and commercials.' },
      { label: 'Evidence', href: '/company/proof', description: 'What we will and will not claim.' },
      { label: 'FAQ', href: '/company/faq', description: 'The questions buyers actually ask.' },
      { label: 'News', href: '/company/news', description: 'Product and company updates.' },
      { label: 'Contact', href: '/company/contact', description: 'Talk to a human.' },
    ],
  },
  {
    label: 'Developers',
    href: '/developers',
    blurb: 'Build on Raptor.',
    links: [
      { label: 'Documentation', href: '/developers/docs', description: 'Guides and concepts.' },
      { label: 'API Reference', href: '/developers/api', description: 'Endpoints, streams, schemas.' },
      { label: 'Sandbox Access', href: '/developers/sandbox', description: 'Keys against simulated data.' },
      { label: 'System Status', href: '/developers/status', description: 'Live component health.' },
    ],
  },
] as const

export const FOOTER_PRODUCT_LINKS: readonly NavLink[] = [
  { label: 'Terminal', href: '/platform/terminal', description: '' },
  { label: EMIL_SHORT, href: '/platform/emil', description: '' },
  { label: 'CRM', href: '/brokers/crm', description: '' },
  { label: 'Client Portal', href: '/brokers/client-portal', description: '' },
  { label: 'Broker Solutions', href: '/brokers', description: '' },
  { label: 'API', href: '/technology/api', description: '' },
  { label: 'Blog', href: '/blog', description: '' },
  { label: 'Developers', href: '/developers', description: '' },
  { label: 'Security', href: '/technology/security', description: '' },
  { label: 'Company', href: '/company', description: '' },
  { label: 'Contact', href: '/company/contact', description: '' },
  { label: 'Search', href: '/search', description: '' },
]

export const LEGAL_LINKS: readonly NavLink[] = [
  { label: 'Risk Disclosure', href: '/legal/risk-disclosure', description: '' },
  { label: 'Privacy', href: '/legal/privacy', description: '' },
  { label: 'Terms', href: '/legal/terms', description: '' },
  { label: 'Cookies', href: '/legal/cookies', description: '' },
  { label: 'Notices', href: '/legal/notices', description: '' },
  { label: 'Jurisdictions', href: '/legal/jurisdictions', description: '' },
  { label: 'Technology Provider', href: '/legal/technology-provider', description: '' },
]
