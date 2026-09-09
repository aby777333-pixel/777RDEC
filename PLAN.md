# PLAN

Working record. Written before each phase, updated after.

## Scope

**This repository is the marketing website only.** The Raptor Terminal, EMIL
cockpit, CRM and client portal are supplied separately and will be linked or
embedded here later. Nothing in this repo simulates or reimplements them.

An earlier pass had built a simulated terminal and a sandbox; that was removed
on instruction. See DECISIONS.md §11 for exactly what came out and what is
still available to build on.

## Phase 1 — Foundation ✅

Next 14 App Router, `src/`, TypeScript strict (plus `noUnusedLocals` /
`noUnusedParameters`), Tailwind over a CSS-variable token layer, self-hosted
fonts via `next/font`, `lib/brand.ts`, UI primitives, Nav + mega-menu + mobile
drawer + footer + consent-gated cookie banner, `check-copy.ts` wired into
`npm run build`, and every route from the brief as a real page.

*Done when: every route exists with correct metadata, nav works on mobile,
copy guard passes.* ✅

## Phase 2 — Design system ✅

Two complete palettes (light and dark), three-state theme control, type scale,
hairline grid field, glass surfaces, tabular numerals, `/design-system` QA
page rendering every token and component in both themes.

*Done when: every component is visible in both themes on one page.* ✅

## Phase 3 — Homepage ✅

Nine sections: image-led hero with the ecosystem grid, "not another platform"
docking animation, ecosystem flow diagram, EMIL reveal, audience switcher,
cross-asset correlation matrix, risk visualisation, white-label re-skin demo,
API code panels, closing. First load 176 kB against the 350 kB budget.

## Phase 4 — Product pages ✅

Every page carries real copy and answers the five questions (what / who / why /
how it connects / what next). Live components on the homepage,
`/technology/architecture` (ecosystem diagram), `/platform/emil` (five pillars
with micro-visuals, the not-an-EA comparison, the operating-mode control),
`/technology/api` (code panels), `/brokers/white-label` (browser re-skin),
`/platform/risk` and `/intelligence/risk` (treemap, gauges),
`/intelligence/market` (correlation matrix).

## Phase 5 — Compliance and legal ✅

Technology-provider disclosure and legal entity block in the footer of every
page. Seven legal documents at `/legal/*` written in plain language. Copy guard
blocking forbidden claims. No certification badges anywhere.

## Phase 6 — Forms and content ✅

Supabase migration for `demo_requests`, `contact_messages` and
`newsletter_subscribers` with RLS on and no policies. Server Actions writing
through the service role; Zod validation; honeypot plus Turnstile behind an env
flag; swappable Resend/console email adapter. MDX pipeline for `/company/news`
and `/intelligence/research`, with three research notes and two news items
marked `draft: true`.

## Phase 7 — Polish ✅

`sitemap.ts`, `robots.ts`, OG image route at `/api/og` with the chrome
treatment, JSON-LD (Organization + SoftwareApplication), branded 404 and 500,
favicon from the wing mark, status page backed by `/api/status`.

## Verified

- `npm run verify` — typecheck, lint and copy guard all clean.
- Production build: 56 routes, homepage first load 176 kB.
- Zero console errors on `/`, `/platform/emil`, `/brokers/white-label` and
  mobile, in both themes.
- No horizontal scroll at 390 / 768 / 1440 (`window.scrollX` stays 0).

## Open items

- **Hero images.** Not in the repo — see `public/hero/README.md` for the three
  filenames. Presence is checked server-side, so a missing file makes no
  request and the hero falls back to the gradient and grid.
- **Logo.** `RaptorLogo` composes the lockup from type plus the abstracted
  wing. Drop `public/brand/raptor-logo.png` in and swap it in that one file.
- **Phone country code.** The supplied number is `+91 9698 000 999` — an
  Indian dialling code against a UK headquarters. Used exactly as given; worth
  confirming it is the intended public number.
- **Supabase migration not applied.** `supabase/migrations/0001_leads.sql` is
  written but has not been run against the project. Forms validate and respond
  correctly without it; they just do not persist.
- **Legal review.** Every `/legal/*` page carries a visible note that it is a
  draft prepared alongside the site and needs counsel.
- **Product links.** `/experience` currently redirects to `/request-demo`.
  Point it at the real terminal when it is available (one line in
  `next.config.mjs`).
- **Accessibility.** Contrast pairs were computed by hand and keyboard paths
  spot-checked; a full axe pass has not been run.
- **Cross-browser.** Not yet checked on iOS Safari, which matters most for the
  `backdrop-filter` glass surfaces.
