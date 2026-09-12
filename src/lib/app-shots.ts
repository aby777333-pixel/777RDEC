import 'server-only'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Optional screenshots of the running applications.
 *
 * ## Why these exist at all
 *
 * Design system §3 says the site's product visuals are live components and
 * diagrams, never screenshots — and the site keeps to that: the client portal,
 * the CRM and the terminal workspace on these pages are all built rather than
 * photographed. That rule is restated in `public/hero/README.md` and in
 * `brand-assets.ts`, and it exists for good reasons: a screenshot ages the
 * moment the product ships, it cannot be re-skinned for a white-label demo,
 * it carries whatever was on screen that day, and it is never legible on a
 * phone.
 *
 * These slots are a deliberate, narrow exception, asked for by the owner: real
 * captures of the EMIL Control Cockpit and the EMIL Trade terminal, shown
 * alongside the live components rather than instead of them. Nothing else on
 * the site becomes a screenshot.
 *
 * ## How they behave
 *
 * The same contract as the hero imagery: the files are not in the repository,
 * they are dropped into `public/app/` by hand, and presence is checked on the
 * server at render time. A file that is absent is never referenced — no
 * request, no 404, no broken frame — and the section simply does not appear.
 * See `public/app/README.md` for the filenames.
 *
 * One slot per surface rather than one per page. A cockpit screen is dense —
 * a full board of quotes, a 29-step pipeline, an options chain — and shrinking
 * five of them into one capture would make all five unreadable. Each is shown
 * beside the section that explains it, and clicking one opens it full size.
 */

export type AppShot = {
  /** Referenced by <AppShotFrame id="...">. */
  id:
    | 'cockpit'
    | 'markets'
    | 'instruments'
    | 'heatmap'
    | 'charts'
    | 'company'
    | 'screener'
    | 'news'
    | 'alerts'
    | 'arm'
    | 'cards'
    | 'portfolio'
    | 'scenario'
    | 'council'
    | 'apihub'
    | 'terminal'
    | 'paper'
    | 'agentdesk'
    | 'backtest'
    | 'options'
    | 'calendar'
    | 'journal'
    | 'risk'
    | 'capital'
    | 'strategycenter'
    | 'strategylab'
    | 'teach'
    | 'trust'
    | 'connect'
    | 'developers'
    | 'integrations'
    | 'datafeed'
    | 'settings'
    | 'organization'
    | 'desk'
  src: string
  /** Shown under the frame. A screenshot without a caption is decoration. */
  caption: string
  /** What to capture, for whoever takes it. */
  note: string
}

