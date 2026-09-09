import { EMIL_EXPANSION, EMIL_SHORT } from '@/lib/brand'
import type { PageCopy } from './types'

const INTEL_CTA = [
  { label: `Open ${EMIL_SHORT} Lab`, href: '/intelligence/emil-lab', variant: 'primary' as const },
  { label: 'Request a demo', href: '/request-demo', variant: 'ghost' as const },
]

export const intelligenceHub: PageCopy = {
  title: 'Intelligence',
  description:
    'Market intelligence, risk intelligence, research and the EMIL Lab — understanding what is moving the market.',
  eyebrow: 'Intelligence',
  heading: "Don't just trade the market.",
  lead: 'Price tells you what happened. Context tells you what is happening. The intelligence layer exists to close that gap without pretending to predict the future.',
  answers: {
    what: `Market and risk intelligence surfaces, published research, and ${EMIL_SHORT} — the ${EMIL_EXPANSION.toLowerCase()}.`,
    who: 'Traders and desks who want to understand conditions rather than receive instructions.',
    why: 'A signal without context is a coin flip with extra steps. Conditions, exposure and relationships are the information that changes decisions.',
    connects: 'Intelligence reads the same market and account data the terminal shows, so what you see explained is what you are trading.',
    next: `Read a condition assessment, then arm ${EMIL_SHORT} against simulated data in the Lab.`,
  },
  modules: [
    { title: 'Market intelligence', body: 'Conditions, cross-asset context and session behaviour, described rather than predicted.' },
    { title: 'Risk intelligence', body: 'Exposure, concentration and correlation risk surfaced before it becomes a loss.' },
    { title: EMIL_SHORT, body: 'The intelligence layer inside the platform, bounded by an explicit mandate.' },
    { title: `${EMIL_SHORT} Lab`, body: 'Configure, arm, observe and disarm against simulated data.' },
    { title: 'Research', body: 'Method notes on market structure, correlation and execution.' },
    { title: 'Plain language', body: 'Every reading is stated in words a risk committee can read.' },
  ],
  ctaHeading: 'Understand what is moving it',
  ctaBody: 'The Lab is the fastest way to see how the intelligence layer reasons, and where its boundaries are.',
  ctaActions: INTEL_CTA,
  showRiskLine: true,
}

export const marketIntelligence: PageCopy = {
  title: 'Market Intelligence',
  description: 'Cross-asset context, condition assessment and session behaviour — description, not prediction.',
  eyebrow: 'Intelligence · Market',
  heading: 'One market moves. Another market answers.',
  lead: 'Currencies, metals, indices, energy and crypto are not separate stories. Market intelligence describes the relationships between them as they currently behave, and says clearly when a relationship has stopped holding.',
  answers: {
    what: 'Condition assessment per instrument, cross-asset relationship views, session behaviour and a daily written brief.',
    who: 'Multi-asset traders and desks whose risk spans more than one asset class.',
    why: 'Positions that look diversified by instrument are often one position by exposure.',
    connects: 'Readings are computed from the same market data the terminal charts, and reference the instruments you actually hold.',
    next: 'Ask for a sample brief covering your instruments and sessions.',
  },
  modules: [
    { title: 'Condition assessment', body: 'Trending, ranging, expanding or contracting — stated per instrument and per timeframe.' },
    { title: 'Cross-asset relationships', body: 'Correlation and relative strength, with an explicit note that correlation is not causation.' },
    { title: 'Session behaviour', body: 'How an instrument typically behaves in Asia, London and New York, and how today differs.' },
    { title: 'Written brief', body: 'A readable summary of conditions, upcoming events and open questions.' },
    { title: 'Watchlist context', body: 'Readings scoped to the instruments you follow rather than a generic universe.' },
    { title: 'Stated limits', body: 'Where a reading is weak or a relationship has broken down, it says so.' },
  ],
  ctaHeading: 'Read it against your own book',
  ctaBody: 'A sample brief for your instruments is more useful than a description of the methodology.',
  ctaActions: INTEL_CTA,
  showRiskLine: true,
}

