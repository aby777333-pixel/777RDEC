/**
 * Module and workspace copy.
 *
 * Two dictionaries live here, both describing what is inside the product:
 *
 * 1. `INDIGENOUS_MODULES` — the twenty modules that make up the Raptor stack.
 * 2. `WORKSPACE_GROUPS` — how the terminal workspace is organised, listed as
 *    capabilities. This describes the surface; it does not reimplement it.
 *    The terminal itself is a separate application (see PLAN.md § Scope).
 *
 * Icons are referenced by key rather than imported here, so this file stays a
 * plain string dictionary and remains swappable for translation (§1 i18n).
 */

/** One of the six card hues defined in `globals.css`. Never a colour literal. */
export type Hue = 1 | 2 | 3 | 4 | 5 | 6

export type IndigenousModule = {
  name: string
  blurb: string
  hue: Hue
}

export const MODULES_SECTION = {
  eyebrow: 'Ecosystem',
  heading: '20 Indigenous Modules',
  lead: 'Every module is 100% RAPTOR-native. MT5 and cTrader are migration bridges only — not dependencies.',
} as const

/**
 * Hues are assigned per module rather than cycled, so the grid reads as
 * grouped rather than striped. Every value resolves to a `.hue-N` class, which
 * re-tints with the theme.
 *
 * TODO_CONFIRM: several blurbs below carry specific figures and third-party
 * names supplied with the brief — `155+ indicators`, `40+ PSP connectors`,
 * `FIX 4.4/5.0`, `Claude-powered`, `MT5/cTrader`. Confirm each before this is
 * used in front of a buyer, on the same standard as the integrations
 * directory in `copy/integrations-directory.ts`.
 */
export const INDIGENOUS_MODULES: readonly IndigenousModule[] = [
  { name: 'RAPTOR Core Engine', blurb: 'Indigenous matching & execution', hue: 1 },
  { name: 'RAPTOR CRM', blurb: 'Full lifecycle client management', hue: 1 },
  { name: 'RAPTOR Desk', blurb: 'Institutional dealing workstation', hue: 4 },
  { name: 'RAPTOR Price', blurb: 'Spread construction & aggregation', hue: 2 },
  { name: 'RAPTOR Charts', blurb: '155+ indicators, all chart types', hue: 1 },
  { name: 'RAPTOR Script', blurb: 'TypeScript EA/indicator runtime', hue: 3 },
  { name: 'RAPTOR AI', blurb: 'Claude-powered intelligence layer', hue: 3 },
  { name: 'Copy Trading', blurb: 'Social & mirror trading engine', hue: 6 },
  { name: 'PAMM / MAM', blurb: 'Investor fund management', hue: 4 },
  { name: 'Prop Trading', blurb: 'Challenge engine & funded accounts', hue: 2 },
  { name: 'IB Network', blurb: 'Multi-tier affiliate management', hue: 1 },
  { name: 'Compliance Suite', blurb: 'KYC/AML + regulatory reporting', hue: 5 },
  { name: 'Payment Hub', blurb: '40+ PSP connectors, crypto', hue: 4 },
  { name: 'LP Bridge', blurb: 'FIX 4.4/5.0, smart routing', hue: 1 },
  { name: 'White Label', blurb: 'Full rebrand + custom domain', hue: 2 },
  { name: 'RAPTOR Intel', blurb: 'Indigenous BI & analytics', hue: 4 },
  { name: 'RAPTOR Social', blurb: 'Community, leaderboards, feed', hue: 1 },
  { name: 'RAPTOR Comply', blurb: 'Responsible trading framework', hue: 5 },
  { name: 'RAPTOR Connect', blurb: 'MT5/cTrader migration bridge', hue: 3 },
  { name: 'RAPTOR App', blurb: 'iOS + Android native mobile', hue: 3 },
]

/**
 * Icon keys. A closed union so the component's icon map is exhaustive and a
 * typo fails `tsc` rather than rendering nothing.
 */
export type WorkspaceIconKey =
  | 'terminal'
  | 'network'
  | 'tv'
  | 'chat'
  | 'emil'
  | 'markets'
  | 'orders'
  | 'positions'
  | 'builder'
  | 'lab'
  | 'signals'
  | 'dashboard'
  | 'performance'
  | 'history'
  | 'wallet'
  | 'journal'
  | 'alerts'
  | 'calendar'
  | 'news'
  | 'widgets'
  | 'heatmap'
  | 'education'
  | 'support'

export type WorkspaceItem = {
  label: string
  blurb: string
  icon: WorkspaceIconKey
}

export type WorkspaceGroup = {
  label: string
  blurb: string
  hue: Hue
  items: readonly WorkspaceItem[]
}

export const WORKSPACE_SECTION = {
  eyebrow: 'Workspace',
  heading: 'Everything the workspace opens',
  lead: 'The terminal is organised into three areas. Trading is where positions are analysed and sent, Portfolio is where the account is understood after the fact, and Tools is the context around both.',
  note: 'Listed as capabilities. The terminal is a separate application supplied alongside the platform — nothing on this page simulates it.',
} as const

export const WORKSPACE_GROUPS: readonly WorkspaceGroup[] = [
  {
    label: 'Trading',
    blurb: 'Analysis, execution and the intelligence around them.',
    hue: 1,
    items: [
      { label: 'Terminal', blurb: 'Full trading terminal', icon: 'terminal' },
      { label: 'ABIN', blurb: 'Advanced Brokerage Intelligence Network', icon: 'network' },
      { label: 'Live TV', blurb: 'Bloomberg, CNBC, Yahoo Finance and more', icon: 'tv' },
      { label: 'Live Chat', blurb: 'Traders community floor', icon: 'chat' },
      { label: 'EMIL', blurb: 'EMIL Control Cockpit — opens the EMIL app', icon: 'emil' },
      { label: 'Markets', blurb: 'Market watch', icon: 'markets' },
      { label: 'Orders', blurb: 'Order management', icon: 'orders' },
      { label: 'Positions', blurb: 'Open positions', icon: 'positions' },
      { label: 'EA Builder', blurb: 'Automated strategies', icon: 'builder' },
      { label: 'AI Strategy Lab', blurb: 'Multi-agent strategy lab', icon: 'lab' },
      { label: 'AI Signals', blurb: 'AI trade signals', icon: 'signals' },
    ],
  },
  {
    label: 'Portfolio',
    blurb: 'What the account did, and what it is doing now.',
    hue: 4,
    items: [
      { label: 'Dashboard', blurb: 'Overview & KPIs', icon: 'dashboard' },
      { label: 'Performance', blurb: 'Equity & analytics', icon: 'performance' },
      { label: 'Trade History', blurb: 'Closed trades', icon: 'history' },
      { label: 'Wallet', blurb: 'Deposits & withdrawals', icon: 'wallet' },
      { label: 'Trade Journal', blurb: 'Notes & insights', icon: 'journal' },
    ],
  },
  {
    label: 'Tools',
    blurb: 'The context a decision is made against.',
    hue: 3,
    items: [
      { label: 'Alerts', blurb: 'Price & event alerts', icon: 'alerts' },
      { label: 'Calendar', blurb: 'Economic calendar', icon: 'calendar' },
      { label: 'News', blurb: 'Market news feed', icon: 'news' },
      { label: 'Market Widgets', blurb: 'TradingView widget suite', icon: 'widgets' },
      { label: 'Heatmap', blurb: 'Market heatmap', icon: 'heatmap' },
      { label: 'Education', blurb: 'Learn to trade', icon: 'education' },
      { label: 'Support', blurb: 'Help & tickets', icon: 'support' },
    ],
  },
]
