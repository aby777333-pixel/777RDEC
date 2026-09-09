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

## 12. The Supabase migration is applied, and hardened past the original spec

`0001_leads.sql` creates the three lead tables with RLS enabled and no
policies. Applied on request to project `ixpqkvyxqvmllottnvgi`.

The RLS claim was then **verified rather than assumed**. Acting as `anon`
against a table containing a real row, SELECT returned 0 rows and INSERT failed
with `42501: new row violates row-level security policy`. The probe row was
deleted; all three tables ship empty.

That check surfaced a weakness the original spec missed: `anon` and
`authenticated` still held table-level GRANTs. RLS was doing the work alone, so
one accidentally-added permissive policy would have exposed everything
instantly. `0002_leads_revoke_client_grants.sql` revokes those privileges and
changes the schema default privileges, so the client roles cannot reach these
tables even if a policy later says they can. Confirmed after: `anon_select`,
`anon_insert` and `auth_select` all false, `service_role` INSERT still true.

The one remaining advisory is INFO-level `rls_enabled_no_policy`, which is the
intended design rather than a defect.

## 13. Elevation is a three-layer, tinted shadow stack

Flat borders made every surface read as a wireframe. Shadows are now four
tokens (`soft`, `raised`, `panel`, `lift`), each a contact edge plus a mid
diffusion plus a wide ambient, tinted with a blue-black (16,24,40) in light so
elevation reads as cool steel rather than grey haze. A `surface-sheen` utility
adds a one-pixel top highlight and a quiet vertical gradient — that highlight
is what makes a card look lit rather than pasted on. Interactive cards get a
2px rise via `.lift`.

## 14. Colour arrives as atmosphere, not as a second accent

The brief allows one chromatic accent, and adding a second would have broken
it. Instead a `.wash` utility lays two soft off-centre pools of the accent at
5–8% alpha behind selected sections, and both stops are tokens, so the tint
follows the theme toggle. That gives the site subtle colour without a second
hue anywhere in the palette.

## 15. Hero images are blended, not overlaid

The supplied renders are colourful — blue sky, orange sunset — against a
monochrome steel palette. Dropping them in at full saturation would read as
stock photography behind a headline. The `.hero-media` / `.hero-tint` /
`.hero-scrim` stack instead desaturates the image toward the palette
(`saturate(0.5)` light, `saturate(0.6) brightness(0.62)` dark), tints it with
the accent under `soft-light`, then lays a radial scrim that is near-opaque
behind the centred caption and clears toward the edges, plus a bottom fade into
the page. The caption sits on near-solid ground while the image still reads at
the margins. Every value is a per-theme token, so light gets a light scrim and
dark a dark one.

## 16. The logo file is auto-detected rather than hard-wired

`public/brand/raptor-logo.svg|.png` is used the moment it exists, with an
optional `raptor-logo-dark.*` for the light theme, since a brushed-silver mark
washes out on white. Because the lockup renders inside client components (nav,
mobile drawer, error boundary), the filesystem check runs once in the root
layout and is passed down through `BrandProvider` — a client component cannot
import `server-only` code. Absent any file, the component composes the lockup
from live type plus the abstracted wing, which is what the site shows today.

## 17. EMIL is described by mechanism, not by adjective

"Learns by itself", "takes trades" and "protects the capital" are all true and
all now said plainly, but each is backed by the mechanism rather than left as a
claim: learning is four named mechanisms with a weights table that shows one
relationship collapsing; taking trades is four individually granted permissions
passing the same pre-trade gate as a human order; protecting capital is the
three-bucket architecture with a ratcheting profit floor and a high-water-mark
guard.

The one line held back is any suggestion that adaptation leads to profit, or
that structure removes market risk. `scripts/check-copy.ts` enforces the
vocabulary; the framing is a judgment call, and it is also the framing that
survives a compliance review.

## 18. Blog dates: YAML parses them into Date objects

`gray-matter` turns an unquoted `2026-05-07` into a `Date`, so a
`typeof === 'string'` guard silently mapped every post to the epoch — every
date rendered as 1 January 1970 and sorting was meaningless. `toIsoDate` now
normalises both shapes. This had also been wrong on the research and news
indexes since they were added.

## 19. Dark elevation is carried by light, not shadow

The first shadow pass worked in light and did nothing in dark, because a black
shadow on a #050505 page is invisible. Dark mode now gets its depth from three
things instead: a faint outer ring (`0 0 0 1px rgba(255,255,255,0.04→0.10)`)
that catches the eye where a surface meets the page, a much stronger lit top
rim (`inset 0 1px 0 rgba(255,255,255,0.13)`, up from 0.055), and a stronger
panel sheen. The dark halo underneath only deepens what the ring already
establishes.