export const riskIntelligence: PageCopy = {
  title: 'Risk Intelligence',
  description: 'Exposure, concentration and correlation risk surfaced before it becomes a loss.',
  eyebrow: 'Intelligence · Risk',
  heading: 'Exposure you can see before it hurts.',
  lead: 'Most damaging positions were not obviously large. They were correlated, concentrated, or held into a session that behaves differently. Risk intelligence looks for those shapes.',
  answers: {
    what: 'Analysis of the position book: aggregate and per-asset-class exposure, concentration, correlation clustering, drawdown context and margin headroom.',
    who: 'Traders managing their own book and risk managers overseeing several.',
    why: 'A limit tells you when you have gone too far. Risk intelligence tells you the shape of the risk you are already carrying.',
    connects: 'It reads the live position book and the configured limits, so its view and the risk engine agree.',
    next: 'Look at the risk views in the sandbox with a simulated book that has real shape to it.',
  },
  modules: [
    { title: 'Exposure breakdown', body: 'Aggregate, per asset class, per instrument, in lots and notional.' },
    { title: 'Concentration', body: 'Where the book is actually concentrated once correlated instruments are grouped.' },
    { title: 'Correlation clustering', body: 'Positions that behave as one position, identified as such.' },
    { title: 'Drawdown context', body: 'Current drawdown from the high-water mark against the configured guard.' },
    { title: 'Margin headroom', body: 'Utilisation and remaining capacity under current and stressed conditions.' },
    { title: 'Scenario views', body: 'Illustrative what-if moves across the book, clearly labelled as illustrative.' },
  ],
  ctaHeading: 'See the shape of the book',
  ctaBody: 'The risk views are the part of the sandbox most people spend longest on.',
  ctaActions: [
    { label: 'Open the sandbox', href: '/experience', variant: 'primary' },
    { label: 'Risk engine', href: '/platform/risk', variant: 'ghost' },
  ],
  showRiskLine: true,
}

export const research: PageCopy = {
  title: 'Research',
  description: 'Method notes on market structure, correlation, execution quality and risk measurement.',
  eyebrow: 'Intelligence · Research',
  heading: 'How we think about markets.',
  lead: 'Research here is method, not market calls. How correlation is measured, why session matters, what execution quality actually means, and where each approach stops working.',
  answers: {
    what: 'Written notes on the methods behind the intelligence layer, and on market structure generally.',
    who: 'Traders, risk managers and engineers who want to understand the reasoning rather than accept an output.',
    why: 'A method you cannot inspect is a method you cannot rely on.',
    connects: 'Where a note describes a method used in the platform, it says which surface uses it.',
    next: 'Read the notes, then challenge them. Corrections are welcome.',
  },
  modules: [],
  ctaHeading: 'Disagree with us',
  ctaBody: 'If a method note is wrong, we would rather hear it from you than publish it for another year.',
  ctaActions: [
    { label: 'Contact us', href: '/company/contact', variant: 'primary' },
    { label: 'Market intelligence', href: '/intelligence/market', variant: 'ghost' },
  ],
}

export const emilLab: PageCopy = {
  title: `${EMIL_SHORT} Lab`,
  description: `Configure a mandate, arm ${EMIL_SHORT} with a typed confirmation, watch it work inside those limits, and disarm at any time.`,
  eyebrow: `Intelligence · ${EMIL_SHORT} Lab`,
  heading: 'Arm it yourself.',
  lead: `This is the real ${EMIL_SHORT} control surface running on simulated data. Set the permissions and the limits, confirm deliberately, watch the log, and disarm whenever you want. Disarming is instant and needs no confirmation.`,
  answers: {
    what: `An interactive control panel for ${EMIL_SHORT}: analysis permissions, market selection, risk limits, maximum exposure, automation level and trading permissions.`,
    who: 'Anyone evaluating whether automation with hard boundaries is something they would be willing to authorise.',
    why: 'Reading about a permissions model is not the same as being made to type a confirmation before anything is allowed to act.',
    connects: 'In the sandbox the same panel is wired to the simulated position book, and every action passes the risk engine.',
    next: 'Arm it, breach a limit deliberately, read the refusal, and disarm.',
  },
  modules: [],
  ctaHeading: 'Then see it against a real configuration',
  ctaBody: 'A demo configures the mandate against your own risk policy, which is the only version of this conversation that matters.',
  ctaActions: [
    { label: 'Request a demo', href: '/request-demo', variant: 'primary' },
    { label: `How ${EMIL_SHORT} works`, href: '/platform/emil', variant: 'ghost' },
  ],
  showRiskLine: true,
}
