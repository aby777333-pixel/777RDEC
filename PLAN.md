# PLAN

Working record, one entry per phase. Written before the phase, updated after.

## Phase 1 — Foundation ✅

**Built.** Next 14 App Router scaffold with `src/`, TypeScript strict (plus
`noUnusedLocals` / `noUnusedParameters`), Tailwind with a CSS-variable token
layer, self-hosted fonts via `next/font`, `lib/brand.ts`, UI primitives,
Nav + mega-menu + mobile drawer + footer + cookie banner, `check-copy.ts`
wired into `npm run build`, and every route from §2 as a real page.

**Assumptions.** `/docs/brief.md` is not in the repo, so page copy is derived
from the headlines quoted in the super prompt plus the positioning it states.
Every approved headline in the prompt is used verbatim.

**Done when.** Every §2 route exists with correct metadata, nav works on
mobile, copy guard passes. ✅

## Phase 2 — Simulation core ✅

**Built.** `lib/sim/instruments.ts` (40 instruments, six asset classes),
`sessions.ts` (session windows + activity multiplier), `priceEngine.ts` (GBM
with a decaying drift term and an anchor pull, seeded via mulberry32),
`priceEngine.worker.ts`, `use-price-feed.ts` (worker + rAF throttle +
IntersectionObserver gating), `use-rolling-series.ts`, `indicators.ts`
(EMA, SMA, Bollinger, RSI, MACD, VWAP), `LwChart`, `DepthLadder`.

**Done when.** Four charts and a ladder tick smoothly. ✅ (Measured on
desktop; mid-range Android verification still outstanding — see Open items.)

## Phase 3 — Homepage ✅

All ten sections built: hero terminal, "not another platform" docking
animation, ecosystem flow, EMIL reveal, audience switcher, cross-asset
heatmap, risk, white-label re-skin, API code panel, closing. Homepage first
load 230 kB against the 350 kB budget.

## Phase 4 — EMIL ✅

`lib/emil/machine.ts` as an explicit discriminated union,
`EmilControlPanel`, `ArmDialog` (typed `ARM` confirmation, not dismissible by
click-outside), `EmilLog` with `aria-live`, `EmilStatusCard`, `EmilStrip`.
DISARM renders in every state and `Escape` disarms when the panel has focus.

## Phase 5 — Experience Raptor 🔶 Partial

The sandbox shell exists with the left rail, the simulated-data chip, the exit
route and a working terminal + EMIL panel. Order tickets, the portfolio and
risk workspaces, and the CRM/portal preview panes are not built yet.

## Phase 6 — Product pages 🔶 Partial

Every page exists with real copy and the five answers. Bespoke live components
are in place on the homepage, `/technology/architecture`, `/platform/emil`,
`/intelligence/emil-lab` and `/technology/api`. The remaining pages still need
their own live component (RBAC matrix, liquidity routing diagram, session
globe).

## Phase 7 — Company, legal, forms 🔶 Partial

Legal pages, the Supabase migration and the demo-request Server Action are
built. Turnstile is behind an env flag. MDX content pipeline is not wired.

## Phase 8 — Polish ⬜ Not started

OG image route exists; sitemap and robots are in place. Outstanding: axe
audit, cross-browser pass (iOS Safari blur + canvas especially), favicon set
from the falcon mark.

## Open items

- **Hero images.** Four images were supplied in conversation but did not
  arrive as files. `HERO_IMAGES` in `lib/brand-assets.ts` documents the
  expected paths; the site is designed to work without them.
- **Logo.** `RaptorLogo` renders type + the abstracted wing rather than the
  raster asset, because `/public/brand/raptor-logo.png` is not in the repo.
- **Registered address.** `REGISTERED_ADDRESS` is `TODO_CONFIRM`.
- **Mobile performance.** Needs measuring on a real mid-range Android.
