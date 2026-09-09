import { DEVELOPERS_EMAIL } from '@/lib/brand'
import type { PageCopy } from './types'

const DEV_CTA = [
  { label: 'Request sandbox access', href: '/developers/sandbox', variant: 'primary' as const },
  { label: 'API reference', href: '/developers/api', variant: 'ghost' as const },
]

export const developersHub: PageCopy = {
  title: 'Developers',
  description: 'Documentation, API reference, sandbox access and system status for building on Raptor.',
  eyebrow: 'Developers',
  heading: 'Build on Raptor.',
  lead: 'Four transports, one permission model, and sandbox keys that run against simulated market data. Start building before anyone asks you for a purchase order.',
  answers: {
    what: 'Developer resources: guides, API reference across REST, WebSocket, FIX and webhooks, sandbox access and system status.',
    who: 'Developers at brokers, institutions and prop desks, and partners building integrations.',
    why: 'Evaluating a platform properly means writing code against it, not reading a datasheet.',
    connects: 'The API exposes the same primitives the platform surfaces use, under the same permission and risk checks.',
    next: 'Request sandbox keys and build something small end to end.',
  },
  modules: [
    { title: 'Documentation', body: 'Concepts, authentication, instruments, orders, positions and event delivery.' },
    { title: 'API reference', body: 'REST endpoints, WebSocket channels, FIX messages and webhook payloads.' },
    { title: 'Sandbox', body: 'Scoped keys against simulated market data with no commercial commitment.' },
    { title: 'System status', body: 'Component health, so you know whether it is you or us.' },
    { title: 'Versioning', body: 'Versioned endpoints with a documented deprecation policy.' },
    { title: 'Support', body: `Technical questions to ${DEVELOPERS_EMAIL}, answered by people who wrote it.` },
  ],
  ctaHeading: 'Start with the sandbox',
  ctaBody: 'Simulated data, real API shape. The fastest way to judge whether this is pleasant to build against.',
  ctaActions: DEV_CTA,
}

export const docs: PageCopy = {
  title: 'Documentation',
  description: 'Concepts, authentication, instruments, orders, positions and event delivery.',
  eyebrow: 'Developers · Documentation',
  heading: 'Concepts before endpoints.',
  lead: 'The endpoints are easy. What matters is the model: how an instrument is described, how a permission is evaluated, when an order is validated, and what an event guarantees.',
  answers: {
    what: 'Conceptual and task-based documentation for the Raptor API and platform.',
    who: 'Developers integrating with or building on top of Raptor.',
    why: 'Most integration bugs come from a misunderstood model, not a mistyped endpoint.',
    connects: 'Documentation references the same instrument and permission models the platform enforces.',
    next: 'Read the concepts, then request sandbox keys.',
  },
  modules: [
    { title: 'Authentication', body: 'API keys, scopes, rotation and what each scope permits.' },
    { title: 'Instruments', body: 'Symbology, tick and contract size, margin profile and session definitions.' },
    { title: 'Market data', body: 'Snapshot and streaming access, and what staleness looks like.' },
    { title: 'Orders', body: 'Order types, validation order, refusal reasons and idempotency.' },
    { title: 'Positions and accounts', body: 'Position keeping, P&L calculation basis and account state.' },
    { title: 'Events and webhooks', body: 'Delivery guarantees, signing, retry behaviour and replay.' },
  ],
  ctaHeading: 'Something unclear?',
  ctaBody: `Documentation gaps are bugs. Send them to ${DEVELOPERS_EMAIL} and they get fixed.`,
  ctaActions: DEV_CTA,
}

