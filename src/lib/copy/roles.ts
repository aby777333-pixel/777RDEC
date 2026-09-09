import { CONTACT_EMAIL } from '@/lib/brand'

/**
 * Open roles.
 *
 * TODO_CONFIRM: these are written from the shape of the codebase and the work
 * it implies, not from a confirmed hiring plan. Delete any that are not
 * actually open before launch — advertising a role that does not exist wastes
 * a candidate's time.
 */
export type Role = {
  slug: string
  title: string
  team: string
  location: string
  type: string
  tint: number
  summary: string
  doing: readonly string[]
  looking: readonly string[]
}

export const APPLY_TO = CONTACT_EMAIL

export const ROLES: readonly Role[] = [
  {
    slug: 'senior-frontend-engineer',
    title: 'Senior Frontend Engineer',
    team: 'Platform',
    location: 'Ruislip, UK · or remote',
    type: 'Full time',
    tint: 0,
    summary:
      'The trading surface. Real-time data, dense interfaces, and the requirement that none of it stutters while a market is moving.',
    doing: [
      'Build and own parts of the terminal: charting workspaces, order tickets, position and risk panels.',
      'Keep interfaces responsive under a live tick stream — worker offloading, render budgets, measuring rather than guessing.',
      'Work in TypeScript strict with a design-token system, in both light and dark, at every breakpoint.',
      'Care about the details traders notice: tabular numerals that do not jitter, refusals that explain themselves.',
    ],
    looking: [
      'Strong React and TypeScript, and opinions about state management you can defend.',
      'Experience with real-time or data-dense interfaces — trading, monitoring, analytics, anything where the data does not sit still.',
      'Comfort with performance work as measurement rather than folklore.',
      'Financial markets experience is welcome but genuinely not required.',
    ],
  },
  {
    slug: 'execution-engineer',
    title: 'Execution & Risk Engineer',
    team: 'Execution',
    location: 'Ruislip, UK · or remote',
    type: 'Full time',
    tint: 4,
    summary:
      'The order path. Pre-trade validation, position keeping, and the limits that have to hold at the exact moment nobody has time to check them.',
    doing: [
      'Own order management and the risk engine that validates every order, human or automated.',
      'Implement exposure, concentration, drawdown and loss controls, and the audit trail behind them.',
      'Make refusals informative: which check, what value, which ceiling.',
      'Write the tests that matter when correctness is the requirement rather than a goal.',
    ],
    looking: [
      'Backend engineering where correctness has a cost attached — payments, exchanges, ledgers, clearing.',
      'Comfort reasoning about concurrency, idempotency and partial failure.',
      'Someone who finds "what happens if this fails halfway" the interesting part.',
    ],
  },
  {
    slug: 'market-connectivity-engineer',
    title: 'Market Connectivity Engineer',
    team: 'Connectivity',
    location: 'Ruislip, UK · or remote',
    type: 'Full time',
    tint: 5,
    summary:
      'Feed handlers and provider sessions — including everything that happens when they degrade rather than fail cleanly.',
    doing: [
      'Build and operate FIX and API sessions to liquidity providers and market data vendors.',
      'Handle the ugly cases: stale ticks, crossed books, session drops, silent degradation.',
      'Measure execution quality per provider, per instrument, per session — separately, not as one score.',
      'Define failover behaviour so a degraded session is contained rather than becoming an outage.',
    ],
    looking: [
      'FIX protocol experience, or strong network and protocol fundamentals plus willingness to learn it properly.',
      'Operational instinct — you have been on call for something that mattered.',
      'Scepticism about vendor claims, and a habit of verifying them.',
    ],
  },
  {
    slug: 'intelligence-engineer',
    title: 'Intelligence Engineer',
    team: 'Intelligence',
    location: 'Ruislip, UK · or remote',
    type: 'Full time',
    tint: 2,
    summary:
      'The intelligence layer: applied analysis with explicit boundaries and outputs a risk committee can read.',
    doing: [
      'Work on condition classification, input scoring and the re-ranking that keeps readings current.',
      'Make every output explainable — the reading, the inputs behind it, and the confidence in plain language.',
      'Keep the boundary between what the layer concludes and what it is permitted to do absolutely clean.',
      'Say clearly when a signal is weak. That is the job, not a failure of it.',
    ],
    looking: [
      'Applied statistics or ML in production, with a healthy suspicion of your own backtests.',
      'Willingness to describe rather than predict, and to publish the limitations.',
      'Interest in market structure — how liquidity, sessions and correlation actually behave.',
    ],
  },
  {
    slug: 'platform-operations',
    title: 'Platform Operations Engineer',
    team: 'Operations',
    location: 'Ruislip, UK · hybrid',
    type: 'Full time',
    tint: 3,
    summary:
      'Running a platform through market hours. Most software can be retried; this cannot.',
    doing: [
      'Own monitoring, alerting and incident response across application, data and connectivity layers.',
      'Run deployments that avoid peak sessions, with rollback that has been rehearsed.',
      'Exercise the recovery plan rather than filing it.',
      'Write the post-incident reviews, honestly.',
    ],
    looking: [
      'Infrastructure-as-code, observability tooling, and container orchestration in production.',
      'Someone who has been woken up by a pager and improved the system afterwards.',
      'Calm under an incident, and precise in writing about it.',
    ],
  },
  {
    slug: 'client-solutions',
    title: 'Client Solutions Engineer',
    team: 'Client',
    location: 'Ruislip, UK · or remote',
    type: 'Full time',
    tint: 1,
    summary:
      'The technical face of the company. Configured demos, migrations, and the awkward integration questions.',
    doing: [
      'Configure demos against a prospect’s real instruments, sessions and risk policy.',
      'Lead technical evaluations and answer security due diligence accurately.',
      'Own migrations: clients, balances, history, and the parts nobody scoped.',
      'Feed what you hear back into the product rather than working around it.',
    ],
    looking: [
      'Enough engineering to be credible with engineers, enough clarity to be useful to a risk committee.',
      'Brokerage, trading platform or fintech integration experience.',
      'Willingness to say "that does not exist yet" to a prospect.',
    ],
  },
]
