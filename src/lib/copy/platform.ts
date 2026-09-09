import { EMIL_EXPANSION, EMIL_SHORT } from '@/lib/brand'
import { DEFAULT_CTA_ACTIONS, type PageCopy } from './types'

export const platformHub: PageCopy = {
  title: 'Platform',
  description:
    'The Raptor platform: terminal, markets, trading tools, risk engine and the intelligence layer that runs underneath them.',
  eyebrow: 'Platform',
  heading: 'One surface. Every decision.',
  lead: 'A trader should not have to leave the chart to understand exposure, or leave the terminal to understand why a market is moving. Raptor puts analysis, execution, risk and intelligence in one place, sharing one state.',
  answers: {
    what: 'A multi-asset trading platform built as one application: charting and execution, market context, exposure and limits, and an intelligence layer that observes all of it.',
    who: 'Individual and professional traders, prop desks, and the brokers and institutions who put a platform in front of them.',
    why: 'Fragmented tooling costs decisions. When your position book lives in one system and your charts in another, exposure is something you discover after the fact rather than before the order.',
    connects: `The terminal reads the same instrument master, risk limits and account state as the CRM, client portal and back office. ${EMIL_SHORT} observes the whole surface rather than a single chart.`,
    next: 'Ask for a walkthrough against your own instrument set, session hours and risk policy.',
  },
  modules: [
    { title: 'Raptor Terminal', body: 'Charting, depth, order tickets, positions and journaling in one resizable workspace.' },
    { title: 'Global Markets', body: 'FX, indices, metals, energy, equities and crypto, with session awareness built into the data.' },
    { title: 'Trading Tools', body: 'Scanners, alerts, execution analytics and a trade journal that reads from real fills.' },
    { title: 'Raptor Risk Engine', body: 'Pre-trade checks, exposure limits, drawdown guards and visible kill switches.' },
    { title: EMIL_SHORT, body: `${EMIL_EXPANSION}. Observes, understands, adapts, protects, and acts only when authorised.` },
    { title: 'One state', body: 'Every module reads the same account, instrument and limit data. No reconciliation between screens.' },
  ],
  ctaHeading: 'See it with your own instruments',
  ctaBody:
    'A demo runs against your instrument set, your session hours and your risk policy, so the conversation is about your desk rather than a generic tour.',
  ctaActions: DEFAULT_CTA_ACTIONS,
}

export const terminal: PageCopy = {
  title: 'Raptor Terminal',
  description:
    'Charting, depth, execution, positions and journaling in one workspace that shares state with risk and intelligence.',
  eyebrow: 'Platform · Terminal',
  heading: 'Where analysis becomes execution.',
  lead: 'The distance between seeing a setup and acting on it is where most edge is lost. The terminal removes the gap: the chart you analysed, the ladder you priced and the ticket you sent are the same surface.',
  answers: {
    what: 'A browser-based trading terminal: multi-chart workspaces, indicators computed client-side, market depth, order tickets, live positions, trade history and journaling.',
    who: 'Active traders and professional desks who need speed without installing anything, and brokers who need to hand that to their clients under their own brand.',
    why: 'Latency is not only network time. It is also the seconds spent switching windows, re-deriving position size, and checking whether an order breaches a limit.',
    connects: 'Fills flow straight to the journal and execution analytics. The risk engine validates every ticket before it leaves the browser and again on the server.',
    next: 'A walkthrough of the order path: ticket, pre-trade checks, fill, position, journal entry — all from the same event.',
  },
  modules: [
    { title: 'Resizable workspaces', body: 'One to nine charts, saved per user, restored on login. Layouts follow the trader, not the device.' },
    { title: 'Client-side indicators', body: 'EMA, SMA, Bollinger, RSI, MACD and VWAP computed locally so redraws do not wait on a round trip.' },
    { title: 'Depth and ladder', body: 'Aggregated book with one-click pricing, and a ladder that shows where size actually sits.' },
    { title: 'Order tickets', body: 'Market, limit, stop and OCO, with position sizing derived from the account and the active risk limit.' },
    { title: 'Positions and P&L', body: 'Open exposure, floating and realised P&L, and margin utilisation on the same screen as the chart.' },
    { title: 'Journal and analytics', body: 'Every fill annotated automatically: session, instrument, hold time, adverse excursion, outcome.' },
  ],
  ctaHeading: 'Judge it on your own instruments',
  ctaBody:
    'We configure the terminal against your instruments and your risk limits, then place orders, breach a limit deliberately, and look at what the journal recorded.',
  ctaActions: DEFAULT_CTA_ACTIONS,
  showRiskLine: true,
}

