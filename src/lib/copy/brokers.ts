import { EMIL_SHORT } from '@/lib/brand'
import type { PageCopy } from './types'

const BROKER_CTA = [
  { label: 'Request a demo', href: '/request-demo', variant: 'primary' as const },
  { label: 'See the architecture', href: '/technology/architecture', variant: 'ghost' as const },
]

export const brokersHub: PageCopy = {
  title: 'Broker Solutions',
  description:
    'Run a brokerage on one stack: trading platform, CRM, client portal, back office, white label, liquidity connectivity and IB management.',
  eyebrow: 'Broker Solutions',
  heading: 'Your brand. Your clients. Raptor underneath.',
  lead: 'Your clients should see you. Raptor is the technology they never have to think about — the platform, the portal, the CRM and the controls, carrying your identity end to end.',
  answers: {
    what: 'A complete brokerage technology stack: trading platform, CRM, client portal, back office, IB management and liquidity connectivity, delivered under your brand.',
    who: 'Established brokers replacing a fragmented stack, and new brokers who would rather launch than integrate for eighteen months.',
    why: 'Most brokerage pain is integration pain. Separate platform, CRM and portal vendors mean three data models, three support queues and a reconciliation problem you own.',
    connects: 'One client record, one instrument master, one set of permissions. The portal, CRM, terminal and back office are views onto the same state.',
    next: 'A technical session: your instruments, your onboarding flow, your commission structures, your reporting requirements.',
  },
  modules: [
    { title: 'Broker platform', body: 'The trading surface your clients use, under your brand and your instrument configuration.' },
    { title: 'Raptor CRM', body: 'Client lifecycle, communications, funding history and desk activity in one record.' },
    { title: 'Client portal', body: 'Onboarding, verification, funding, statements and account management.' },
    { title: 'Back office', body: 'Operations, adjustments and reporting under least-privilege role controls.' },
    { title: 'IB and affiliates', body: 'Tiered structures, tracked links and rebate calculation that partners can audit themselves.' },
    { title: 'Liquidity connectivity', body: 'Connect the venues and providers you have chosen. Raptor routes; it does not provide liquidity.' },
  ],
  ctaHeading: 'A brokerage runs on operations, not slides',
  ctaBody:
    'Bring your onboarding flow, commission structures and reporting requirements. We will show you how they are configured rather than describe them.',
  ctaActions: BROKER_CTA,
}

export const brokerPlatform: PageCopy = {
  title: 'Broker Platform',
  description: 'The trading platform your clients use, configured to your instruments and branded as yours.',
  eyebrow: 'Broker Solutions · Platform',
  heading: 'The platform your clients think you built.',
  lead: 'Nothing on the trading surface says Raptor. Your logo, your palette, your domain, your instrument set, your margin profiles, your session hours.',
  answers: {
    what: 'A white-labelled deployment of the Raptor Terminal and its supporting modules, configured per broker.',
    who: 'Brokers who need a competitive trading surface without building or maintaining one.',
    why: 'Platform quality is now a retention factor. Clients compare surfaces, not just spreads.',
    connects: 'The platform authenticates against your client records and validates against your risk configuration.',
    next: 'We configure a branded instance for the demo so you are reviewing your platform, not ours.',
  },
  modules: [
    { title: 'Brand configuration', body: 'Logo, palette, typography, domain and email templates set per deployment.' },
    { title: 'Instrument configuration', body: 'Your symbols, spreads, margin profiles, session hours and trading rules.' },
    { title: 'Account types', body: 'Multiple account models with distinct leverage, commission and instrument access.' },
    { title: 'Client permissions', body: 'What each account type may trade, fund and automate, enforced server-side.' },
    { title: 'Web and mobile', body: 'One responsive surface rather than a desktop build and a separate mobile product.' },
    { title: 'Release control', body: 'Configuration changes do not require a platform release.' },
  ],
  ctaHeading: 'See it wearing your brand',
  ctaBody: 'Send a logo and a palette and the demo instance will be yours before the call.',
  ctaActions: BROKER_CTA,
}

