/**
 * The EMIL gallery: captures of the running EMIL applications, taken on
 * 12 September 2026 — the Control Cockpit, screen by screen, and the EMIL Trade
 * terminal.
 *
 * The files are the same captures the EMIL page frames — `public/app/`, as
 * WebP at up to 2560px wide for inspection, with 480px copies in `thumb/` for
 * the strip — so each is stored once. The slug is the app-shot id. Where a capture
 * showed something that is not the site's to publish — an account number, a
 * server address, a bridge token, the private app host in code samples, the
 * owner's name — it was blacked out before it was saved, and `redacted` says so.
 */
export type GalleryShot = {
  slug: string
  title: string
  /** Local time the capture was taken, HH:MM. */
  time: string
  width: number
  height: number
  redacted?: boolean
}

export const EMIL_GALLERY_DATE = '12 September 2026'

export const EMIL_GALLERY: readonly GalleryShot[] = [
  { slug: 'cockpit', title: 'Control Cockpit — Dashboard', time: '22:17', width: 2542, height: 1338 },
  { slug: 'markets', title: 'Global Markets', time: '22:17', width: 2548, height: 1341 },
  { slug: 'instruments', title: 'Instrument Master', time: '22:17', width: 2557, height: 1342 },
  { slug: 'heatmap', title: 'Heatmap & Breadth', time: '22:18', width: 2559, height: 1347 },
  { slug: 'charts', title: 'Charts', time: '22:18', width: 2559, height: 1329 },
  { slug: 'company', title: 'Company Intelligence', time: '22:19', width: 2559, height: 1348 },
  { slug: 'screener', title: 'Equity Screener', time: '22:19', width: 2559, height: 1342 },
  { slug: 'news', title: 'EMIL News', time: '22:20', width: 2559, height: 1338 },
  { slug: 'alerts', title: 'Alert Center', time: '22:20', width: 2557, height: 1344 },
  { slug: 'arm', title: 'ARM / DISARM', time: '22:21', width: 2557, height: 1335 },
  { slug: 'cards', title: 'Trade Cards', time: '22:21', width: 2544, height: 1234 },
  { slug: 'portfolio', title: 'Portfolio & Exposure', time: '22:21', width: 2559, height: 1335, redacted: true },
  { slug: 'scenario', title: 'Scenario & Hedge Simulator', time: '22:22', width: 2559, height: 1333 },
  { slug: 'council', title: 'Agent Council', time: '22:22', width: 2554, height: 1342 },
  { slug: 'apihub', title: 'Global Markets & API Hub', time: '22:22', width: 2559, height: 1335 },
  { slug: 'terminal', title: 'EMIL Trade — terminal', time: '22:23', width: 2557, height: 1344 },
  { slug: 'paper', title: 'Paper Trading Desk', time: '22:23', width: 2556, height: 1332 },
  { slug: 'agentdesk', title: 'Agent Paper Desk', time: '22:24', width: 2556, height: 1338 },
  { slug: 'backtest', title: 'Backtest Engine', time: '22:24', width: 2556, height: 1350 },
  { slug: 'options', title: 'Options Analytics', time: '22:24', width: 2559, height: 1350 },
  { slug: 'calendar', title: 'Calendar & Central Banks', time: '22:25', width: 2559, height: 1338 },
  { slug: 'calendar-menu', title: 'Calendar & Central Banks — full menu', time: '22:53', width: 2559, height: 1336 },
  { slug: 'journal', title: 'Trade Journal', time: '22:53', width: 2559, height: 1347 },
  { slug: 'risk', title: 'Risk Management', time: '22:54', width: 2559, height: 1350 },
  { slug: 'capital', title: 'Capital & Performance', time: '22:54', width: 2535, height: 1345 },
  { slug: 'strategycenter', title: 'Strategy Center', time: '22:54', width: 2554, height: 1338 },
  { slug: 'strategylab', title: 'Strategy Lab', time: '22:55', width: 2556, height: 1342 },
  { slug: 'teach', title: 'Teach EMIL', time: '22:55', width: 2559, height: 1345 },
  { slug: 'trust', title: 'Trust & Metacognition', time: '22:56', width: 2559, height: 1339 },
  { slug: 'connect', title: 'Connect Your Platform', time: '22:56', width: 2559, height: 1339, redacted: true },
  { slug: 'developers', title: 'Developers & Integrations', time: '22:57', width: 2559, height: 1345, redacted: true },
  { slug: 'integrations', title: 'Integrations Directory', time: '22:57', width: 2556, height: 1339 },
  { slug: 'datafeed', title: 'Your Data Feed', time: '22:57', width: 2554, height: 1344, redacted: true },
  { slug: 'settings', title: 'Settings & Permissions', time: '22:58', width: 2559, height: 1339 },
  { slug: 'organization', title: 'Organization', time: '22:58', width: 2554, height: 1332, redacted: true },
]

export const galleryFull = (shot: GalleryShot) => `/app/${shot.slug}.webp`
export const galleryThumb = (shot: GalleryShot) => `/app/thumb/${shot.slug}.webp`
