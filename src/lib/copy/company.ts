import { CONTACT_EMAIL, EMIL_SHORT } from '@/lib/brand'
import { DEFAULT_CTA_ACTIONS, type PageCopy } from './types'

export const companyHub: PageCopy = {
  title: 'Company',
  description: 'Who builds 777 Raptor, who we work with, and how to reach us.',
  eyebrow: 'Company',
  heading: 'Built by people who have run desks.',
  lead: 'Raptor exists because the people building it spent years working around the gaps between a trading platform, a CRM and a client portal that were never designed to know about each other.',
  answers: {
    what: 'A trading technology company building the platform, relationship and intelligence layers brokers and desks run on.',
    who: 'Brokers, institutions, prop desks and professional traders.',
    why: 'The industry standard was to buy three systems and employ people to reconcile them. That is a solvable problem.',
    connects: 'One team builds the whole stack, which is why the modules share a data model rather than an integration.',
    next: 'Talk to us. The first conversation is usually technical.',
  },
  modules: [
    { title: 'About', body: 'Why Raptor exists and what it is trying to replace.' },
    { title: 'Partners', body: 'Who we build alongside, and what each relationship covers.' },
    { title: 'Careers', body: 'Engineering for systems that cannot be down at the open.' },
    { title: 'News', body: 'Product and company updates.' },
    { title: 'Contact', body: 'Reach a human who can answer technical questions.' },
    { title: 'Legal', body: 'Our disclosures, our entity details and the limits of what we do.' },
  ],
  ctaHeading: 'Start with a technical conversation',
  ctaBody: 'We would rather spend the first call on your architecture and your risk policy than on a slide deck.',
  ctaActions: DEFAULT_CTA_ACTIONS,
}

export const about: PageCopy = {
  title: 'About',
  description: 'Why 777 Raptor exists, what it builds, and the boundaries of what it does.',
  eyebrow: 'Company · About',
  heading: 'Precision. Power. Performance.',
  lead: 'Three words on a logo are easy. In practice they mean: the numbers must be right, the system must hold at the open, and the surface must be fast enough that a trader stops noticing it.',
  answers: {
    what: 'A technology provider building trading, relationship management and intelligence software for brokers, institutions and professional desks.',
    who: 'Firms who need to operate a trading business rather than assemble one.',
    why: 'Fragmented technology creates operational risk that eventually reaches the client. One data model removes most of it.',
    connects: `Terminal, CRM, portal, back office, risk engine, API and ${EMIL_SHORT} are one system with several surfaces.`,
    next: 'A technical session, then a configured demo against your own requirements.',
  },
  modules: [
    { title: 'What we build', body: 'Trading platform, CRM, client portal, back office, risk engine, API and intelligence layer.' },
    { title: 'What we do not do', body: 'We are not a broker. We do not provide investment advice, portfolio management, liquidity or custody.' },
    { title: 'How we build', body: 'One team, one data model, and the product built on its own public API.' },
    { title: 'Who we build for', body: 'Brokers, institutions, prop desks and professional traders.' },
    { title: 'How we talk about risk', body: 'Technology improves analysis and controls. It does not remove market risk, and we do not say otherwise.' },
    { title: 'Where we are going', body: 'Deeper intelligence, wider connectivity, and controls a risk committee can read.' },
  ],
  ctaHeading: 'Judge us on the technical session',
  ctaBody: 'Bring your engineers and your risk function. That is the conversation that tells you whether this fits.',
  ctaActions: DEFAULT_CTA_ACTIONS,
}