export const crm: PageCopy = {
  title: 'Raptor CRM',
  description: 'Client lifecycle, communications, funding history and desk activity in one record.',
  eyebrow: 'Broker Solutions · CRM',
  heading: 'Every client relationship, in context.',
  lead: 'A CRM that does not know a client just took a loss, or that their withdrawal is pending verification, is a contact list. Raptor CRM reads the trading and funding state directly.',
  answers: {
    what: 'A brokerage CRM: lead pipeline, KYC status, funding history, trading activity, communications log, tasks and desk assignment.',
    who: 'Sales, retention, compliance and support teams who need the same version of the client.',
    why: 'When client context lives in three systems, the client explains their own history on every call.',
    connects: 'The CRM record is the client record. The portal, terminal and back office read the same identity, status and permissions.',
    next: 'A walkthrough of the client lifecycle from lead to funded account using representative data.',
  },
  modules: [
    { title: 'One client record', body: 'Identity, verification state, accounts, funding, trading activity and every interaction.' },
    { title: 'Lead pipeline', body: 'Sources, stages, ownership and conversion tracked without a separate sales tool.' },
    { title: 'Verification status', body: 'KYC and document state visible to the desk, with the audit trail compliance needs.' },
    { title: 'Funding history', body: 'Deposits, withdrawals and internal transfers with their current processing state.' },
    { title: 'Communications', body: 'Calls, emails and notes logged against the record, not a person’s inbox.' },
    { title: 'Desk activity', body: 'What the client actually trades — instruments, size, frequency, session.' },
  ],
  ctaHeading: 'Stop reconciling the client',
  ctaBody: 'We will map your current lead-to-funded flow onto the CRM and show you where the handoffs disappear.',
  ctaActions: BROKER_CTA,
}

export const clientPortal: PageCopy = {
  title: 'Raptor Client Portal',
  description: 'Onboarding, verification, funding, statements and account management for your clients.',
  eyebrow: 'Broker Solutions · Client Portal',
  heading: 'The first thing your client ever uses.',
  lead: 'Onboarding is where most brokerage relationships are won or abandoned. The portal is built to get a client from registration to a funded, verified account without a support ticket.',
  answers: {
    what: 'A branded client area: registration, verification, account opening, funding and withdrawals, statements, security settings and support.',
    who: 'Your clients, and the support team who would rather not walk each one through it.',
    why: 'Every extra step in onboarding costs conversions, and every unclear funding status costs a support contact.',
    connects: 'Portal actions write to the same client record the CRM and back office read, so status is never stale.',
    next: 'Walk the client journey yourself in a branded demo instance.',
  },
  modules: [
    { title: 'Registration and onboarding', body: 'Progressive steps with clear state, so a client always knows what remains.' },
    { title: 'Verification', body: 'Document upload, status tracking and clear reasons when something is rejected.' },
    { title: 'Funding', body: 'Deposits, withdrawals and transfers with visible processing state at every stage.' },
    { title: 'Account management', body: 'Open additional accounts, change leverage where permitted, view statements.' },
    { title: 'Security', body: 'Multi-factor authentication, session and device management, and a visible login history.' },
    { title: 'Support', body: 'Contextual help and ticketing attached to the client record.' },
  ],
  ctaHeading: 'Test the journey your client takes',
  ctaBody: 'Register, verify and fund in a demo instance and count the steps.',
  ctaActions: BROKER_CTA,
}

export const backOffice: PageCopy = {
  title: 'Broker Admin Command Center',
  description: 'Operations, adjustments and reporting under least-privilege role-based access control.',
  eyebrow: 'Broker Solutions · Back Office',
  heading: 'Powerful, and deliberately narrow.',
  lead: 'An administrator should be able to do their job and nothing else. Every back-office capability is a named permission, assigned to a role, recorded when used.',
  answers: {
    what: 'The operational console: client and account administration, funding approvals, adjustments, instrument configuration, reporting and audit.',
    who: 'Operations, finance, compliance and support — each seeing only what their role permits.',
    why: 'Broad administrative access is the largest operational risk most brokers carry, and the hardest to explain to an auditor.',
    connects: 'Roles are enforced server-side across the CRM, portal and platform, not hidden in the interface.',
    next: 'Review the permission matrix against your own team structure.',
  },
  modules: [
    { title: 'Role-based access', body: 'Granular permissions grouped into roles. No implicit administrator.' },
    { title: 'Least privilege by default', body: 'New roles start with nothing and are granted specific capabilities.' },
    { title: 'Funding operations', body: 'Approval workflows with maker-checker separation on sensitive actions.' },
    { title: 'Adjustments', body: 'Corrections require a reason and are recorded against the actor.' },
    { title: 'Reporting', body: 'Client, trading, funding and partner reporting, exportable and schedulable.' },
    { title: 'Audit log', body: 'Who did what, when, from where, and what changed.' },
  ],
  ctaHeading: 'Bring your org chart',
  ctaBody: 'We will map your roles onto the permission matrix and show you exactly what each person could do.',
  ctaActions: BROKER_CTA,
}

