/**
 * What the two applications actually carry.
 *
 * Everything in this file is taken from the running products rather than
 * written for the website: the EMIL Control Cockpit, and the EMIL Trade
 * platform whose public surface lists its own capabilities module by module.
 * Where the app states a count — chart types, order types, indicators — the
 * count is the app's own.
 *
 * Two kinds of claim were deliberately left behind.
 *
 * The trader-facing sign-in of EMIL Trade advertises commercial broker terms:
 * spreads from zero pips, leverage to 1:1000, segregated client funds. Those
 * belong to a broker, and this site is the technology provider underneath one
 * — `brand.ts` says in as many words that Raptor does not provide brokerage
 * services, liquidity or custody. Repeating a broker's pricing here would
 * contradict the disclaimer at the bottom of every page.
 *
 * And nothing here promises an outcome or a delivery date. The apps talk about
 * going live in forty-eight hours; that is a sales commitment, not a property
 * of the software, so it is not the website's to make.
 */

export type SpecGroup = {
  /** Short label for the group. */
  label: string
  /** One line each. Counts are the product's own. */
  items: readonly string[]
}

/**
 * The trading terminal, as the platform describes its own surface.
 * `/platform/terminal`.
 */
export const TERMINAL_SPECS: readonly SpecGroup[] = [
  {
    label: 'Charting',
    items: [
      '15 chart types, from candles and bars to Renko, Kagi and point-and-figure',
      '155+ indicators, every one computed in the platform rather than fetched from a chart vendor',
      '50+ drawing tools and 30+ timeframes, saved per workspace',
      'Eight studies that exist only here, and five overlays drawn from the intelligence layer',
    ],
  },
  {
    label: 'Order entry',
    items: [
      '23 order types, including the stop and OCO families and close-by',
      'Netting and hedging accounts, chosen per account rather than per platform',
      'Position size derived from the account balance and the live risk limit',
      'Every ticket validated in the browser and again on the server before it routes',
    ],
  },
  {
    label: 'Scripting',
    items: [
      'Strategies and indicators written in TypeScript, not a bespoke dialect',
      'Each script runs in its own sandboxed isolate, so a bad loop cannot take the terminal with it',
      'Backtest and parameter optimisation against the same price data the chart draws',
      'Deploy the same script to paper, demo or live without editing it',
    ],
  },
  {
    label: 'Alerts and journal',
    items: [
      'Alerts on price, indicators, patterns, the economic calendar, positions and news sentiment',
      'Every fill journalled automatically with session, hold time, adverse excursion and outcome',
      'Equity curve, Sharpe, Sortino and Calmar, a monthly heatmap and trade distribution',
      'Notes and screenshots attach to the trade, not to a separate document',
    ],
  },
]

/**
 * The intelligence layer's own cockpit — the application EMIL runs in.
 * `/platform/emil`.
 */
export const COCKPIT_SPECS: readonly SpecGroup[] = [
  {
    label: 'The council',
    items: [
      'Forty specialist agents, each with one job, coordinated as a desk rather than a single model',
      'A decision is a position the council reaches, not an output one agent emits',
      'Observes what happened, reads what is happening, estimates what could happen next',
      'Acts only inside a mandate that was written and confirmed before the session',
    ],
  },
  {
    label: 'The guardian',
    items: [
      'An independent risk engine sits outside the council and can veto any decision',
      'The veto is absolute: there is no confidence score that overrides it',
      'An aggregate exposure cap the council cannot raise, and a hard drawdown guard',
      'Capital protection is the first rule, ahead of any view the council holds',
    ],
  },
  {
    label: 'Its own account of itself',
    items: [
      'Every decision carries the inputs it was made from and the agents that argued for it',
      'Refusals are explained in the same detail as actions, because both are decisions',
      'It adapts its own inputs from what the market is doing rather than on a retuning schedule',
      'Nothing it learns can move the boundaries it was given',
    ],
  },
]

/**
 * The five things the intelligence layer does inside the products, as the
 * platform lists them. `/intelligence` and `/platform/emil`.
 */
export const INTELLIGENCE_ROLES: readonly SpecGroup[] = [
  {
    label: 'At the ticket',
    items: [
      'Pre-trade read of the setup, with a stop and target drawn from the instrument, not a template',
      'The risk on this order stated against the risk already open',
      'Your own history at this level, which is usually the uncomfortable part',
    ],
  },
  {
    label: 'At the trader',
    items: [
      'Overtrading, revenge trading and position-size drift detected as patterns, not scolded as morals',
      'Early profit-taking and loss aversion measured against your own record',
      'A weekly account of how the week actually went',
    ],
  },
  {
    label: 'At the market',
    items: [
      'Sentiment across news and social sources, scored rather than summarised',
      'Pattern detection across the instruments you actually trade',
      'Regime classification, so a strategy can be told the weather changed',
    ],
  },
  {
    label: 'At the desk',
    items: [
      'Margin calls predicted before they are triggered',
      'Toxic flow and fraud signals surfaced to the broker, not buried in a report',
      'Churn risk and client lifetime value scored for the people who run the book',
    ],
  },
]

