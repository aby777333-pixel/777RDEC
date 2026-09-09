import { EMIL_SHORT } from '@/lib/brand'
import { DEFAULT_CTA_ACTIONS, type PageCopy } from './types'

const TECH_CTA = [
  { label: 'Talk to engineering', href: '/company/contact', variant: 'primary' as const },
  { label: 'Read the API docs', href: '/developers/api', variant: 'ghost' as const },
]

export const technologyHub: PageCopy = {
  title: 'Technology',
  description: 'Architecture, API hub, integrations, security and infrastructure behind the Raptor ecosystem.',
  eyebrow: 'Technology',
  heading: 'One connected ecosystem.',
  lead: 'Raptor is not a suite of products that were later integrated. It is one system with several surfaces, which is why state is consistent and why a change in one module is visible in the others immediately.',
  answers: {
    what: 'The engineering layer: how the modules connect, what the API exposes, what Raptor integrates with, how it is secured and where it runs.',
    who: 'CTOs, platform engineers and security teams evaluating whether this is something they can operate.',
    why: 'Integration debt is the most expensive kind. A shared data model removes most of it before it is created.',
    connects: 'Every module reads one instrument master, one identity model and one permission model. The API exposes the same primitives the modules use.',
    next: 'A technical review with your engineering and security teams, against your own requirements.',
  },
  modules: [
    { title: 'Architecture', body: 'How client, portal, CRM, execution and market connectivity actually fit together.' },
    { title: 'API Hub', body: 'REST, WebSocket, FIX and webhooks over the same primitives the platform uses.' },
    { title: 'Integrations', body: 'Payments, verification, communications and data — configured, not custom-built.' },
    { title: 'Security', body: 'The controls that are actually implemented, described in plain language.' },
    { title: 'Infrastructure', body: 'Where it runs, how it scales, how it recovers.' },
    { title: 'One data model', body: 'Shared identity, instruments and permissions. No cross-system reconciliation.' },
  ],
  ctaHeading: 'Bring your engineering team',
  ctaBody: 'The technical session is deliberately unpolished: architecture, data model, failure modes and operational reality.',
  ctaActions: TECH_CTA,
}

export const architecture: PageCopy = {
  title: 'Architecture',
  description: 'How client, portal, CRM, execution infrastructure and market connectivity connect in one ecosystem.',
  eyebrow: 'Technology · Architecture',
  heading: 'One ecosystem, drawn honestly.',
  lead: 'A client arrives at a portal. The portal writes to a client record the CRM owns. The terminal authenticates against that record and sends orders through the risk engine to market connectivity. The intelligence layer observes all of it.',
  answers: {
    what: 'The system topology: client surfaces, client and relationship management, trading and execution infrastructure, and market and liquidity connectivity.',
    who: 'Technical evaluators who need to know where the boundaries and the failure modes are.',
    why: 'Architecture determines what is possible later. Shared state is why a limit change applies instantly across every surface.',
    connects: `${EMIL_SHORT} spans the lower tiers as an observing layer. It has no privileged path to market: its orders pass the same risk checks.`,
    next: 'Request the architecture walkthrough and the data-model overview.',
  },
  modules: [
    { title: 'Client surfaces', body: 'Terminal, client portal and partner portal — separate surfaces, one identity model.' },
    { title: 'Relationship layer', body: 'CRM and back office own the client record and the permission model.' },
    { title: 'Execution infrastructure', body: 'Order management, the risk engine in the order path, and position keeping.' },
    { title: 'Market connectivity', body: 'Market data handlers and liquidity sessions, isolated per provider.' },
    { title: 'Intelligence layer', body: `${EMIL_SHORT} observes market, book and account state across the lower tiers.` },
    { title: 'Failure isolation', body: 'A degraded provider session does not take down the platform surface.' },
  ],
  ctaHeading: 'Ask the awkward questions',
  ctaBody: 'What happens when a feed goes stale, a provider rejects, or a client disconnects mid-order? Those are the useful questions.',
  ctaActions: TECH_CTA,
}

export const api: PageCopy = {
  title: 'Raptor API Hub',
  description: 'REST, WebSocket, FIX and webhooks over the same primitives the platform itself uses.',
  eyebrow: 'Technology · API',
  heading: 'Connect everything.',
  lead: 'If the platform can do it, the API can do it. Raptor exposes the same primitives its own surfaces are built on, which is the only way an API stays current.',
  answers: {
    what: 'A programmatic interface to accounts, instruments, market data, orders, positions and reporting, across four transports.',
    who: 'Developers at brokers, institutions and prop desks building their own tooling on top of Raptor.',
    why: 'An API that lags the product becomes a support burden. Building the product on its own API prevents that.',
    connects: 'API calls pass the same permission and risk checks as the interface. There is no back door.',
    next: 'Request sandbox keys and build against simulated data before you talk commercials.',
  },
  modules: [
    { title: 'REST', body: 'Accounts, instruments, orders, positions and reporting over versioned JSON endpoints.' },
    { title: 'WebSocket', body: 'Streaming prices, order and position updates, and account events.' },
    { title: 'FIX', body: 'Standard FIX sessions for institutional order flow and execution reporting.' },
    { title: 'Webhooks', body: 'Signed, retried delivery of account, funding and execution events to your systems.' },
    { title: 'Authentication', body: 'Scoped API keys with least-privilege permissions and rotation.' },
    { title: 'Rate limits', body: 'Documented, per-key limits with headers that tell you where you stand.' },
  ],
  ctaHeading: 'Get sandbox keys',
  ctaBody: 'Sandbox keys run against simulated market data, so you can build and test without a commercial commitment.',
  ctaActions: [
    { label: 'Request sandbox access', href: '/developers/sandbox', variant: 'primary' },
    { label: 'API reference', href: '/developers/api', variant: 'ghost' },
  ],
}

