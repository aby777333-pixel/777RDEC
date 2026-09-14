import { EMIL_SHORT, EMIL_TRADE } from '../brand'
import type { SpecGroup } from './app-capabilities'
import { DEFAULT_CTA_ACTIONS, type PageCopy } from './types'

/**
 * `/platform/emil-trade` — the multi-asset trading platform, feature by
 * feature.
 *
 * Three sources, in order of how much they can be trusted:
 *
 * 1. The EMIL Trade feature inventory, written from the running terminal
 *    (September 2026). Everything it lists above its own [VERIFY] line is
 *    visible in the product.
 * 2. EMIL Trade's public pages — home, trading terminal, risk management,
 *    changelog, developer portal, marketplace — which confirm several items
 *    that inventory had parked as unverified: copy trading, PAMM / MAM, prop
 *    challenges, the IB network, KYC / AML, payments, native mobile apps and
 *    the MQL5 converter.
 * 3. The product owner, directly: the NEXUS panel as captured in the
 *    terminal (its greeting, Active switch, alerts and one-tap actions),
 *    radio, live video rooms, screen sharing,
 *    live training modules, the AI EA and indicator builder, strategies
 *    attaching to the chart, and trading straight from a strategy.
 *
 * TODO_CONFIRM: items from source 3 sit behind the terminal's sign-in and
 * could not be seen from outside it. They are carried as given, on the same
 * standard as `modules.ts`. So are the third-party names — the broadcasters,
 * TradingView, MQL5 and Pine Script.
 *
 * Left out on purpose, as in `app-capabilities.ts`: the public site's broker
 * terms (spreads, leverage), its delivery promise (live in 48 hours), its
 * execution-speed and uptime figures, and the marketplace's win rates and
 * profit factors. The first two belong to a broker, not a technology
 * provider; the rest are performance claims this site does not make without
 * evidence behind them.
 */

export const emilTrade: PageCopy = {
  title: EMIL_TRADE,
  description: `${EMIL_TRADE}: a multi-asset trading platform with the NEXUS AI trade assistant, an AI advisor, trend detection and early warnings, automation you arm deliberately, strategy and EA building, live TV, radio, chat, video and training inside the terminal.`,
  eyebrow: `Platform · ${EMIL_TRADE}`,
  heading: 'Every market. One terminal. AI on your terms.',
  lead: `${EMIL_TRADE} is the multi-asset trading platform built on Raptor. Forex, metals, energies, indices and crypto in one terminal, with an AI advisor that reads the market beside you, spots the trend and warns you early — and trades on its own only once you have armed it, inside limits you set.`,
  heroActions: [
    { label: 'Request a demo', href: '/request-demo', variant: 'primary' },
    { label: 'See it running', href: '/platform/emil-trade/gallery', variant: 'ghost' },
  ],
  answers: {
    what: `A complete trading platform: charting, execution, the NEXUS AI trade assistant and an AI advisor, scanners and hedging engines, strategy and EA building, copy trading and prop challenges, research, and a live media and community layer — TV, radio, chat, video and training — in one window instead of five tabs.`,
    who: 'Active traders who want an AI that explains rather than decides for them; strategy builders bringing EAs and indicators from MT5; and brokers, prop firms and fund managers who want to hand all of it to their clients under their own brand.',
    why: 'Most platforms bolt AI on beside the chart and leave risk to the trader’s mood on the day. Here the AI, the automation and the risk rules share one state, and the automation cannot act until you arm it — nor route around the limits you set yourself.',
    connects: `${EMIL_SHORT} is the intelligence inside it. Every order, manual or automated, passes Shield, an independent Guardian and an account-level Risk Governor. For brokers, the same terminal sits on Raptor’s CRM, risk engine, dealing desk and API hub.`,
    next: 'A walkthrough on your own instruments: convert one of your EAs, arm the scanner at Signal Only, then break a Shield rule on purpose and watch what is refused.',
  },
  // Rendered from the constants below, not from here. Kept because the site
  // search indexes `modules`, and these are the names people search for.
  modules: [
    { title: 'NEXUS AI trade assistant', body: 'Ask anything, entry zones, mark zones on the chart, manage trades, psychology coaching, voice' },
    { title: 'AI advisor', body: 'Pre-trade analysis, morning brief, plain-language questions, agent council' },
    { title: 'AI trend detector', body: 'Trend and regime classification, pattern detection, sentiment' },
    { title: 'AI warnings', body: 'Overtrading, revenge trading, FOMO, margin and news warnings' },
    { title: 'Autonomous trading', body: 'Off, Signal Only, Manual Confirmation, Full Auto — armed by you' },
    { title: 'EA and indicator converter', body: 'MQL5 to RAPTOR Script and Pine Script, backtested, attached to the chart' },
    { title: 'Strategy builder', body: 'No-code EA Builder, AI Strategy Lab, Script IDE, trade from the strategy' },
    { title: 'Live TV and radio', body: 'Financial television and radio inside the terminal, picture-in-picture' },
    { title: 'Live chat, video and screen sharing', body: 'Trading floor rooms, video, screen sharing, live training' },
    { title: 'Copy trading, PAMM and prop challenges', body: 'Follow providers, managed accounts, funded challenges' },
    { title: 'Shield and Guardian', body: 'Daily loss breaker, equity floor, mandatory stop-loss, kill switch' },
  ],
  ctaHeading: `Put ${EMIL_TRADE} in front of your own traders`,
  ctaBody:
    'We set it up against your instruments and your limits, convert a strategy you already run, and show you the AI advising, the scanner signalling and Shield refusing — before anything is armed.',
  ctaActions: DEFAULT_CTA_ACTIONS,
  showRiskLine: true,
}

