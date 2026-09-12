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
  {
    label: 'The workspace',
    items: [
      'Saved workspaces, so a layout is a thing you return to rather than rebuild',
      'Depth of market and a ladder beside the chart, not behind a tab',
      'Chart and order templates, and a scanner for the setup you are looking for',
      'One-click hedge, and an arming switch for automation that is always in reach',
    ],
  },
  {
    label: 'What it says about itself',
    items: [
      'Its own latency and bandwidth, on screen, next to the prices it is quoting',
      'The session clocks — Sydney, Tokyo, London, New York — and whether the market is quiet',
      'Positioning across the book as a percentage, rather than a sentiment adjective',
      'Open, pending, history, messages and logs as tabs on one desk',
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

/**
 * What can be traded, and when. `/platform/markets`.
 */
export const INSTRUMENT_SPECS: readonly SpecGroup[] = [
  {
    label: 'Coverage',
    items: [
      'Around five hundred instruments across six asset classes',
      'Foreign exchange, metals, indices, crypto, equities and commodities',
      'One watchlist, one ticket and one position view across all of them',
      'Favourites separated from the full list, because a trader watches eight things and owns two',
    ],
  },
  {
    label: 'Sessions',
    items: [
      'The four session clocks kept on screen, not in a help page',
      'Instruments carry their own trading hours rather than a single market calendar',
      'The economic calendar sits in the toolbar, so an event is visible before it moves the price',
    ],
  },
]

/**
 * Risk, as the platform enforces it rather than reports it. `/platform/risk`.
 */
export const RISK_SPECS: readonly SpecGroup[] = [
  {
    label: 'In the order path',
    items: [
      'Every ticket checked before it routes, and refused with a reason rather than silently',
      'Exposure aggregated across the account, not per position',
      'Margin controls that act at the moment of the order',
      'A drawdown guard that acts on the account, above whatever a strategy believes',
    ],
  },
  {
    label: 'Across the book',
    items: [
      'A- and B-book routing decided per client, per instrument, per session',
      'Exposure monitored across the whole book with a hedging desk against it',
      'Margin calls predicted before they trigger rather than reported after',
      'Flow that behaves oddly surfaced as it happens',
    ],
  },
]

/**
 * The ecosystem around the terminal. `/platform/trading-tools`.
 */
export const ECOSYSTEM_SPECS: readonly SpecGroup[] = [
  {
    label: 'Build',
    items: [
      'A scripting environment in the terminal rather than a separate application',
      'Backtest and parameter optimisation against the platform’s own price history',
      'Strategies and robots managed from a panel beside the chart',
      'Templates for charts and for orders, so a setup is set up once',
    ],
  },
  {
    label: 'Buy and share',
    items: [
      'A marketplace for strategies, indicators, signal providers and plugins',
      'Free and paid listings, with the performance record attached to the listing',
      'A converted expert advisor can be listed, so migrating work can become work that pays',
    ],
  },
]

/**
 * The client record. `/brokers/crm`.
 */
export const CRM_SPECS: readonly SpecGroup[] = [
  {
    label: 'The record',
    items: [
      'One client profile carrying the trading record, the funding history and the conversations',
      'Pipeline stages against that record rather than in a separate sales tool',
      'Every communication logged where the account is, not in someone’s inbox',
      'Verification state visible on the profile, because it is the thing that blocks everything else',
    ],
  },
  {
    label: 'What it notices',
    items: [
      'Churn risk scored from behaviour rather than from the last email opened',
      'Client lifetime value estimated from the actual trading pattern',
      'Drafts prepared for the desk to send, edit or discard',
      'Cohorts compared, so a change in one month is visible against the others',
    ],
  },
]

/**
 * Liquidity plumbing. `/brokers/liquidity`.
 */
export const LIQUIDITY_SPECS: readonly SpecGroup[] = [
  {
    label: 'Connectivity',
    items: [
      'FIX 4.4 and 5.0 to the venues and providers you have contracted with',
      'Aggregation across them into one book',
      'Smart routing on rules you set rather than a vendor default',
      'Per-provider fill quality, rejection rate and latency measured continuously',
    ],
  },
  {
    label: 'Pricing',
    items: [
      'Spread construction and markup as a configuration, not a code change',
      'The price the client sees derived from the aggregate, with the rule visible',
      'Provider performance is reported to you; Raptor does not provide the liquidity itself',
    ],
  },
]

/**
 * Administration and money movement. `/brokers/back-office`.
 */
export const BACK_OFFICE_SPECS: readonly SpecGroup[] = [
  {
    label: 'Money',
    items: [
      'Deposits and withdrawals across cards, wires, e-wallets and crypto',
      'Forty-odd payment connectors, so a new market is a configuration rather than a project',
      'Internal transfers between a client’s own accounts',
      'Statements and tax summaries produced from the ledger rather than assembled by hand',
    ],
  },
  {
    label: 'Obligations',
    items: [
      'KYC and AML inside onboarding, where the client already is',
      'Transaction monitoring with case management and regulatory filing',
      'Reports generated from the record, with the record still available behind them',
      'Every administrative action attributed to a person, with what changed',
    ],
  },
]

/**
 * How a book grows: partners, copiers, allocators and funded traders.
 * `/brokers/ib-affiliates`.
 */
export const DISTRIBUTION_SPECS: readonly SpecGroup[] = [
  {
    label: 'Introducing brokers',
    items: [
      'Multi-tier structures to unlimited depth',
      'Commissions calculated from the same fills the trader sees',
      'A portal where a partner can check their own numbers without asking you',
      'Tracking links and attribution that survive the client changing device',
    ],
  },
  {
    label: 'Copy and allocate',
    items: [
      'Copy trading from verified providers, with allocation adjusted for risk rather than copied lot for lot',
      'PAMM and MAM for managers running money on behalf of investors',
      'Performance shown net, with the drawdown alongside the return',
    ],
  },
  {
    label: 'Funded accounts',
    items: [
      'Single-phase, two-phase and instant funding challenges',
      'Rules enforced by the platform rather than checked by a human afterwards',
      'Scaling plans and payout handling as part of the same engine',
    ],
  },
]

/**
 * What a broker can give a client beyond a terminal.
 * `/brokers/client-portal`.
 */
export const ENGAGEMENT_SPECS: readonly SpecGroup[] = [
  {
    label: 'Learning',
    items: [
      'Courses with progress, quizzes and a paper-trading account to practise in',
      'Experience earned from education as well as from trading',
      'A tutor that answers from the material rather than from the internet',
    ],
  },
  {
    label: 'Standing and community',
    items: [
      'Six tiers, badges and streaks, with the benefits at each tier set by the broker',
      'Weekly challenges and competitions run by the platform',
      'Leaderboards, shared trades and rooms, for the brokers who want a community',
      'Referral rewards tracked in the same ledger as everything else',
    ],
  },
  {
    label: 'The coach',
    items: [
      'Overtrading, revenge trading and FOMO identified as patterns in the client’s own record',
      'Loss aversion and early profit-taking measured rather than asserted',
      'A weekly account of how the week went, sent to the client',
      'Signposting to independent support, offered in the product',
    ],
  },
]

/**
 * What it connects to. `/technology/integrations`.
 */
export const INTEGRATION_SPECS: readonly SpecGroup[] = [
  {
    label: 'Market and money',
    items: [
      'Liquidity over FIX 4.4 and 5.0',
      'Payment service providers for cards, wires, e-wallets and crypto',
      'Market data, economic calendar and news sentiment sources',
    ],
  },
  {
    label: 'Coming from somewhere else',
    items: [
      'Bridges to MT5 and cTrader, so a migration can be staged rather than cut over',
      'Expert advisors converted rather than rewritten — see the migration pipeline',
      'Client records, balances and open positions moved with the account',
      'The bridges are a path in, not a dependency the platform keeps',
    ],
  },
]

/**
 * The Control Cockpit, surface by surface.
 *
 * Every line below is something the running cockpit does, taken from the
 * application rather than written for the site. Where the app states a count
 * or names its provider, that is the app's own; where it states a limitation
 * — delayed, cached, ETF proxy, upstream unavailable — that is quoted too,
 * because a research tool that hides its own staleness is the thing this one
 * is deliberately not.
 *
 * `/platform/emil`.
 */
export const COCKPIT_SURFACES: readonly SpecGroup[] = [
  {
    label: 'Research boards',
    items: [
      'Nine exchange clocks with each venue’s local session state, and a note saying holiday calendars are not yet applied',
      'Indices, metals and energy quoted together, with ETF proxies marked as proxies rather than passed off as the index',
      'FX shown as central-bank reference rates, labelled a daily fixing and not a tradable price',
      'Crypto straight from the venues: last, mark, funding, open interest and 24-hour volume per instrument',
      'Breadth per group — how much advanced, the average move, the best and worst name — over 24 hours or seven days',
    ],
  },
  {
    label: 'One symbol layer under everything',
    items: [
      'A canonical symbol per instrument, plus what each data provider and charting vendor calls it',
      'Any spelling resolves: EUR/USD, gold, SPX or nifty all land on the same instrument',
      'Each row states whether it carries a research feed, a tradable venue, or both',
      'Three counts kept honest and separate: instruments known, feeds live, and instruments actually tradable',
    ],
  },
  {
    label: 'Charting that admits what it is',
    items: [
      'Candles, line or area across nine timeframes, from one minute to monthly',
      'SMA, EMA, Bollinger bands and RSI computed inside the cockpit rather than taken from a vendor',
      'Compare mode against another symbol, and your own price levels saved per instrument',
      'The footer states the bar count, the provider, the fetch time, and whether the data is stale',
    ],
  },
  {
    label: 'Fundamentals with the concept named',
    items: [
      'Filings pulled from SEC EDGAR directly — official, keyless, and cited on every figure',
      'Eight fiscal quarters of revenue and net income, with trailing margins and diluted earnings',
      'Balance sheet, cash, long-term debt and share count, each with the date it was reported',
      'The XBRL concept used for revenue is printed under the table, and restatements replace earlier values',
      'A screener across the same universe whose rows say what is missing rather than guessing',
    ],
  },
  {
    label: 'Context, and alerts that only watch',
    items: [
      'Headlines from open news indexes, with a fallback index when the primary one is unavailable',
      'Each headline tagged with impact, risk-on or risk-off stance, and the instruments it touches',
      'One line under each headline on why it matters, or plainly that it does not',
      'Price alerts carry a condition, a threshold and a note on why the level matters',
      'Alerts are research signals: they never place, modify or cancel anything',
    ],
  },
  {
    label: 'The book, and what would happen to it',
    items: [
      'Every linked account consolidated into one exposure map — gross, net, gross-to-equity, top-symbol concentration',
      'An account that is not answering says so on its own row: a stale bridge, or an API key that is not whitelisted',
      'Six macro factors on sliders — dollar, equities, crypto, gold, crude, ten-year yield — with presets for the obvious shocks',
      'Linear profit and loss per position under the shock, then proxy hedges sized against the net factor exposure',
      'Nothing in the simulator is sent anywhere: it is a calculated view, and it says so',
    ],
  },
]

/**
 * Where the numbers come from, and what they are not.
 *
 * The cockpit separates research data from execution data everywhere, and
 * states the separation on the surface rather than in a policy document. This
 * group exists because that discipline is the product's most unusual property
 * and the easiest one to miss.
 */
export const PROVENANCE_SPECS: readonly SpecGroup[] = [
  {
    label: 'Every board names its source',
    items: [
      'The provider, the freshness and the fetch time are printed on the board itself',
      'Delayed, daily fixing and live from the venue are three different labels, used precisely',
      'Where a free data plan forces an ETF proxy instead of the index, the row says proxy',
      'When an upstream feed is unavailable the board says stale rather than showing the last value as current',
    ],
  },
  {
    label: 'Research data, never execution data',
    items: [
      'The research feed and the execution path are separate systems, stated as such on every research page',
      'A quote used for analysis is never presented as a price you could have traded',
      'Model output is labelled a model assessment, with the model named, and marked research rather than advice',
      'The morning brief prints its own inputs: board rows, watchlist quotes, calendar events and headline count',
    ],
  },
  {
    label: 'What it declines to say',
    items: [
      'A brief with no calendar events says surprises may come from headlines instead of inventing a schedule',
      'A screener row with no filing scanned stays empty rather than being estimated',
      'A trade card with no survival simulation recorded says so, rather than omitting the field',
      'A backtest with too few out-of-sample folds is labelled insufficient to judge, not promising',
    ],
  },
]

/**
 * How an order is reached, and how much of the path is paper.
 *
 * Both execution routes, the sandbox desks in front of them, and the
 * protections the router applies to a single ticket. The honest-status line
 * about the native terminal running on a simulated feed is the app's own
 * wording, and it stays.
 */
export const EXECUTION_ROUTE_SPECS: readonly SpecGroup[] = [
  {
    label: 'Two ways to reach a market',
    items: [
      'Connect a brokerage or exchange account you already have, through the API hub',
      'Or use the native terminal, which needs no external broker account',
      'Credentials stay server-side and isolated to the account that added them',
      'Every selected market runs the same risk pipeline: the guardian, the exposure ceiling and monetary-risk validation apply unchanged',
    ],
  },
  {
    label: 'Markets, and what is honestly not ready',
    items: [
      'Forex, metals, global indices, energies and crypto run live on the native terminal',
      'Global equities, country stock markets, ETFs, futures, options and fixed income are listed as coming, not as available',
      'India is its own hub: equities, index derivatives and commodities, with holiday-aware sessions',
      'Equity markets whose structure is ready but whose data feed is not say data coming soon on the tile',
      'The native terminal states that it runs on a simulated feed while the liquidity integration is finished, and to treat it as paper',
    ],
  },
  {
    label: 'A ticket states its own protections',
    items: [
      'A quote older than ten seconds, or latency past three seconds, refuses the order',
      'Spread and limit bounds checked before send; duplicates inside a five-second window rejected',
      'A daily order cap, a slippage alert threshold, and a per-order monetary cap on live routes',
      'Live orders are refused outright while a circuit breaker is tripped, or while the intelligence layer is disarmed',
    ],
  },
  {
    label: 'The council proposes; a human confirms',
    items: [
      'The agent desk convenes the council on one instrument and sizes the result deterministically',
      'Gates before anything is offered: agreement, consensus and confidence floors, no high-impact event within thirty minutes, spread inside the router limit, no same-side position',
      'Caps on size, on share of venue equity, and on agent executions per day; a proposal expires after fifteen minutes',
      'Sandbox and testnet venues only — live venues are refused in code, not by configuration',
      'Autopilot proposes and does not execute, and the screen lists every condition still standing in its way',
    ],
  },
]

/**
 * What it publishes about its own performance.
 *
 * The backtest engine's own verdict language is the reason this group exists:
 * it grades a positive result as weak, names the buy-and-hold it failed to
 * beat, and calls its own walk-forward insufficient. That is unusual enough to
 * be worth stating plainly.
 */
export const EVIDENCE_SPECS: readonly SpecGroup[] = [
  {
    label: 'Backtests that argue with themselves',
    items: [
      'Real public history, with the venue, instrument, timeframe, bar count, date range and fetch time printed',
      'Fees and slippage in basis points per side are inputs, not omissions',
      'Walk-forward across re-tuned folds plus a Monte Carlo path set, both optional and both reported',
      'Return is shown next to buy-and-hold for the same period, including when buy-and-hold won',
      'The verdict is a sentence, not a score: a thin result is called thin and a short fold count is called insufficient',
    ],
  },
  {
    label: 'The measures it reports',
    items: [
      'Trades, long and short split, win rate, profit factor and expectancy per trade after costs',
      'Maximum drawdown, a Sharpe-like figure with Sortino beside it, exposure and average hold',
      'An equity curve against the flat line, so a single winning stretch cannot hide behind a total',
    ],
  },
  {
    label: 'Options, for reading volatility',
    items: [
      'Listed contracts from the venue, with the count and the fetch time',
      'At-the-money implied volatility by expiry as a term structure, from hours out to the following year',
      'Put and call open interest, max pain, and ninety-to-one-ten skew as put minus call implied volatility',
      'The chain itself: bid, ask, mark, implied volatility and open interest either side of each strike',
    ],
  },
]

/**
 * Risk, as the cockpit enforces it rather than as a policy page describes it.
 *
 * The Risk Management surface is the clearest statement of the product's
 * position: sizing starts from the stop and is cut to a ceiling it announces,
 * and nine named breakers each show their current value, their limit and what
 * they do when they trip. The trip history is kept, and a tripped breaker
 * stops automation without touching a single open position.
 *
 * The exposure figures are three different things and the app is consistent
 * about them: five per cent of equity is an absolute risk ceiling, 0.10 lots
 * is the aggregate exposure in the Conservative Default profile, and 0.05 lots
 * is the line above which raising that aggregate needs the full override
 * workflow. None is quoted here, because all three are settings.
 */
export const RISK_CONTROL_SPECS: readonly SpecGroup[] = [
  {
    label: 'Sizing starts at the stop',
    items: [
      'The stop distance and the risk share are the inputs; the lot is the output, never the other way round',
      'It shows the monetary risk permitted, the pip value, the raw calculated lot and the risk at the minimum lot',
      'Where the calculation exceeds the aggregate ceiling the size is cut, and the panel says it was cut and by what',
      'Risk is never a target: the percentage is an absolute ceiling, and raising the aggregate past its threshold needs a separate override workflow',
    ],
  },
  {
    label: 'Nine breakers, each with a stated action',
    items: [
      'Daily and weekly loss budgets, measured on realised plus floating loss',
      'Drawdown from the account high-water mark, not from the session open',
      'Margin utilisation, open-position count and consecutive losses',
      'A high-impact news window either side of a scheduled event',
      'Broker connection latency, and the health of the market-data feed itself',
    ],
  },
  {
    label: 'What tripping actually does',
    items: [
      'Every breaker states its action in advance — most stop automation, one only raises an alert',
      'A trip stops automation and nothing else: open positions and broker-side stops are untouched',
      'The trip is written to a history with the event that caused it, and stays there',
      'Re-arming is not automatic; it goes back through activation with the acknowledgements again',
      'The panel says when it was last evaluated, whether enforcement is on, and whether automation is armed',
    ],
  },
  {
    label: 'Capital in layers',
    items: [
      'Protected capital carries a floor it is never risked below',
      'A profit floor locks banked gains, and unlocks only above the high-water mark',
      'Progress toward a doubling milestone, at which it proposes trading only with profits',
      'An equity curve with the drawdown laid over it, so a recovery cannot hide the hole it came out of',
      'Drawdown events are named and dated, including the one where a strategy was downgraded and suspended',
    ],
  },
]

/**
 * How a strategy earns the right to trade.
 *
 * Two surfaces make one argument. The Strategy Center versions every strategy,
 * scores its health, watches it for drift and makes a challenger beat the
 * champion across regimes in paper and restricted live — never on a backtest.
 * The Strategy Lab is the twelve-stage pipeline in front of that, and it
 * declares its own data mode: while no historical engine is connected, results
 * are labelled estimates and must be re-run on real data before they count.
 */
export const STRATEGY_LIFECYCLE_SPECS: readonly SpecGroup[] = [
  {
    label: 'Promotion has to be earned',
    items: [
      'Five stages in order: research, backtest, paper, restricted live, production',
      'A challenger replaces a champion only after outperforming across regimes in paper and restricted-live evaluation',
      'Never on backtest results alone, and never automatically',
      'Every strategy is versioned, health-scored out of a hundred, and watched for drift',
      'A degraded strategy is downgraded, its live sizing halved, then suspended from new entries',
    ],
  },
  {
    label: 'Twelve stages before a human looks',
    items: [
      'Learned idea, structured rules, data validation, backtest, out-of-sample, walk-forward',
      'Stress, regime analysis, risk analysis, a score, paper or forward test, then human review',
      'A backtest is stated to be no proof of future profitability, in the surface itself',
      'No strategy gains live permission automatically, at any score',
    ],
  },
  {
    label: 'It will not fill in a gap',
    items: [
      'A generated candidate is assembled only from components it has already validated — entries from one, a regime filter from another, a risk model from a third',
      'Every candidate is traceable back to the knowledge it came from, rather than invented',
      'A candidate missing a rule is marked incomplete and names the missing rule, and it will not guess the value',
      'While no historical data engine is connected, runs are labelled estimates — conservative, cost-aware and penalised for overfitting',
      'When one is connected, every surviving strategy re-runs the whole pipeline on real data before its results count',
    ],
  },
]

/**
 * What it does about its own judgement.
 *
 * Three surfaces that would not exist in a product optimised for looking
 * confident: a journal that grades the process and refuses to grade an
 * incomplete one, an ingestion path that stores everything it reads as an
 * untested hypothesis, and a trust score that can veto a setup the system
 * itself rates highly.
 */
export const LEARNING_SPECS: readonly SpecGroup[] = [
  {
    label: 'A journal that grades the process',
    items: [
      'Fills arrive from the paper desk and the agent pipeline on their own; manual entries are possible too',
      'Each entry carries setup, tags, mistakes, exit, profit and loss, and notes on what you saw and how you felt',
      'The review grades the process rather than the outcome, and says so under every grade',
      'An entry too incomplete to assess is graded as such, told exactly which fields were missing, and flagged',
      'Reporting no mistakes on a materially incomplete entry is itself called out as a process error',
    ],
  },
  {
    label: 'Reading is not knowing',
    items: [
      'Articles, research pages, central-bank publications and video captions, ingested by URL or uploaded as files',
      'Only publicly available material is fetched: no paywall, login or platform restriction is bypassed',
      'Every statement is classified — fact, opinion, prediction, trading rule or performance claim',
      'Each is attributed to its exact source and location, and checked for contradictions against existing knowledge',
      'It is then stored as an untested hypothesis until independently validated in the lab',
    ],
  },
  {
    label: 'Confidence is not trust',
    items: [
      'Confidence in a setup and trust in the environment are two separate scores, deliberately',
      'High confidence can never override low trust: it reduces risk, asks for confirmation, or stands down',
      'When it stands down it says which of the two numbers was responsible',
      'A novelty detector raises a penalty when behaviour matches no learned regime, and trust falls automatically',
      'On extreme novelty it enters capital-protection behaviour regardless of how good any single setup looks',
    ],
  },
]

/**
 * The operating surfaces around the trading ones.
 *
 * Scheduling, your own platform, the API, and who in a firm is allowed to do
 * what. These are the parts an evaluator asks about on the second call rather
 * than the first, and the cockpit has answers on the surface.
 */
export const COCKPIT_OPERATIONS: readonly SpecGroup[] = [
  {
    label: 'What is scheduled, and what is not',
    items: [
      'Ten central banks with their current policy rate, the series it came from and the date of the observation',
      'A bank with no decision in the two-week window shows no rate rather than a guess',
      'Speakers and statements listed with their own impact rating, not folded into the rate',
      'An economic calendar for this week and next, filterable by impact and currency, stamped with its fetch time',
    ],
  },
  {
    label: 'Bring the platform you already trade on',
    items: [
      'A read-only bridge mirrors a MetaTrader account: balance, positions and deals appear in the cockpit',
      'Alerts from charting platforms or any other system arrive on a private webhook',
      'Statements import into the journal from common broker exports, and re-importing the same file adds nothing twice',
      'It never sends an order back to your terminal — when floating drawdown crosses your limit it warns you instead',
      'Platforms without a native sync are named as such, with the webhook or statement path offered instead',
    ],
  },
  {
    label: 'An API with scopes, and your own data',
    items: [
      'Keys are scoped — read, market data, news, calendar, research, alerts, journal, portfolio, paper trade, webhooks, ingest, stream',
      'A sandbox key cannot link a broker at all; keys take an optional IP allow-list and an expiry, and are shown once',
      'Research data through the API is delayed and never an execution trigger, and the API reaches paper venues only',
      'An OpenAPI document, a Postman collection and two SDKs, with quickstarts in three languages',
      'Your own pushed rows stay isolated to your account and are never mixed with the research feeds',
    ],
  },
  {
    label: 'Running it as a desk',
    items: [
      'Organisations for advisories, trading firms, institutions and platforms, with roles and client books',
      'A recommendation workflow with approvals, desk controls, and a tamper-evident archive',
      'Permission grants are individual switches — emergency close, defensive hedges, learning updates, live promotion',
      'Every permission change is consent-logged and auditable, and the risk profile is edited in one place',
      'Export everything as one file; deletion purges credentials and keys and keeps invoices under an anonymised identifier',
    ],
  },
]
