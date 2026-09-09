# 777raptor.com

The public marketing website for 777 Raptor — a trading technology provider.

**Scope:** this repository is the website only. The Raptor Terminal, EMIL
cockpit, CRM and client portal are separate applications, supplied separately,
and will be linked or embedded here later. Nothing here simulates them.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run verify       # typecheck + lint + copy guard
npm run build        # copy guard runs first, then next build
```

Node 20 or newer.

## Stack

Next.js 14 (App Router, `src/`) · TypeScript strict · Tailwind over a
CSS-variable token layer · Framer Motion · Radix primitives (unstyled) ·
Zod · MDX via `next-mdx-remote` · Supabase for lead capture · Netlify.

## Layout

```
src/
  app/
    (marketing)/     every public page
    (legal)/         /legal/[slug]
    api/og           OG image generator
    api/status       JSON source for the status page
    design-system/   internal QA surface, noindex
  components/
    ui/              button, chip, panel, eyebrow, chrome-text, code-block…
    layout/          nav, mega-menu, mobile drawer, footer, cookie banner
    home/            one file per homepage section
    emil/            EMIL marketing surfaces
    charts/          correlation matrix, treemap, gauge
    diagrams/        ecosystem diagram
    frames/          PortalFrame (used by the white-label demo)
    forms/           the shared lead form
    content/         MDX rendering
  lib/
    brand.ts         all brand + legal constants
    copy/            typed copy dictionaries, one per area
    forms/           schema, server actions, Turnstile
    supabase/        server-only client
    seo.ts, content.ts, status.ts, analytics.ts, email.ts
content/             MDX for news and research
supabase/migrations/ lead tables
scripts/check-copy.ts
```

## Conventions worth knowing

**Copy lives in `src/lib/copy/`.** Page text is never inline. Changing what the
site says means editing a dictionary, and translation is a file swap.

**Brand and legal constants live in `src/lib/brand.ts`.** The entity name,
company number, registered address, technology-provider disclosure and risk
line are defined once and rendered from there.

**Colour never appears as a literal.** Every colour resolves to a CSS variable
defined twice in `src/styles/globals.css`, once for light and once for dark.
Use the Tailwind tokens (`bg-bg-1`, `text-steel-300`, `border-line-2`,
`text-signal`) so both themes stay correct. `/design-system` renders every
token and component in both themes.

**The copy guard blocks forbidden claims.** `scripts/check-copy.ts` fails the
build if any file under `src/`, `content/` or `docs/` contains a banned
marketing claim. It runs before `next build`, so it cannot be skipped.

**One accent.** `--signal` is the only chromatic accent, plus up / down /
armed / warn for state. If a section needs more colour, use more contrast in
steel.

## Environment

Copy `.env.example` to `.env.local`. Everything is optional in development:

| Variable | Effect when unset |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Forms validate and respond, and log instead of persisting |
| `RESEND_API_KEY`, `DEMO_NOTIFICATION_TO` | Notifications print to the console |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Honeypot is the only bot control |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No analytics script is injected at all |

The service-role key is used only in Server Actions and never reaches the
browser. The lead tables have RLS enabled with no policies, so the anon key
cannot read or write them.

## Before launch

`PLAN.md` tracks what is built; `DECISIONS.md` records the choices made and
why. The outstanding items are listed at the end of `PLAN.md` — the short
version:

1. Add the hero images (`public/hero/README.md`) and the logo raster.
2. Confirm `REGISTERED_ADDRESS` in `src/lib/brand.ts` — it is `TODO_CONFIRM`.
3. Apply `supabase/migrations/0001_leads.sql`.
4. Have counsel review `/legal/*`.
5. Point `/experience` at the real terminal (one line in `next.config.mjs`).
