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
nothing could be embedded. `lib/brand-assets.ts` names the paths the site
expects and `<AmbientHero>` renders a CSS/SVG treatment when a file is
absent. This also keeps the prompt's "zero stock photography" rule intact by
default: the product visuals are all live components.

## 5. No Three.js yet

The prompt allows WebGL only for the hero terminal scene and the session
globe. The hero is more convincing as real DOM — actual Lightweight Charts, an
actual ticking ladder, actual tabular numerals — so it is built that way, with
a CSS perspective tilt. The session globe is not built yet, so `@react-three/fiber`
is not a dependency. Adding it later does not affect anything else.

## 6. `decimal.js` is installed but not yet load-bearing

Sandbox P&L is display-only and currently formatted with `toFixed`, which
cannot produce floating-point artefacts at these magnitudes. `decimal.js` is
in `package.json` for the order-ticket work in Phase 5, where accumulated
arithmetic starts to matter.

## 7. `noUncheckedIndexedAccess` is off

`strict: true` is on, plus `noUnusedLocals` and `noUnusedParameters`.
`noUncheckedIndexedAccess` was tried and removed: across the indicator and
price-engine code it produced defensive noise rather than caught bugs.

## 8. Correlation and treemap values are fixed, not simulated

A correlation figure that changes on every page load invites a visitor to read
it as live market data. Both the heatmap and the exposure treemap use fixed,
plausible values with a visible note that they are illustrative.

## 9. Cookie banner gates the analytics script itself

Consent does not set a flag that a script then checks — the `<Script>` element
is not rendered at all until consent is granted, and `analyticsEnabled` is
false when no Plausible domain is configured. Declining means no third-party
request is ever made.

## 10. The white-label logo upload never leaves the browser

`FileReader.readAsDataURL` only. No network call, no Supabase storage, and the
UI says so where the control is.