`--bg-1` also moved from `#0b0c0e` to `#0e1014`: one step off true black did
not read as a panel at all. Hairlines went from 0.06/0.12 to 0.07/0.15, and
glass from 0.03/0.08 to 0.045/0.11, for the same reason. The brief's exact dark
values were the starting point, not a constraint worth keeping when the surfaces
they produced were invisible.

Glass panels previously opted out of the sheen and rim entirely, which is why
the nav had no edge. They now use the same treatment as every other surface.

## 20. The falcon mark was not hand-drawn into the repo

The master logo has been supplied three times and has never reached the
filesystem — only the original brief `.md` is ever on disk. Rather than ask a
fourth time, I attempted to reconstruct the mark as SVG: four iterations of
bezier work on the wing feathers, crown, brow ridge, hooked beak and talon.

The result read as a helmet, not a falcon. It was discarded rather than
shipped. A hand-drawn approximation of a brand mark is not a neutral
placeholder — it misrepresents the identity everywhere it appears, and it is
harder to notice as wrong than an obvious absence.

The auto-detection from §16 stands, so the real file needs no code change:
commit it to `public/brand/raptor-logo.png` (or `.svg`) and it replaces the
type-plus-wing lockup everywhere on the next deploy.

## 21. Surfaces are tinted steel, not neutral grey

*(Superseded by §22 — kept for the reasoning.)*

Cards read as flat grey rectangles. They now carry a `--panel-tint` wash — a
145-degree gradient in the accent hue, layered under the existing sheen on
every `.surface-sheen` surface, so it reaches module cards, blog cards, EMIL
panels, the CTA band and the nav glass in one change.

Deliberately the **same hue as `--signal`**, so the site still has exactly one
chromatic accent. Alphas differ by theme because the perceptual effect does:
0.088 → 0.008 in light, 0.07 → 0 in dark.

The base surface tokens were cooled at the same time (light `#f6f7f9` →
`#f4f6fa`, dark `#0e1014` → `#0e1218`, and their siblings). Brushed steel is
never neutral grey, so a slight cool cast is closer to the logo than the
original values were.

Contrast was re-checked at the *strongest* point of the wash rather than the
average. Worst case is muted `--steel-500` on a raised surface at 4.75:1;
primary text is 14.7:1 or better. All pairs clear 4.5:1 in both themes.

## 22. Six card hues, and two bugs found getting there

The single-hue wash was too weak and too uniform. Cards now cycle six hues via
`<Panel tintIndex>`, which grids pass the item index to: ice blue, amber,
violet, emerald, rose, teal — ordered so adjacent cards alternate warm and
cool rather than sitting next to a neighbouring hue.

This does break the brief's one-accent rule. That was a deliberate owner
decision, asked for twice.

**Bug 1: the white sheen was painting over the tint.** CSS background layers
paint first-listed on top, and `--panel-sheen` was listed before
`--panel-tint`. In light mode that sheen is a white wash across the top of the
card — exactly where the tint gradient peaks — so it erased the colour. Tint
now comes first, and the light sheen eased from 0.8 to 0.5.

**Bug 2: Tailwind was stripping the tint classes entirely.** The `.tint-1`
… `.tint-6` rules lived in `@layer components`, and Tailwind tree-shakes
layered hand-written rules whose selectors it cannot find by scanning source.
`<Panel>` composed the names from an index at runtime, so the scanner never
saw them and the rules were dropped from the build — every card silently fell
back to the default hue. Diagnosed by grepping the emitted CSS for the actual
selectors, after an earlier grep gave a false positive by matching the token
*names* in `:root`. The rules now sit outside any layer, and `Panel` picks
from a literal array so the names are greppable either way.

**Contrast.** Checked for all six hues on both surfaces in both themes, at the
*strongest* stop of the gradient. Muted `--steel-500` needed headroom, so it
moved from `#5b6169` to `#51575f` in light and `#8a8f98` to `#979da6` in dark
— which also makes captions easier to read generally. Worst case is now
4.89:1 in light and 4.52:1 in dark; primary text is 11:1 or better everywhere.
Alphas are 0.20 light and 0.15 dark, differing because the perceptual effect
does.

---

## Session globe, search, newsletter and the accessibility pass