/** The counts are the platform's own. */
export const EMIL_TRADE_FIGURES: readonly { value: string; label: string }[] = [
  { value: '500+', label: 'Instruments' },
  { value: '155+', label: 'Indicators' },
  { value: '15', label: 'Chart types' },
  { value: '50+', label: 'Drawing tools' },
  { value: '23', label: 'Order types' },
  { value: '20+', label: 'Integrated modules' },
]

/** The authority ladder. The four levels are the scanner's own. */
export const EMIL_TRADE_AUTHORITY: readonly {
  level: string
  label: string
  body: string
  acts: boolean
}[] = [
  {
    level: '0',
    label: 'Off',
    body: 'Nothing is scanned for you and nothing is placed. The terminal is yours alone.',
    acts: false,
  },
  {
    level: '1',
    label: 'Signal only',
    body: 'The default. The AI analyses, detects and explains, and shows you complete signals — it cannot place a single order.',
    acts: false,
  },
  {
    level: '2',
    label: 'Manual confirmation',
    body: 'It prepares the whole trade — entry, stop, three targets, size — and waits. Nothing is sent until you approve that trade.',
    acts: false,
  },
  {
    level: '3',
    label: 'Full auto',
    body: 'Autonomous trading, only once you have armed it. Every order carries a hard stop and passes Shield, Guardian and the Risk Governor; one tap on Emergency Stop halts it all.',
    acts: true,
  },
]

/**
 * The converter and builder pipeline. Steps 1–5 are the public site's own
 * converter pipeline; attaching to the chart and trading from the strategy are
 * the product owner's (TODO_CONFIRM above).
 */