export const partners: PageCopy = {
  title: 'Partners',
  description: 'The categories of partner we work with and what each relationship covers.',
  eyebrow: 'Company · Partners',
  heading: 'Who we build alongside.',
  lead: 'Raptor connects to services our clients have already chosen. These are the categories of relationship that exist, described by what they cover rather than by logo.',
  answers: {
    what: 'Partner categories across liquidity, payments, verification, data and implementation.',
    who: 'Firms evaluating whether their existing vendor relationships survive a platform change.',
    why: 'Being forced to abandon a working provider relationship is an avoidable cost of switching platforms.',
    connects: 'Each category sits behind an adapter interface, so a provider is a configuration choice.',
    next: 'Send your vendor list and we will confirm what is already supported.',
  },
  modules: [
    { title: 'Liquidity relationships', body: 'Connectivity to the providers and venues our clients have chosen. Raptor does not provide liquidity.' },
    { title: 'Payment providers', body: 'Deposit and withdrawal rails with reconciliation into the client record.' },
    { title: 'Verification vendors', body: 'Identity and document verification behind a common interface.' },
    { title: 'Market data', body: 'Feed relationships, with pluggable handlers rather than one mandated vendor.' },
    { title: 'Implementation partners', body: 'Firms who assist with migration, configuration and operational setup.' },
    { title: 'Referral and IB partners', body: 'Partner structures managed through the IB and affiliate module.' },
  ],
  ctaHeading: 'Talk to us about a partnership',
  ctaBody: 'If you operate in one of these categories and your clients keep asking about platform technology, get in touch.',
  ctaActions: [
    { label: 'Contact us', href: '/company/contact', variant: 'primary' },
    { label: 'Integrations', href: '/technology/integrations', variant: 'ghost' },
  ],
}

export const careers: PageCopy = {
  title: 'Careers',
  description: 'Engineering for systems that cannot be down at the market open.',
  eyebrow: 'Company · Careers',
  heading: 'Systems that cannot be down at the open.',
  lead: 'Most software can be retried. This cannot. If you find that constraint interesting rather than stressful, we should talk.',
  answers: {
    what: 'Engineering, product, operations and support roles building and running the Raptor ecosystem.',
    who: 'People who like correctness, latency, and systems where the failure mode has a cost attached.',
    why: 'Financial infrastructure rewards care. It is one of the few places where being pedantic is a professional virtue.',
    connects: 'Small teams own whole surfaces end to end, including the operational consequences.',
    next: 'Send a message describing what you have built and what you want to work on.',
  },
  modules: [
    { title: 'Platform engineering', body: 'TypeScript, React, real-time data, and interfaces that stay responsive under load.' },
    { title: 'Execution and risk', body: 'Order paths, pre-trade validation and position keeping where correctness is the requirement.' },
    { title: 'Market connectivity', body: 'Feed handlers and provider sessions, including everything that happens when they degrade.' },
    { title: 'Intelligence', body: 'Applied analysis with explicit boundaries and explainable outputs.' },
    { title: 'Operations', body: 'Running a platform through market hours, incidents included.' },
    { title: 'Client support', body: 'Technical support for firms whose business depends on the platform staying up.' },
  ],
  ctaHeading: 'No open listing that fits?',
  ctaBody: `Send us what you have built anyway. Write to ${CONTACT_EMAIL} with something specific you are proud of.`,
  ctaActions: [{ label: 'Contact us', href: '/company/contact', variant: 'primary' }],
}

export const news: PageCopy = {
  title: 'News',
  description: 'Product and company updates from 777 Raptor.',
  eyebrow: 'Company · News',
  heading: 'What changed, and when.',
  lead: 'Product updates, platform changes and company news. Written for people who need to know what is different rather than what is exciting.',
  answers: {
    what: 'A record of product releases, platform changes and company announcements.',
    who: 'Clients, partners and anyone tracking the platform.',
    why: 'A client running a business on this stack needs to know what changed before their support queue tells them.',
    connects: 'Platform changes reference the modules they affect.',
    next: 'Subscribe, or read the release notes in the developer documentation.',
  },
  modules: [],
  ctaHeading: 'Talk to us instead',
  ctaBody: 'If you are evaluating Raptor, a conversation will tell you more than an announcement.',
  ctaActions: DEFAULT_CTA_ACTIONS,
}