export const apiReference: PageCopy = {
  title: 'API Reference',
  description: 'REST endpoints, WebSocket channels, FIX messages and webhook payloads.',
  eyebrow: 'Developers · API Reference',
  heading: 'Four transports, one model.',
  lead: 'REST for state, WebSocket for streams, FIX for institutional flow, webhooks for events you should not have to poll for. All of them describe the same objects.',
  answers: {
    what: 'Reference material for every transport the platform exposes.',
    who: 'Developers writing integrations, trading tools or internal dashboards.',
    why: 'Consistency across transports means you learn the model once.',
    connects: 'Every transport passes the same authentication, permission and risk checks as the interface.',
    next: 'Get sandbox keys and make a call.',
  },
  modules: [
    { title: 'REST', body: 'Versioned JSON over HTTPS with documented rate limits and error shapes.' },
    { title: 'WebSocket', body: 'Subscribe to prices, orders, positions and account events with heartbeats.' },
    { title: 'FIX', body: 'Session configuration, supported messages and execution reporting.' },
    { title: 'Webhooks', body: 'Signed payloads, retry schedule, replay and idempotency keys.' },
    { title: 'Errors', body: 'One error shape across transports, with machine-readable reason codes.' },
    { title: 'Rate limits', body: 'Per-key limits published in response headers.' },
  ],
  ctaHeading: 'Try it against the sandbox',
  ctaBody: 'Sandbox keys are scoped, free and run against simulated data.',
  ctaActions: DEV_CTA,
}

export const sandboxAccess: PageCopy = {
  title: 'Sandbox Access',
  description: 'Request scoped API keys that run against simulated market data.',
  eyebrow: 'Developers · Sandbox',
  heading: 'Build against simulated data.',
  lead: 'The sandbox mirrors the production API shape and runs on simulated market data. Nothing in it touches a live account, a live venue or real money.',
  answers: {
    what: 'A non-production environment with the same API surface, scoped keys and simulated market data.',
    who: 'Developers evaluating Raptor or building an integration before go-live.',
    why: 'You should be able to judge an API by using it rather than by reading about it.',
    connects: 'Sandbox keys use the same authentication and permission model as production keys.',
    next: 'Request keys with the form below. We will confirm scope and send credentials.',
  },
  modules: [
    { title: 'Same API shape', body: 'Endpoints, payloads and error codes match production.' },
    { title: 'Simulated market data', body: 'Reproducible price generation, not a live feed.' },
    { title: 'Scoped keys', body: 'Least-privilege scopes so you test the permission model too.' },
    { title: 'No live exposure', body: 'No real accounts, no real venues, no real funds.' },
    { title: 'Reset on request', body: 'Reset sandbox state to a clean baseline whenever you need to.' },
    { title: 'Support', body: `Technical questions go to ${DEVELOPERS_EMAIL}.` },
  ],
  ctaHeading: 'Then talk about production',
  ctaBody: 'Once something works in the sandbox, the production conversation is a short one.',
  ctaActions: [
    { label: 'Request a demo', href: '/request-demo', variant: 'primary' },
    { label: 'Documentation', href: '/developers/docs', variant: 'ghost' },
  ],
}

export const status: PageCopy = {
  title: 'System Status',
  description: 'Component health across platform, market data, execution, portal and API.',
  eyebrow: 'Developers · Status',
  heading: 'Whether it is you or us.',
  lead: 'Component-level status so an integration problem can be diagnosed in one place rather than through a support queue.',
  answers: {
    what: 'A status page covering the platform surface, market data, execution, client portal, CRM and API transports.',
    who: 'Developers and operations teams integrating with or depending on Raptor.',
    why: 'The first question during an incident is always the same, and it deserves a public answer.',
    connects: 'Status reflects the same monitoring that pages the on-call engineer.',
    next: 'If a component is degraded and you need detail, contact support.',
  },
  modules: [],
  ctaHeading: 'Reporting a problem',
  ctaBody: `If something is broken and status says otherwise, tell us — that is the more serious bug. ${DEVELOPERS_EMAIL}`,
  ctaActions: [{ label: 'Contact us', href: '/company/contact', variant: 'ghost' }],
}