export const EMIL_TRADE_BUILD_STEPS: readonly { title: string; body: string }[] = [
  {
    title: 'Bring it, or describe it',
    body: 'Upload an MQL5 Expert Advisor or indicator — or build one from scratch in the no-code EA Builder or the AI Strategy Lab.',
  },
  {
    title: 'The AI reads the logic',
    body: 'The source is parsed into its structure and the trading patterns inside it are identified: entries, exits, filters, sizing.',
  },
  {
    title: 'Converted to native code',
    body: 'Output as RAPTOR Script — plain TypeScript you can read and edit in the Script IDE — with Pine Script generated alongside.',
  },
  {
    title: 'Backtested against the original',
    body: 'An automatic backtest checks signal parity, so you can see whether the converted version fires where the original did before you trust it.',
  },
  {
    title: 'Attached to the chart',
    body: 'The indicator or strategy lands on the chart by itself, drawing its levels and signals on the instrument you are looking at.',
  },
  {
    title: 'Trade from the strategy',
    body: 'Take its signals by hand, approve each one, or deploy it to paper, demo or live in one click — through the same Shield rules as every other order.',
  },
]

/** NEXUS, as its own panel in the terminal presents itself. */
export const EMIL_TRADE_NEXUS: readonly SpecGroup[] = [
  {
    label: 'Talk to it',
    items: [
      'Ask NEXUS anything, in plain words, from its panel beside the chart — or open it from the NEXUS button on any screen',
      'Analyse a setup before you take it: the entry zone, where the idea fails, and the risk you would be carrying',
      'Review the positions you already hold, and what has changed since you opened them',
      'Coaching on the psychology of your trading in conversation, and weekly reports on how you actually traded',
      'Voice mode, for asking without typing (beta)',
    ],
  },
  {
    label: 'Act on the chart',
    items: [
      'One-tap actions under the conversation: Entry Zone, Mark Zone on Chart and Manage Trades',
      'The zone it finds is marked on your chart, not left in a paragraph for you to redraw',
      'Its own alerts, switched and managed from the top of the panel',
      'An Active switch shown at the top of the panel at all times, so you know whether NEXUS is engaged',
      'Every conversation carries its own line: AI analysis, not financial advice',
    ],
  },
]

export const EMIL_TRADE_AI: readonly SpecGroup[] = [
  {
    label: 'The AI advisor',
    items: [
      'Pre-trade analysis on every order ticket: stop and target suggestions, and a risk read before you commit',
      'A daily morning brief — market pulse, your watchlist, the calendar, the risks, and the questions worth investigating today',
      'Ask in plain words, in English or your own language: “compare EURUSD and GBPUSD”, “find a hedge for gold”, “show my exposure”',
      'An agent council — several AI agents reason about the same market and show where they agree and where they conflict',
      'Structured trade cards with entry, risk and targets defined',
    ],
  },
  {
    label: 'The AI trend detector',
    items: [
      'Every instrument labelled in plain terms — strong uptrend, weak downtrend, range bound, sideways consolidation — with its ATR volatility beside it',
      'Market regime and volatility classified continuously, and fed straight into the risk layer',
      '55+ chart patterns detected in real time, with sentiment read across the market',
      'Eight exclusive Raptor indicators and five AI overlays drawn directly on the chart',
      'A continuous scanner over twenty instruments, every signal carrying direction, setup, timeframe, confidence, entry, stop and three targets',
      'The scanner grades its own strong signals against the bars that followed, wins and losses alike, and shows you the record',
    ],
  },
  {
    label: 'The AI warnings',
    items: [
      'A psychology coach that notices overtrading, revenge trading, FOMO, loss aversion and taking profit too early — and says so while it matters',
      'Context from your own history: how your win rate has actually looked on this kind of setup, before you take another',
      'High-impact news flagged ahead of time, so automation posture can change before the release lands',
      'A margin early-warning ladder at 300%, 200% and 150%, long before a margin call is close',
      'Price deviation alerts for abnormal moves and slippage',
      'Feed health and broker latency watched as risk inputs, not technical details',
    ],
  },
  {
    label: 'Engines that can say no',
    items: [
      'An AI correlation hedging engine that computes every relationship live, ranks the best hedges, and refuses when no reliable hedge exists — naming the candidates it rejected',
      'Rules in plain language: “risk no more than 0.5% per trade, stop after two losses, lock the day at $50 profit” is parsed into enforced limits',
      '“Why did Auto Scan stop trading?” and “what did the engine reject and why?” get a direct answer, not a black box',
      'Touch an engine position and it becomes yours — the engine never fights a manual decision, and the intervention is logged',
      'Hedge and scan carry separate consent, separate limits and separate logs; neither can act through the other',
      'Its adaptations wait for your sign-off rather than changing behaviour silently',
    ],
  },
]