export const integrations: PageCopy = {
  title: 'Integrations',
  description: 'Payments, verification, communications and market data — configured rather than custom-built.',
  eyebrow: 'Technology · Integrations',
  heading: 'The things you already use.',
  lead: 'A brokerage runs on more than a trading platform. Payment providers, verification vendors, communication tools and data feeds are integration points, not projects.',
  answers: {
    what: 'A directory of integration categories with adapter-based connections, so a provider can be added or replaced by configuration.',
    who: 'Operations and engineering teams who already have vendor relationships they intend to keep.',
    why: 'Being forced onto a vendor you did not choose is a hidden cost of most platform decisions.',
    connects: 'Adapters write into the same client and funding records the CRM and portal read.',
    next: 'Send your current vendor list and we will confirm what exists and what would need building.',
  },
  modules: [
    { title: 'Payments', body: 'Card, bank transfer and alternative payment adapters with reconciliation.' },
    { title: 'Verification', body: 'Identity and document verification vendors behind a common interface.' },
    { title: 'Communications', body: 'Transactional email, SMS and messaging providers.' },
    { title: 'Market data', body: 'Pluggable feed handlers rather than a single mandated vendor.' },
    { title: 'Analytics and BI', body: 'Data export and warehouse connections for your own reporting stack.' },
    { title: 'Custom adapters', body: 'A documented adapter interface for anything not already supported.' },
  ],
  ctaHeading: 'Send us your vendor list',
  ctaBody: 'We will tell you plainly which integrations exist today and which would be development work.',
  ctaActions: DEFAULT_CTA_ACTIONS,
}

export const security: PageCopy = {
  title: 'Security',
  description: 'The security controls implemented in Raptor, described in plain language without certification claims.',
  eyebrow: 'Technology · Security',
  heading: 'Controls, not badges.',
  lead: 'This page lists what is implemented. It does not claim certifications we do not hold. If you need documentary evidence for a specific control, ask and we will provide what exists.',
  answers: {
    what: 'A plain-language description of implemented controls: encryption, authentication, access control, session management, logging, monitoring, backups and recovery.',
    who: 'Security teams, compliance functions and anyone performing vendor due diligence.',
    why: 'Security pages that lead with logos rather than controls are not useful to the people who have to sign off.',
    connects: 'Access control is enforced in one place and applied across every module, including the API.',
    next: 'Send your due-diligence questionnaire. We answer what we can evidence and say so where we cannot.',
  },
  modules: [
    { title: 'Encryption', body: 'Data encrypted in transit with modern TLS, and at rest in the data layer.' },
    { title: 'Authentication', body: 'Multi-factor authentication available on client and staff accounts.' },
    { title: 'Access control', body: 'Role-based permissions, least privilege by default, enforced server-side.' },
    { title: 'Session and device management', body: 'Active session visibility, device records and remote revocation.' },
    { title: 'Audit logging', body: 'Security-relevant and administrative actions recorded with actor, time and change.' },
    { title: 'Secrets management', body: 'Credentials and keys held in a managed secret store, not in configuration files.' },
    { title: 'Monitoring', body: 'Application, infrastructure and session-health monitoring with alerting.' },
    { title: 'Backups', body: 'Regular, tested backups of the data layer with defined retention.' },
    { title: 'Disaster recovery', body: 'Documented recovery objectives and a business-continuity plan that is exercised.' },
  ],
  ctaHeading: 'Send the questionnaire',
  ctaBody:
    'We would rather answer a hard due-diligence questionnaire accurately than publish a page of badges. Send yours.',
  ctaActions: [
    { label: 'Contact us', href: '/company/contact', variant: 'primary' },
    { label: 'Infrastructure', href: '/technology/infrastructure', variant: 'ghost' },
  ],
}

export const infrastructure: PageCopy = {
  title: 'Infrastructure',
  description: 'Where Raptor runs, how it scales and how it recovers.',
  eyebrow: 'Technology · Infrastructure',
  heading: 'Built for market hours.',
  lead: 'Markets do not wait for a maintenance window. The infrastructure is designed around the assumption that the busiest moment and the least forgiving moment are the same moment.',
  answers: {
    what: 'The hosting, scaling, monitoring and recovery model behind the platform.',
    who: 'Platform and operations teams responsible for uptime.',
    why: 'A platform that degrades at the open is worse than one that is slightly slower all day.',
    connects: 'Market connectivity, application services and the data layer scale independently.',
    next: 'A technical session covering capacity, monitoring, incident process and recovery objectives.',
  },
  modules: [
    { title: 'Managed hosting', body: 'Cloud infrastructure with infrastructure-as-code provisioning.' },
    { title: 'Horizontal scaling', body: 'Application and streaming layers scale independently of the data layer.' },
    { title: 'Session isolation', body: 'Provider and feed sessions isolated so one degradation is contained.' },
    { title: 'Monitoring and alerting', body: 'Health, latency and error-rate monitoring with defined escalation.' },
    { title: 'Deployment', body: 'Progressive deployment with rollback, avoiding changes during peak sessions.' },
    { title: 'Recovery', body: 'Defined recovery point and recovery time objectives, tested rather than assumed.' },
  ],
  ctaHeading: 'Ask about the last incident',
  ctaBody: 'Operational maturity is easier to judge from how a provider handles failure than from an uptime figure.',
  ctaActions: TECH_CTA,
}