/**
 * Migration off MT5, which the platform treats as a pipeline rather than a
 * rewrite project. `/platform/trading-tools`.
 */
export const CONVERTER_STEPS: readonly SpecGroup[] = [
  {
    label: 'What it does',
    items: [
      'Reads the MQL5 source and builds a syntax tree rather than pattern-matching text',
      'Identifies the trading constructs — entries, exits, money management, indicator reads',
      'Emits TypeScript that runs natively, and Pine for anyone who still charts elsewhere',
      'Backtests the conversion against the original and reports where the signals diverge',
      'Deploys to paper, demo or live, and can be listed for other traders if you choose',
    ],
  },
  {
    label: 'Why it matters',
    items: [
      'An expert advisor is usually years of a trader’s own work; asking them to abandon it is asking them not to move',
      'Signal parity is reported, not assumed — a conversion that does not match is a conversion you can reject',
      'The bridges to MT5 and cTrader stay available, but they are migration paths rather than dependencies',
    ],
  },
]

/**
 * The broker's side of the platform. `/brokers/platform`.
 */
export const BROKER_DESK_SPECS: readonly SpecGroup[] = [
  {
    label: 'Risk and dealing',
    items: [
      'A- and B-book routing decided per client, per instrument, per session',
      'Exposure monitored across the book with a hedging desk against it',
      'Position monitor, order flow and a spread constructor in one workstation',
      'Margin controls that act in the order path rather than in a nightly report',
    ],
  },
  {
    label: 'Clients and partners',
    items: [
      'Client profiles that carry the trading record, not just the contact details',
      'Pipeline and communication history against the same record',
      'Multi-tier introducing brokers with their own portal and tracking links',
      'Commission structures to unlimited depth, calculated from the same fills the trader sees',
    ],
  },
  {
    label: 'Liquidity and money',
    items: [
      'FIX 4.4 and 5.0 to the venues you have contracted with',
      'Smart routing and aggregation across them, with per-provider performance measured',
      'Payment connectors for cards, wires, e-wallets and crypto',
      'Revenue reporting that reconciles to the fills rather than to a summary',
    ],
  },
  {
    label: 'Compliance',
    items: [
      'KYC and AML in the onboarding path, not alongside it',
      'Transaction monitoring with case management and regulatory filing',
      'Every administrative action recorded against the person who took it',
      'Reports produced from the record rather than assembled for the regulator',
    ],
  },
]

/**
 * Trader protections. The platform carries these as a framework rather than as
 * a page of links, which is the part worth saying. `/brokers/client-portal`.
 */
export const RESPONSIBLE_SPECS: readonly SpecGroup[] = [
  {
    label: 'Limits the client sets',
    items: [
      'Deposit limits, set by the client and enforced by the platform',
      'Daily and weekly loss limits, and limits on session length',
      'Reality checks that interrupt rather than notify',
    ],
  },
  {
    label: 'Limits that hold',
    items: [
      'Cooling-off periods that cannot be shortened once started',
      'Self-exclusion that takes effect immediately, not at the end of the day',
      'Signposting to independent support organisations, in the product rather than the footer',
    ],
  },
]

/**
 * How it is built. `/technology/architecture` and `/technology/security`.
 */
export const STACK_SPECS: readonly SpecGroup[] = [
  {
    label: 'Presentation',
    items: [
      'A browser application, so there is nothing for a trader to install or update',
      'Charts drawn from the platform’s own indicator engine',
    ],
  },
  {
    label: 'Core engine',
    items: [
      'Order management, position keeping, matching and price aggregation as separate services',
      'Built rather than licensed, which is why the order types are not a vendor’s list',
    ],
  },
  {
    label: 'Data',
    items: [
      'Relational store with row-level security, so isolation is enforced where the data lives',
      'A time-series store for ticks and candles, a cache for hot state, and a search index for the record',
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      'Container orchestration across more than one region',
      'A global edge in front of it, and the same deployment for every tenant',
    ],
  },
]

export const SECURITY_SPECS: readonly SpecGroup[] = [
  {
    label: 'Data at rest and in flight',
    items: [
      'AES-256 at rest, TLS 1.3 in transit',
      'Row-level security in the database, so a tenant boundary is not an application concern',
      'Secrets held outside the application image',
    ],
  },
  {
    label: 'The record',
    items: [
      'An append-only audit log: entries are added, never edited',
      'Seven-year retention, which is the horizon a regulator asks about',
      'Administrative actions recorded with the person, the time and the before-and-after',
    ],
  },
]