export const emil: PageCopy = {
  title: EMIL_SHORT,
  description: `${EMIL_EXPANSION}. Not an EA. Not a bot. An intelligence layer that observes, understands, adapts, protects and acts only within an explicit mandate.`,
  eyebrow: `Platform · ${EMIL_SHORT}`,
  heading: 'Intelligence that lives inside the terminal.',
  lead: `${EMIL_SHORT} is the ${EMIL_EXPANSION.toLowerCase()}. It watches the same market and the same book you do, describes what it sees in plain language, and does nothing you have not authorised in writing.`,
  answers: {
    what: `An intelligence layer inside the platform. It observes market and account state, classifies conditions, re-ranks its own inputs as conditions change, enforces the boundaries you set, and acts only inside an explicit mandate.`,
    who: 'Traders who want context and controls rather than signals, and desks that need automation with an audit trail and a hard stop.',
    why: 'Markets change, strategies decay, relationships shift and risk moves. A fixed rule set is a snapshot of a market that has already gone.',
    connects: `${EMIL_SHORT} reads the terminal, the risk engine and the position book. Anything it proposes passes the same pre-trade checks as a human order — there is no privileged path to the market.`,
    next: `Open ${EMIL_SHORT} Lab, configure a mandate, arm it with a typed confirmation, watch it work inside those limits, and disarm it.`,
  },
  modules: [
    { title: 'Observe', body: 'Streaming market and account inputs: price, spread, volatility, session, exposure, correlation, funding state.' },
    { title: 'Understand', body: 'Condition classification — trending, ranging, expanding, contracting — stated as a reading, not a prediction.' },
    { title: 'Adapt', body: 'Input weighting is re-ranked as conditions change, so a stale relationship stops driving the reading.' },
    { title: 'Protect', body: 'Exposure boundaries, drawdown guards and concentration limits are enforced before anything reaches an order.' },
    { title: 'Act', body: 'Only inside a written mandate, only through the permissions gate, only while armed. Disarm is always one keystroke away.' },
    { title: 'Explain', body: 'Every intelligence event is logged in readable language, with the inputs that produced it.' },
  ],
  ctaHeading: `Arm it yourself in ${EMIL_SHORT} Lab`,
  ctaBody:
    'The Lab is the real control surface running on simulated data. Set the limits, type the confirmation, watch the log, and disarm whenever you want.',
  ctaActions: [
    { label: `Open ${EMIL_SHORT} Lab`, href: '/intelligence/emil-lab', variant: 'primary' },
    { label: 'Request a demo', href: '/request-demo', variant: 'ghost' },
  ],
  showRiskLine: true,
}

export const markets: PageCopy = {
  title: 'Global Markets',
  description: 'Multi-asset coverage with session awareness: FX, indices, metals, energy, equities and crypto.',
  eyebrow: 'Platform · Markets',
  heading: 'The session never really closes.',
  lead: 'Liquidity moves around the clock and around the world. Raptor treats the trading session as data, not decoration: instruments know when they are liquid, and the platform behaves accordingly.',
  answers: {
    what: 'A unified market layer across FX, indices, metals, energy, equities and crypto, with one instrument master, one symbology and one set of session definitions.',
    who: 'Multi-asset traders, and brokers who need to add or retire instruments without a release.',
    why: 'Cross-asset context is where most of the useful information sits. That only works if every asset class is described the same way.',
    connects: 'The instrument master feeds the terminal, the risk engine, the CRM and the API. Adding an instrument once makes it available everywhere.',
    next: 'Ask for the instrument list relevant to your desk and see how sessions, margin and tick sizes are configured.',
  },
  modules: [
    { title: 'One instrument master', body: 'Symbology, tick size, contract size, margin profile and session hours defined once.' },
    { title: 'Session awareness', body: 'Asia, London and New York behaviour is modelled per instrument, not assumed globally.' },
    { title: 'Cross-asset views', body: 'Correlation and relative-strength views across asset classes, with the caveat that correlation is not causation.' },
    { title: 'Instrument lifecycle', body: 'Add, suspend or retire instruments through configuration, with the change visible in every module.' },
    { title: 'Market data adapters', body: 'Feed handlers are pluggable; the platform does not assume a single data vendor.' },
    { title: 'Quality controls', body: 'Stale-tick detection, spread sanity checks and feed-health surfacing rather than silent bad prints.' },
  ],
  ctaHeading: 'Bring your own instrument set',
  ctaBody: 'Send us the instruments and sessions you care about and we will configure them for the walkthrough.',
  ctaActions: DEFAULT_CTA_ACTIONS,
}