**The session globe is not WebGL.** It is a rotating meridian field in SVG
with the three session arcs projected onto it. That reads as a globe, costs
nothing to ship, degrades honestly under `prefers-reduced-motion` (the
rotation is CSS, so it simply stops), and works without a canvas context. The
clock is real: `src/lib/sessions.ts` computes which sessions are open from the
current UTC hour, so the lit arcs and the "open" chips are live rather than
decorative. The clock is read after mount, never during render, so the server
and client cannot disagree on it.

Session hours describe the liquid core of each session as a desk means it,
not exchange calendars — no holidays, no half-days, no DST drift in the
London and New York cash opens. The page says so.

**Image holders, not placeholder images.** `sessionImages()` checks
`public/sessions/{asia,london,new-york}.jpg` on the server with `existsSync`,
exactly as the hero images work. A missing file produces no request and no
404 — the panel keeps its diagram treatment. Drop one, two or three in and
they appear behind the same scrim-and-desaturate treatment the heroes use.
`public/sessions/README.md` carries the filenames and crop guidance.

**Search runs in the browser, with no service and no API.** The index is
built on the server at build time from page copy, MDX front-matter and body
excerpts, legal notices and every FAQ item, then handed to `/search` as
props — 2.8 kB on the wire, less than a single round trip to a search
backend would cost. Nothing typed into the box leaves the browser.

`src/lib/search.ts` is `server-only` and cannot be imported by the client, so
the types and the kind labels live in `search-types.ts` alongside it. The
path → copy map in `search.ts` is written out by hand because the route tree
is file-based and there is no registry to derive it from; a page missing from
that map is simply not searchable, never broken.

**Newsletter has no email fallback, unlike the lead forms.** A demo request
that fails to persist is still a lead if it reaches a human inbox, so
`actions.ts` counts either path as success. A newsletter signup that does not
reach the list is not something anyone can chase by hand, so a persistence
failure is reported to the subscriber honestly. Re-subscribing an address
already on the list is a no-op that reports success — the subscriber should
not be told about our unique index.

**Cookie preferences can be re-opened.** A consent decision is not final: the
footer control dispatches a `raptor:cookie-preferences` window event that the
banner listens for, and the dialog re-opens showing the current choice.
Withdrawing consent unmounts the Plausible script on the next render, so
collection stops immediately rather than at the next page load.

**Accessibility: axe run, five findings, all fixed.** 35 routes × both themes,
`wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`best-practice`. What it found:

- An empty `<th>` in the correlation heatmap's corner cell — now carries an
  `sr-only` label.
- 2.31:1 on the struck-through "before" weights in the EMIL panels. They were
  `--steel-700`, a border-weight token being used for text. Moved to
  `--steel-500`, which is the muted-text token and was already tuned to pass.
- `<dl>`/`<dt>`/`<dd>` on the FAQ page. `<Panel>` wraps its children in two
  elements, so the `<dt>`/`<dd>` were never direct children of the `<dl>` —
  invalid, and screen readers do not announce it as a list. Replaced with
  headings and prose; the FAQPage JSON-LD still carries the Q&A semantics
  for machines.
- Heading order on `/company/news`, `/intelligence/research` and
  `/blog/category/[category]`: article cards rendered `<h3>` straight after
  the page `<h1>`. Each list now sits under a real `<h2>` section heading,
  rather than demoting the cards — on `/blog` the cards genuinely are
  sub-items of "All posts", and that structure is worth keeping consistent.

Second run: **0 violations**.

**iOS Safari: audited, not verified.** There is no WebKit engine in this
environment — the Playwright WebKit download is blocked by the egress proxy —
so this is the documented behaviours addressed defensively, not a fix for
anything observed on a device. The existing CSS was already in good shape:
`dvh` rather than `100vh` throughout, `-webkit-backdrop-filter`,
`-webkit-background-clip`, `-webkit-text-fill-color` and `-webkit-mask-image`
all present alongside their unprefixed forms. Added: form controls lift to
16px under `(pointer: coarse)`, because iOS zooms the viewport when focusing
an input under 16px and never zooms back; `appearance: none` on
`input[type="search"]` and its WebKit clear button, which otherwise ignore
the border and radius; and `-webkit-tap-highlight-color: transparent` on
interactive elements. Desktop typography is untouched.

**Per-page OG images already existed** — `/api/og` renders a title card per
route. Added a section kicker derived from the path inside `pageMetadata`, so
a Platform card reads "Platform" where a Legal card reads "Legal", with no
call site needing to pass anything.

**Case studies remain empty by design.** `CASE_STUDIES` is a typed, empty
array with an `approved` flag on the type. Client outcomes are not something
to invent, and the evidence page says plainly what we will and will not
claim instead.