export const EMIL_TRADE_BUILD: readonly SpecGroup[] = [
  {
    label: 'Build',
    items: [
      'No-code EA Builder: assemble an automated strategy visually, without writing a line',
      'AI Strategy Lab: a multi-agent environment for developing, testing and refining strategies',
      'Script IDE: strategies and indicators in TypeScript, each running in its own sandbox',
      'AI EA and indicator converter: MQL5 in, RAPTOR Script and Pine Script out',
    ],
  },
  {
    label: 'Run',
    items: [
      'Strategies and indicators attach to the chart and draw their signals where you are looking',
      'Backtest and parameter optimisation against the same price data the chart draws',
      'One-click deploy to paper, demo or live, without editing the script',
      'An always-visible algo engine switch, an EAs / robots library, and a full engine log with signal export',
    ],
  },
]

export const EMIL_TRADE_FLOOR: readonly SpecGroup[] = [
  {
    label: 'Watch and listen',
    items: [
      'Live financial television inside the terminal — Bloomberg TV, Yahoo Finance, CNBC, Sky News, DW News, CNA Asia and Al Jazeera',
      'Picture-in-picture, so the broadcast stays on screen, muted or not, while you work the chart',
      'Live radio, for the market in your ear when the screen is busy',
    ],
  },
  {
    label: 'Talk',
    items: [
      'A live trading-floor chat, with rooms for forex, metals and energy, indices, crypto and India',
      'Type $XAUUSD in any message and the instrument links live',
      'Moderated: no selling signals, no sharing personal data, no passing opinion off as advice',
    ],
  },
  {
    label: 'See each other',
    items: [
      'Video calls with your broker from inside the terminal, for live support, with microphone and camera',
      'Screen sharing on the call, so a chart, a setup or a problem can be looked at together',
      'Live rooms, a social feed, leaderboards and trading competitions',
    ],
  },
  {
    label: 'Learn',
    items: [
      'Live training modules alongside self-paced courses in the RAPTOR Academy',
      'Quizzes, an AI tutor, and paper trading to practise what was just taught',
      'XP levels, badges, streaks and weekly challenges that reward learning as well as trading',
    ],
  },
]

export const EMIL_TRADE_TERMINAL: readonly SpecGroup[] = [
  {
    label: 'The workspace',
    items: [
      'Charts, market watch, order desk, tools and AI modules in one unified screen',
      'Saved workspaces per instrument, session or strategy, and pop-out windows for multi-monitor desks',
      'Hotkeys for rapid entry — B to buy, S to sell, 1–6 for timeframes — and dark and light themes',
      'Live, demo and multiple accounts under one login, switched from the header; demo clearly badged',
      'A live currency-strength strip, a latency meter, and a session clock for Sydney, Tokyo, London and New York',
      'Installable on iOS and Android, with native mobile apps alongside the browser terminal',
    ],
  },
  {
    label: 'Charting',
    items: [
      'Two chart engines — the native RAPTOR engine and TradingView — switched from the same toolbar',
      '15 chart types, 155+ indicators computed natively, 50+ drawing tools and 30+ timeframes',
      'Fibonacci, pitchforks, Elliott Wave and harmonic tools, with magnet snapping',
      'Compare a second symbol on the same chart, save templates, and snapshot any chart in one click',
    ],
  },
  {
    label: 'Execution',
    items: [
      '23 order types, including market, limit, stop, OCO, trailing stop and multiple take-profits',
      'One-click trading, inline stop and target editing, partial close, and close all',
      'Depth of market, a live sentiment meter, and position notes that carry your reasoning into the journal',
      'A per-position auto-hedge switch, and stops and targets held server-side so they survive a dropped connection',
    ],
  },
  {
    label: 'Your account',
    items: [
      'Balance, equity, margin, free margin and margin level pinned to the footer, updating tick by tick',
      'Performance analytics: equity curve, Sharpe, Sortino, Calmar, monthly heatmap and trade distribution',
      'A trade journal, full history with export, a trade inbox and system logs',
      'Five docked calculators — pip, position size, margin, profit / loss, risk / reward — pre-filled with your symbol',
    ],
  },
]

