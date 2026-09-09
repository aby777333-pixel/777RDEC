# DECISIONS

Choices made without blocking, with the reasoning. Reverse any of these freely.

## 1. Light theme is a first-class palette, not an inversion

The super prompt specifies a dark-only palette. The site owner asked for a
dark/white toggle, so `globals.css` defines two complete palettes and every
Tailwind colour resolves to a CSS variable. The light palette is not the dark
one inverted: `--chrome` becomes a *dark* brushed gradient so it reads on
paper, and `--signal` darkens from `#7DD3FC` to `#0369A1` so it clears 4.5:1
on white. The dark palette uses the prompt's values exactly.

Verified contrast (both directions): `--steel-500` on `--bg-2` is 5.7:1 dark
and 5.5:1 light. `--signal` on `--bg-0` is 12.2:1 dark and 5.9:1 light.

The toggle is three-state (light / dark / system) via `next-themes`, with
`defaultTheme: 'dark'` so the logo's own environment is what a first-time
visitor sees.

## 2. Copy is derived from the super prompt, not from `/docs/brief.md`

The prompt names `/docs/brief.md` as the source of truth for what the site
says, but that file is not in the repository. Every headline the prompt quotes
as approved copy is used verbatim; everything else is written to the
positioning the prompt describes. **If the real brief exists, the copy
dictionaries in `src/lib/copy/` are the only files that need to change.**

## 3. The logo is rendered as type plus the abstracted wing

`/public/brand/raptor-logo.png` is not in the repository. Rather than ship a
missing-image placeholder, `RaptorLogo` composes the `777` numeral in the
chrome gradient, `RAPTOR` in the display face, and the five-diagonal wing the
design system already permits as the raptor motif. It is crisp at every size
and re-themes automatically. Swapping in the raster asset is a change to that
one component.

## 4. Supplied hero images are referenced, not embedded

Four images were provided in conversation but did not reach the filesystem, so
nothing could be embedded. `lib/brand-assets.ts` names the three paths the site
expects and checks for them **on the server at render time**, so a missing file
produces no request and no 404 in the console — `<HeroImage>` simply falls back
to the gradient and hairline grid. Drop the files in and they appear; see
`public/hero/README.md`.

## 5. No Three.js

The brief allows WebGL for a hero terminal scene and a session globe. Neither
is built: the terminal is out of scope (§11) and the globe was not reached, so
`@react-three/fiber` is not a dependency. Adding it later affects nothing else.

## 6. `noUncheckedIndexedAccess` is off

`strict: true` is on, plus `noUnusedLocals` and `noUnusedParameters`.
`noUncheckedIndexedAccess` was tried and removed: across the indicator and
price-engine code it produced defensive noise rather than caught bugs.

## 7. Correlation and treemap values are fixed, not simulated

A correlation figure that changes on every page load invites a visitor to read
it as live market data. Both the heatmap and the exposure treemap use fixed,
plausible values with a visible note that they are illustrative.

## 8. Cookie banner gates the analytics script itself

Consent does not set a flag that a script then checks — the `<Script>` element
is not rendered at all until consent is granted, and `analyticsEnabled` is
false when no Plausible domain is configured. Declining means no third-party
request is ever made.

## 9. The white-label logo upload never leaves the browser

`FileReader.readAsDataURL` only. No network call, no Supabase storage, and the
UI says so where the control is.

## 10. Contrast was computed, not eyeballed

Both palettes were checked by hand against WCAG. `--steel-500` on `--bg-2` is
5.7:1 dark and 5.5:1 light. `--signal` on `--bg-0` is 12.2:1 dark and 5.9:1
light. The light-mode chrome gradient's lightest stop was moved from `#8A8F98`
to `#757A82` (3.3:1 → 4.3:1 on white) so headlines clear AA rather than only
AA Large.

## 11. The terminal and sandbox were removed

An earlier pass built a simulated trading terminal, a seeded price engine in a
Web Worker, a depth ladder, an order ticket with pre-trade risk refusals, a
`/experience` sandbox and an interactive EMIL arm/disarm control panel. All of
it worked, but the real terminal and apps are supplied separately, so
reimplementing them here would only create something to throw away.

**Removed:** `lib/sim/*`, `lib/sandbox/*`, `lib/indicators.ts`,
`lib/emil/machine.ts`, `components/sandbox/*`, `TerminalFrame`, `CrmFrame`,
`LwChart`, `DepthLadder`, `EmilControlPanel`, `ArmDialog`, `EmilLog`,
`EmilStrip`, and the `(experience)` route group. The
`lightweight-charts`, `zustand` and `decimal.js` dependencies went with them.
Homepage first load dropped from 235 kB to 176 kB.

**Kept**, because these are marketing devices rather than product
reimplementations: the correlation matrix and exposure treemap (fixed,
illustrative, labelled as such), the gauges, the ecosystem diagram, the EMIL
pillars and operating-mode illustrations, the EMIL status card, and
`PortalFrame` — which exists so the white-label section can re-skin something
live in the browser.

**Consequences.** `/experience` now redirects to `/request-demo` (one line in
`next.config.mjs`) so the URL keeps working and is reserved for the real
product. The nav's primary call to action is Request Demo. Legal copy that
described interactive simulations was rewritten to describe illustrative
figures instead, which is now what is actually true.

It is all recoverable from git history if any of it becomes useful.

## 12. The Supabase migration is written but not applied

`supabase/migrations/0001_leads.sql` creates the three lead tables with RLS
enabled and no policies. It has not been run against the project — creating
tables in a live database is the owner's call, not a side effect of building a
website. The forms validate and respond correctly without it; they log rather
than persist until `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