export const whiteLabel: PageCopy = {
  title: 'White Label',
  description: 'Your identity applied end to end: platform, portal, CRM, emails and domains.',
  eyebrow: 'Broker Solutions · White Label',
  heading: 'Your identity, all the way down.',
  lead: 'Branding is not a logo in a corner. It is the domain, the emails, the statements, the login screen and the mobile experience. All of it is yours.',
  answers: {
    what: 'Full brand configuration across every client-facing and staff-facing surface, delivered on your own domains.',
    who: 'Brokers, introducing brokers and institutions launching their own trading offering.',
    why: 'Any visible reference to an underlying vendor undermines the relationship you are building with your client.',
    connects: 'Brand configuration is data, not a fork. You receive platform improvements without losing your customisation.',
    next: 'Try the live re-skin on the homepage, then send us your brand guidelines.',
  },
  modules: [
    { title: 'Visual identity', body: 'Logo, palette, typography and iconography applied across every surface.' },
    { title: 'Domains', body: 'Platform, portal and API on your own domains with your certificates.' },
    { title: 'Transactional email', body: 'Templates, sender identity and domain authentication configured as yours.' },
    { title: 'Documents', body: 'Statements, confirmations and reports carrying your entity details.' },
    { title: 'Multi-brand', body: 'Operate several brands from one back office where your licences permit it.' },
    { title: 'No shared fork', body: 'Customisation is configuration, so upgrades are not a merge exercise.' },
  ],
  ctaHeading: 'Re-skin it in real time',
  ctaBody: 'The white-label demo on the homepage re-colours a live portal frame in the browser. Then bring the real guidelines.',
  ctaActions: BROKER_CTA,
}

export const liquidity: PageCopy = {
  title: 'Liquidity & Connectivity',
  description: 'Connect the venues and providers you have chosen. Raptor routes and monitors; it does not provide liquidity.',
  eyebrow: 'Broker Solutions · Liquidity',
  heading: 'Connect the liquidity you have chosen.',
  lead: 'Raptor is a technology layer, not a liquidity provider. It connects to the venues and providers you have relationships with, routes according to rules you set, and shows you how each one is actually performing.',
  answers: {
    what: 'Connectivity and routing: provider sessions, aggregation, rule-based routing, and execution-quality monitoring per provider.',
    who: 'Brokers and institutions managing one or more liquidity relationships.',
    why: 'Provider performance changes by instrument and by session. Without measurement, routing decisions are based on the last conversation with a sales team.',
    connects: 'Routing rules read the instrument master; execution results feed analytics and reporting.',
    next: 'A technical session with your providers and protocols on the table.',
  },
  modules: [
    { title: 'Provider sessions', body: 'FIX and API sessions managed with health monitoring and automatic recovery.' },
    { title: 'Aggregation', body: 'Combine provider books into one price for the platform to consume.' },
    { title: 'Rule-based routing', body: 'Route by instrument, size, session or client group, with defined fallbacks.' },
    { title: 'Execution quality', body: 'Fill rates, rejection rates, slippage and latency measured per provider.' },
    { title: 'Failover', body: 'Defined behaviour when a session degrades, rather than an outage nobody noticed.' },
    { title: 'Clear boundary', body: 'Raptor connects to liquidity. It does not provide or guarantee liquidity, pricing or execution.' },
  ],
  ctaHeading: 'Bring your providers',
  ctaBody: 'Tell us who you connect to and how, and we will walk through session management, routing and measurement.',
  ctaActions: BROKER_CTA,
}

export const ibAffiliates: PageCopy = {
  title: 'IB & Affiliate Management',
  description: 'Tiered partner structures, tracked links and rebate calculation partners can audit themselves.',
  eyebrow: 'Broker Solutions · IB & Affiliates',
  heading: 'Partners who can check their own numbers.',
  lead: 'Most partner disputes are arithmetic disputes. Give an introducing broker a live view of their clients, volumes and rebates and the disputes largely stop.',
  answers: {
    what: 'A partner management system: multi-tier structures, tracked referral links, per-instrument rebate rules, partner reporting and payout records.',
    who: 'Brokers running introducing-broker and affiliate networks, and the partners themselves.',
    why: 'Partner growth depends on trust in the numbers, and trust in the numbers depends on partners being able to see them without asking.',
    connects: `Attribution is written when the client registers, so rebates trace to real fills in the same system the client traded in. ${EMIL_SHORT} is not involved in partner calculations.`,
    next: 'Model your existing commission structures and see the partner view they produce.',
  },
  modules: [
    { title: 'Multi-tier structures', body: 'Master IBs, sub-IBs and affiliates with defined splits at each level.' },
    { title: 'Tracked links', body: 'Attribution captured at registration and preserved through the client lifecycle.' },
    { title: 'Rebate rules', body: 'Per lot, per instrument, per account type, with tier thresholds.' },
    { title: 'Partner portal', body: 'Live client counts, volumes, rebates and payout history for the partner.' },
    { title: 'Tier progression', body: 'Visible thresholds and progress, so partners know what the next tier requires.' },
    { title: 'Payout records', body: 'Calculated, approved and paid states with a full audit trail.' },
  ],
  ctaHeading: 'Model your commission structure',
  ctaBody: 'Send your current tiers and rebate tables and we will configure them for the walkthrough.',
  ctaActions: BROKER_CTA,
}