const CANDIDATES: readonly AppShot[] = [
  {
    id: 'cockpit',
    src: '/app/cockpit.png',
    caption:
      'The cockpit on arrival: the mode it is in, what the guardian has stopped, the morning brief with its own sourcing line, and the capital, exposure and risk-budget meters underneath.',
    note: 'EMIL Control Cockpit · Dashboard, signed in, scrolled to the top. Dark theme, demo account.',
  },
  {
    id: 'markets',
    src: '/app/markets.png',
    caption:
      'Global Markets: nine exchange clocks, the watchlist, and boards for indices, metals, energy, FX reference rates and crypto — each stamped with its provider, its freshness and the time it was fetched.',
    note: 'Control Cockpit · Global Markets, top of page through the crypto venue table.',
  },
  {
    id: 'instruments',
    src: '/app/instruments.png',
    caption:
      'The instrument master: one canonical symbol per instrument, what each provider calls it, and whether it carries a research feed, a venue, or both.',
    note: 'Control Cockpit · Instrument Master with a category expanded.',
  },
  {
    id: 'heatmap',
    src: '/app/heatmap.png',
    caption:
      'Heatmap and breadth: how much of each group advanced, its average move, and its best and worst name — FX against the dollar, crypto, and the research board.',
    note: 'Control Cockpit · Heatmap & Breadth on the 1 day / 24h view.',
  },
  {
    id: 'charts',
    src: '/app/charts.png',
    caption:
      'Research charting: candles with SMA, EMA, Bollinger and RSI computed inside the cockpit, compare mode, and your own saved levels — labelled delayed research data, never an execution price.',
    note: 'Control Cockpit · Charts with a symbol loaded and at least one indicator on.',
  },
  {
    id: 'company',
    src: '/app/company.png',
    caption:
      'Company intelligence straight from SEC XBRL: eight fiscal quarters of revenue and net income, the balance sheet, and the concept name used for every figure.',
    note: 'Control Cockpit · Company Intelligence for a large listed name.',
  },
  {
    id: 'screener',
    src: '/app/screener.png',
    caption:
      'The equity screener, where a row says what it is still missing rather than guessing: ready, needs a filings scan, or needs a price.',
    note: 'Control Cockpit · Equity Screener with results listed.',
  },
  {
    id: 'news',
    src: '/app/news.png',
    caption:
      'Headlines from open news indexes, each tagged with impact, stance and the instruments it touches, and each carrying one line on why it matters.',
    note: 'Control Cockpit · EMIL News on the Markets tab.',
  },
  {
    id: 'alerts',
    src: '/app/alerts.png',
    caption:
      'Price alerts: a condition, a threshold and a note saying why the level matters. Alerts are research signals — they never place, modify or cancel anything.',
    note: 'Control Cockpit · Alert Center.',
  },
  {
    id: 'arm',
    src: '/app/arm.png',
    caption:
      'The activation screen: the disclosure, the nine operating modes with what each may and may not do, every limit that will apply, and the acknowledgements that have to be ticked.',
    note: 'Control Cockpit · ARM / DISARM, disarmed, with a mode selected.',
  },
  {
    id: 'cards',
    src: '/app/cards.png',
    caption:
      'A trade card: levels, size, monetary risk, the conditions it was read against, the reasons for and against, and every agent vote — including the ones that said no.',
    note: 'Control Cockpit · Trade Cards showing a proposal that was not approved.',
  },
  {
    id: 'portfolio',
    src: '/app/portfolio.png',
    caption:
      'Every linked account in one exposure map, including the ones that are not answering — a stale bridge and a key that is not whitelisted both say so on the row.',
    note: 'Control Cockpit · Portfolio & Exposure with several accounts linked.',
  },
  {
    id: 'scenario',
    src: '/app/scenario.png',
    caption:
      'The scenario and hedge simulator: six macro factors on sliders, the linear P&L of every position, and proxy hedges sized against the net factor exposure.',
    note: 'Control Cockpit · Scenario & Hedges with a preset applied.',
  },
  {
    id: 'council',
    src: '/app/council.png',
    caption:
      'The decision pipeline: the twenty-nine steps a trade has to survive, with the current candidate’s position in it, and the forty agents grouped by what they are for.',
    note: 'Control Cockpit · Agent Council with the pipeline expanded.',
  },
  {
    id: 'apihub',
    src: '/app/apihub.png',
    caption:
      'The API hub: connect a broker you already have, or use the native terminal — and every market selected here runs through the same risk pipeline.',
    note: 'Control Cockpit · Global API Hub showing both execution routes and the market selector.',
  },
  {
    id: 'terminal',
    src: '/app/terminal.png',
    caption:
      'The terminal: chart, watchlist, order desk and open positions on one surface, with the account’s margin state along the bottom.',
    note: 'EMIL Trade terminal with a chart loaded, the watchlist open and at least one position in the order desk. Demo account, so no client data.',
  },
  {
    id: 'paper',
    src: '/app/paper.png',
    caption:
      'The paper desk: sandbox and testnet venues, a ticket that states its own protections — quote age, latency, spread, duplicate window, daily cap — and a journal of what was sent.',
    note: 'Control Cockpit · Paper Trading Desk with a venue connected.',
  },
  {
    id: 'agentdesk',
    src: '/app/agentdesk.png',
    caption:
      'The agent paper desk, where the council proposes, the guardian checks and sizes deterministically, and a human confirms — to sandbox venues only, with live ones refused in code.',
    note: 'Control Cockpit · Agent Paper Desk showing the gates and the autopilot state.',
  },
  {
    id: 'backtest',
    src: '/app/backtest.png',
    caption:
      'A backtest that argues with itself: the verdict calls the result thin, names the buy-and-hold it failed to beat, and says the walk-forward has too few folds to judge.',
    note: 'Control Cockpit · Backtest Engine after a run, including the verdict banner and walk-forward panel.',
  },
  {
    id: 'options',
    src: '/app/options.png',
    caption:
      'Options analytics: ATM implied volatility by expiry, put/call open interest, max pain, skew, and the chain itself.',
    note: 'Control Cockpit · Options Analytics with an expiry selected.',
  },
  {
    id: 'calendar',
    src: '/app/calendar.png',
    caption:
      'Central-bank state derived from the calendar feed and the latest FRED observations — and a bank with no decision in the window shows no rate rather than a guess.',
    note: 'Control Cockpit · Calendar & Central Banks, from the bank monitor into the economic calendar.',
  },
  {
    id: 'journal',
    src: '/app/journal.png',
    caption:
      'The journal grades the process, not the outcome: an incomplete entry is reviewed, given a process grade, told exactly what was missing, and flagged — with the advice that an incomplete log is itself a process error.',
    note: 'Control Cockpit · Trade Journal with at least one reviewed entry, including the review text and the process grade.',
  },
  {
    id: 'risk',
    src: '/app/risk.png',
    caption:
      'Risk-first sizing, where the calculated lot is cut to the exposure ceiling and says so — next to nine circuit breakers each showing its current value, its limit and what it does on trip.',
    note: 'Control Cockpit · Risk Management, including the breaker grid and the trip history.',
  },
  {
    id: 'capital',
    src: '/app/capital.png',
    caption:
      'Capital in layers: protected capital with a floor it is never risked below, a profit floor that locks banked gains, and an equity curve with the drawdown laid over it.',
    note: 'Control Cockpit · Capital & Performance with the 90-day curve and the drawdown events list.',
  },
  {
    id: 'strategycenter',
    src: '/app/strategycenter.png',
    caption:
      'Champion against challenger, and a promotion pipeline a strategy has to walk: research, backtest, paper, restricted live, production — never on backtest results alone.',
    note: 'Control Cockpit · Strategy Center showing the champion/challenger panel and several strategy cards with health scores.',
  },
  {
    id: 'strategylab',
    src: '/app/strategylab.png',
    caption:
      'The lab, with its data mode declared: estimates are labelled as estimates, a candidate missing a rule is marked incomplete rather than completed by guesswork, and every stage of the pipeline is its own tab.',
    note: 'Control Cockpit · Strategy Lab with a candidate open and the data-mode banner visible.',
  },
  {
    id: 'teach',
    src: '/app/teach.png',
    caption:
      'Teaching it: public material only, every statement classified and attributed to its exact source, contradictions checked against what it already holds, and the result stored as an untested hypothesis.',
    note: 'Control Cockpit · Teach EMIL on the Ingest tab, including the provenance note under the analyse button.',
  },
  {
    id: 'trust',
    src: '/app/trust.png',
    caption:
      'Confidence in a setup and trust in the environment are separate numbers, and high confidence can never override low trust — the example shows an 82% setup declined at 46% trust.',
    note: 'Control Cockpit · Trust & Metacognition, including the confidence-versus-trust panel and novelty detection.',
  },
  {
    id: 'connect',
    src: '/app/connect.png',
    caption:
      'Bringing your own platform in: MetaTrader mirrors read-only, alerts arrive by private webhook, statements import into the journal — and nothing is ever sent back to your terminal.',
    note: 'Control Cockpit · Connect Your Platform with at least one bridged account listed.',
  },
  {
    id: 'developers',
    src: '/app/developers.png',
    caption:
      'Keys with scopes, an optional IP allow-list and an expiry; sandbox keys that cannot link a broker at all; quickstarts in curl, JavaScript and Python.',
    note: 'Control Cockpit · Developers & API on the reference tab, with the scope chips and quickstart visible.',
  },
  {
    id: 'integrations',
    src: '/app/integrations.png',
    caption:
      'The integration directory, labelled honestly: live means built and working here, and via REST means it works through the API today without a listing in that vendor’s marketplace.',
    note: 'Control Cockpit · Integrations Directory including the chat channels and embeddable widgets sections.',
  },
  {
    id: 'datafeed',
    src: '/app/datafeed.png',
    caption:
      'Your own pushed data, isolated to your account and never mixed with the research feeds — quotes, orders and equity points in, summaries out.',
    note: 'Control Cockpit · Your Data Feed, including the ingest example.',
  },
  {
    id: 'settings',
    src: '/app/settings.png',
    caption:
      'Permission grants as switches with the risk profile beside them, an export of everything in one file, and a retention policy that says how long each kind of record is kept.',
    note: 'Control Cockpit · Settings & Permissions showing the grants, the risk profile editor and the privacy section.',
  },
  {
    id: 'organization',
    src: '/app/organization.png',
    caption:
      'Running it as a team: roles, client books, a recommendation workflow, desk controls, approvals and a tamper-evident archive.',
    note: 'Control Cockpit · Organization.',
  },
  {
    id: 'desk',
    src: '/app/desk.png',
    caption:
      'The broker side: the book, exposure across it, and the clients behind the flow.',
    note: 'Broker admin — dealing desk or risk view. Demo tenant only.',
  },
]

function present(src: string): boolean {
  return existsSync(join(process.cwd(), 'public', src))
}

/** The one with this id, if the file is actually on disk. */
export function appShot(id: AppShot['id']): AppShot | null {
  const found = CANDIDATES.find((shot) => shot.id === id)
  return found && present(found.src) ? found : null
}

/** Every slot, whether or not the file exists — for the README and for tests. */
export function appShotSlots(): readonly AppShot[] {
  return CANDIDATES
}