export const tradingTools: PageCopy = {
  title: 'Trading Tools',
  description: 'Charting, scanners, alerts, journaling and execution analytics built into the terminal.',
  eyebrow: 'Platform · Trading Tools',
  heading: 'Tools that read from your fills.',
  lead: 'A scanner that does not know your positions, and a journal you have to fill in by hand, both decay within a week. Raptor tools read from the same event stream as your execution.',
  answers: {
    what: 'The analysis layer around execution: charting, instrument scanners, alerting, a trade journal populated from fills, and execution analytics.',
    who: 'Traders who review their own performance, and desk managers who need that review to be based on data rather than recollection.',
    why: 'Improvement needs measurement. Manual journals stop being accurate exactly when they matter — after a hard week.',
    connects: 'Alerts can target the terminal, email or a webhook. Journal entries are created by the fill, then annotated by the trader.',
    next: 'Look at the journal and analytics views with a representative set of trades behind them.',
  },
  modules: [
    { title: 'Charting', body: 'Multiple timeframes, drawing tools, saved templates, and indicators computed locally.' },
    { title: 'Scanners', body: 'Screen instruments on price, volatility, range and relative strength across asset classes.' },
    { title: 'Alerts', body: 'Price, indicator and exposure alerts delivered in-app, by email or to a webhook.' },
    { title: 'Trade journal', body: 'Created automatically from fills, with session, hold time and excursion attached.' },
    { title: 'Execution analytics', body: 'Slippage, fill quality and time-of-day performance measured from real fills.' },
    { title: 'Templates', body: 'Workspace, indicator and alert templates that can be pushed to a whole desk.' },
  ],
  ctaHeading: 'Measure the desk, not the anecdote',
  ctaBody: 'We will walk through the analytics views using a book that looks like yours.',
  ctaActions: DEFAULT_CTA_ACTIONS,
}

export const risk: PageCopy = {
  title: 'Raptor Risk Engine',
  description: 'Pre-trade checks, exposure limits, drawdown guards and visible kill switches.',
  eyebrow: 'Platform · Risk',
  heading: 'Before you chase return, know your exposure.',
  lead: 'Risk controls that live in a policy document are not controls. Raptor enforces limits in the order path, shows the trader why an order was refused, and keeps a kill switch where a human can reach it.',
  answers: {
    what: 'A risk engine in the order path: pre-trade validation, exposure and concentration limits, daily loss and drawdown guards, and operator kill switches.',
    who: 'Risk managers, desk heads and brokers who are accountable for what the platform is allowed to do.',
    why: 'The moment you need a limit is the moment nobody has time to enforce it manually.',
    connects: 'Every order — human or automated — passes the same checks. The engine is also what bounds the intelligence layer.',
    next: 'Bring a limit you actually enforce. We will configure it, breach it deliberately, and read the refusal together.',
  },
  modules: [
    { title: 'Pre-trade validation', body: 'Size, exposure, concentration and margin checked before an order is accepted.' },
    { title: 'Exposure limits', body: 'Per instrument, per asset class and aggregate, in lots or notional.' },
    { title: 'Loss and drawdown guards', body: 'Daily loss budgets and drawdown-from-high-water-mark limits, with defined actions on breach.' },
    { title: 'Kill switches', body: 'Close-all and halt-new-orders controls, scoped by account, desk or platform, with an audit record.' },
    { title: 'Refusal transparency', body: 'A refused order states which limit it breached and by how much. No silent rejections.' },
    { title: 'Audit trail', body: 'Every limit change, breach and override is recorded with actor, time and reason.' },
  ],
  ctaHeading: 'Bring your risk policy to the demo',
  ctaBody:
    'The most useful demo is the one where we configure your actual limits and then try to break them together.',
  ctaActions: DEFAULT_CTA_ACTIONS,
  showRiskLine: true,
}