export const EMIL_TRADE_MARKETS: readonly SpecGroup[] = [
  {
    label: 'Research',
    items: [
      'Economic calendar and central bank tracker tied to your instruments',
      'A live news stream, and news interpreted through the AI layer',
      'Heatmap and breadth, live correlations, an equity screener and company intelligence',
    ],
  },
  {
    label: 'Alerts',
    items: [
      'Smart alerts on price, indicator, pattern, calendar, position and news sentiment',
      'Every alert from every module managed in one alert centre',
      'Delivered where you are working, not only by email',
    ],
  },
  {
    label: 'Follow and fund',
    items: [
      'Copy trading: follow verified providers with risk-adjusted allocation',
      'PAMM / MAM accounts for managing investor funds',
      'Prop challenges — one-phase, two-phase and instant funding — with live progress gauges and scaling',
    ],
  },
  {
    label: 'Marketplace and money',
    items: [
      'A marketplace of EAs, indicators, signal providers and plugins, free and paid',
      'Card, wire and crypto deposits, internal transfers, statements and tax summaries',
      'A plan and entitlement view showing exactly which data and modules you have',
    ],
  },
]

export const EMIL_TRADE_PROTECTION: readonly SpecGroup[] = [
  {
    label: 'Shield — you, protected from you',
    items: [
      'Daily loss circuit-breaker: when today’s realised loss reaches your limit, new orders stop until tomorrow',
      'Equity floor kill switch: touch the floor and every position closes and trading locks for 24 hours',
      'Risk-per-trade cap and mandatory stop-loss — no order reaches the market without a stop',
      'Correlation guard, so you cannot stack the same trade under different tickers',
      'Conservative, Balanced and Minimal presets, with today’s P&L, trade count and loss streak always on screen',
      'Shield gates new orders only — closing a position is never blocked — and binds every surface, your EAs included',
    ],
  },
  {
    label: 'Above Shield',
    items: [
      'Guardian: an independent supervisor that can stop automation outright, with broker-side stops left active',
      'Risk Governor: account-level limits above every module, so no engine exceeds your overall budget',
      'A daily loss budget and a drawdown guard measured from your high-water mark, with live bars',
      'Capital split into protected capital, banked profit and working capital, with a visible profit floor',
    ],
  },
  {
    label: 'Responsible trading',
    items: [
      'Self-set deposit limits, daily and weekly loss limits, and session time limits',
      'Reality-check pop-ups and cooling-off periods',
      'Immediate self-exclusion, with links to independent support',
    ],
  },
]

export const EMIL_TRADE_BUSINESS: readonly SpecGroup[] = [
  {
    label: 'For brokers and prop firms',
    items: [
      'White label: your brand, your domain, your AI persona',
      'Risk engine with A/B-book routing, a dealing desk, and automated stop-out',
      'CRM, KYC / AML compliance, a multi-tier IB network and payment gateways',
      'LP bridge over FIX, prop challenge rules and payout management',
    ],
  },
  {
    label: 'For developers',
    items: [
      'REST for accounts, orders, positions and history',
      'WebSocket streaming for ticks, L2 depth and account events',
      'A FIX 4.4 gateway and signed webhooks',
      'SDKs for JavaScript, Python and Go',
    ],
  },
]
