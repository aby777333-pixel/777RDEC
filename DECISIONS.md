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

---

## Bigger logos, and the nav collision that was hiding behind them

Asked to make the logos bigger. Measuring first turned up a pre-existing bug
that a larger logo would have made much worse: **the menu bar was already
colliding with the right-hand controls** at common laptop widths. At 1024px
"Blog", "Company" and "Developers" ran straight through the theme toggle and
the Request Demo button; at 1280px "Developers" sat under the search icon.
Only at 1440px and above was there clearance. Adding the search control the
day before had taken ~44px out of an already-negative budget.

So the sizing change came with a fix:

- **The menu bar now appears at `xl` (1280px) rather than `lg` (1024px)**, and
  the drawer covers everything below it. Between 1024 and 1280 the six mega-menu
  groups plus a logo plus four right-hand controls simply do not fit on one
  line, and a hamburger is a better answer than overlapping text.
- **Dropped the "Platform" ghost button** from the header. It duplicated the
  Platform mega-menu group and its overview link, and it cost ~84px in the
  worst-affected range.

Logo sizes: nav 40 → **48px**, footer 64 → **96px**, drawer 28 → **36px**, and
the header grew 64 → **80px** to give the nav mark room to breathe. The lockup
is ~2:1, so width follows height — the `max-w` caps are a backstop against a
replacement file with a different aspect ratio, not the binding constraint.
`scroll-mt-24` (96px) still clears the taller header, so in-page anchors are
unaffected.

Verified across sixteen widths from 360 to 2560: no overlap anywhere, the
drawer opens at every width where the menu bar is hidden, and axe is still at
0 violations.

## 23. The twenty modules, and a hue that does not repaint the card

Two surfaces were supplied as screenshots: a "20 Indigenous Modules" grid, and
the terminal's own Trading / Portfolio / Tools menus. Both are additive — no
existing section moved, and no existing component changed.

**Where they went.** The module grid is a homepage section, between the
ecosystem flow and the EMIL reveal: the flow says the pieces connect, the grid
says what the pieces are. The workspace map went on `/platform/terminal`
instead, because those three menus *are* the terminal's navigation and mean
nothing away from it.

**It lists, it does not simulate.** The workspace map renders labels and
descriptions, not a fake application shell — §11 removed a simulated terminal
and that decision stands. The section carries a visible note saying the
terminal is supplied separately.

**A new `.hue-N` alongside `.tint-N`.** The screenshots show a flat card with a
single coloured dot. `.tint-N` could not express that: it also sets
`--panel-tint`, which repaints the entire card surface. Twenty repainted cards
in one grid is a rainbow, not a design.

So `.hue-1` … `.hue-6` set only `--tint-rgb` and `--tint-ink` — the same six
per-theme tokens, without the wash. `--panel-tint` then falls through to its
`:root` default, so the card keeps its ordinary surface while the dot, the icon
and the group rule carry the hue. Verified re-tinting with the theme: the first
dot is `#7dd3fc` in dark and `#0369a1` in light, resolved from the tokens
rather than written down anywhere.

The rules sit outside `@layer` for the same reason as `.tint-N` — the class
names are composed from an index at runtime, so Tailwind's content scan cannot
see them.

**Hues are assigned, not cycled.** Twenty cards through six hues in a five-column
grid produces diagonal stripes. The hue is a field on each module instead, so
related modules share a colour.

**Icons are keyed, not imported into copy.** `WorkspaceIconKey` is a closed
union in the copy dictionary and the component holds a `Record` over it, so an
item added without an icon fails `tsc` rather than rendering an empty slot.
The copy file stays a plain string dictionary, which is what makes translation
a file swap.

**Verified.** `npm run verify` clean; production build clean at 75 static pages;
homepage first load 176 → **177 kB** against the 350 kB budget. All twenty
modules and all twenty-three workspace items render, every icon resolves, no
console errors, and heading order is unbroken on both pages. The page still
does not scroll horizontally at 390px — `scrollX` stays 0, and removing the new
section leaves `scrollWidth` unchanged at 564px, so the surplus is the
pre-existing decorative `WingMark` and the correlation table inside its own
scroll container, not this change.

**Unconfirmed copy, carried as given.** The supplied text names third parties
and specific figures — `155+ indicators`, `40+ PSP connectors`, `FIX 4.4/5.0`,
`Claude-powered`, `Bloomberg, CNBC, Yahoo Finance`, `TradingView widget suite`,
`MT5/cTrader`. It is used verbatim, and flagged `TODO_CONFIRM` in
`copy/modules.ts`, on the same standard as the integrations directory. Note
also that "RAPTOR AI — Claude-powered intelligence layer" sits alongside EMIL,
which the rest of the site calls the intelligence layer; worth reconciling.

## 24. The modules page indexes what it does not render twice

`/platform/modules` exists so the twenty modules have somewhere to link and
somewhere to be found. Three things fell out of building it.

**The page is composed, not `<StandardPage>`.** `StandardPage` renders a
`<ModuleGrid>` whenever `copy.modules` is non-empty — which would have put the
same twenty modules on the page twice, once as the five-column grid and once as
the three-column tinted one. The page uses `PageHero` + `AnswerGrid` +
`IndigenousModules` + `CtaBand` instead, which is `StandardPage` minus that one
section. All four are already exported.

**`copy.modules` is kept anyway, and derived.** `buildSearchIndex` reads
`copy.modules.flatMap(m => [m.title, m.body])`, and that is the only reason
module names are searchable. So the field stays, populated from
`INDIGENOUS_MODULES.map(...)` rather than typed out again: adding a
twenty-first module makes it searchable with no second list to remember. The
field is indexed but not rendered *from*, which is worth knowing before someone
deletes it as dead data — there is a comment on the page saying so.

**A hidden heading was the wrong fix.** The page variant first dropped the
section's `<h2>`, since the hero already said the same thing. That left the
twenty module `<h3>`s following the page `<h1>` directly, which is an axe
`heading-order` violation and would have broken the 0-violation run. Rather
than paper over it with an `sr-only` heading, the `<h2>` stayed and the `<h1>`
changed to "Built, not assembled." — so the hierarchy is real and neither
heading repeats the other.

`IndigenousModules` takes one prop, `variant`. `section` (the homepage) carries
the eyebrow, the lead and a link on to the page; `page` carries the heading
only, because the hero above it already has the rest and a link there would
point at the current route.

**Verified.** Build clean at 76 static pages, homepage unchanged at 177 kB.
Search returns `/platform/modules` and nothing else for `cTrader`,
`leaderboards`, `KYC/AML` and `Institutional dealing workstation`, and ranks it
first for `funded accounts`; the index grew to 80 documents. Five columns at
1440, one at 390, no horizontal scroll at either, no heading skips, no console
errors. The Platform mega-menu now carries six links plus the overview with no
overlap and nothing offscreen — the §"Bigger logos" collision fix is untouched,
since no top-level nav item was added.

## 25. A bigger mark, and two backdrops written rather than copied

### The logo, and the collision it brought back

Nav mark 48 → **64px**, header 80 → **88px**, drawer 36 → 40px. `scroll-mt-24`
is 96px, so in-page anchors still clear the header and nothing else was
coupled to its height.

At ~2:1 a 64px mark is ~132px wide against ~96px before, and those 36px come
straight out of the menu bar's horizontal budget — the budget §"Bigger logos"
already found to be negative once. Measuring at 1280 turned the bug up again:
**"Developers" overlapped the search control by 3px.** Small, but it is the
same failure, and 1280 is the width where the menu bar first appears, so it is
the worst case by construction.

Rather than give back the size that was asked for, the space came from the menu
itself: trigger padding `px-2.5` → `px-2`, four pixels across seven triggers,
28px recovered against 3px needed. Re-measured at 390, 1279, 1280, 1366, 1440,
1920: **zero overlaps everywhere**, the drawer still appears at every width the
menu bar is hidden, and the page still does not scroll horizontally at 390.

### The two backdrops

Supplied as CodePen links: "Grid Run" by Matthias Hurrle (@atzedent) for the
hero, and "Day54: WebGL Particle Animation" by kenjiSpecial for the closing
band. Both were implemented against the *idea* rather than copied.

**Why not copy.** Two reasons, and the second is the load-bearing one.

1. Neither pen carries a licence. CodePen does not blanket-license public pens
   — authors keep copyright — so lifting either wholesale onto a commercial
   site is a question for someone other than an engineer. Each component names
   its source in a header comment.
2. They would not have survived contact with this codebase. Grid Run marches
   **400 steps per pixel** and runs soft shadows and ambient occlusion inside
   that loop; it is a full-screen demo that ships its own code editor and
   defaults to half resolution because it has to. Day54 keeps 40,000 particles
   in JavaScript arrays and rewrites the entire vertex buffer every frame.
   Either one, dropped under a marketing hero at full intensity, is a phone
   with a hot battery and a wrecked Lighthouse score.

**What was built instead.** `LatticeBackdrop` keeps the repeating strut-and-node
cell and the travel along Z, but accumulates proximity glow rather than
resolving surfaces: one 64-step loop, no shadow march, no AO. Behind a scrim at
low opacity the difference is not visible. `ParticleBackdrop` uploads each
particle's orbit once and advances it in the vertex shader, so per frame the CPU
sets one uniform — the count also scales with the area it covers, so a phone
draws a fraction of what a desktop does.

**Neither is Three.js**, so §5 stands. Both pens were raw WebGL too, which is
what made this possible; the pair costs **3 kB** of the homepage bundle.

**They obey the rest of the system.** Colour is read from `--signal` and
`--steel-700` through `tokenRgb`, re-read on theme change, so no literal reaches
the GLSL and both themes stay correct. Output uses straight alpha so the page
background shows through the gaps rather than the canvas painting its own
ground. The shared hook pauses on `visibilitychange`, pauses when the canvas
leaves the viewport, and draws a **single static frame** when motion is reduced
— watching `data-reduce-motion` so the site's own toggle works without a
reload. If `getContext` or either shader fails, the canvas stays blank and the
section looks exactly as it does today.

**Placement keeps legibility someone else's problem.** The lattice sits at
`-z-20`, *below* `<HeroImage>`, so the existing wash, tint and radial scrim
still do the work. The closing band got the same treatment with a radial scrim
of its own rather than re-solving contrast against moving particles.

**Verified.** Both shaders compile, link and render — tested in a fresh context
with `preserveDrawingBuffer`, 80% of pixels lit for the lattice and all five
attributes bound for the particles. Both live canvases take a WebGL2 context and
get sized by their renderer. Build clean at 76 pages, homepage first load 177 →
**180 kB** against the 350 kB budget. No console errors, no heading changes, no
horizontal scroll.

**Not verified: how any of it looks.** The preview pane could not paint in this
environment, so everything above is structural and numeric. The backdrops need
one human look before they are trusted in front of anyone.

## 26. The backdrops were running perfectly and looked broken

Two separate causes, reported as one symptom.

**A latched flag.** `useCanvasBackdrop` kept `onScreen` as a boolean the
IntersectionObserver wrote. A hidden tab makes the observer report *not
intersecting*, so the flag latched `false`; when the tab came back,
`visibilitychange` re-ran the check against that stale `false` and never
restarted the loop. Switching windows once killed the canvas permanently.

Caught by measurement, not by looking: with the tab reporting `visible`,
reduce-motion off and WebGL2 available on a real Intel GPU, `requestAnimationFrame`
was called **zero times in 700ms**. The observer now only says *when* to
re-check; `isOnScreen()` measures the rectangle and cannot go stale.

**Orbits nobody could see move.** Particle angular velocity was 0.035–0.10
rad/s — one revolution every **63 to 180 seconds**. Running at full frame rate
and indistinguishable from a still image. Now 0.14–0.40 rad/s, one revolution
every 16–45s, with the lateral drift period shortened to match so movement
reads near the centre too, where orbital travel is smallest.

The lesson is the cheap one: "is it animating" is a question about frame
callbacks, and it was answerable all along without being able to see the page.

## 27. Turning the particles up, and the contrast it cost

Asked to make the field more visible. Alpha multiplier .55 → .95, glow floor
.18 → .26, size curve and count up, canvas opacity to full. Measured offscreen:
lit coverage 5.5% → **25.4%**, mean alpha 1.7 → **26.2**, peak 89 → **242**.

Easing the scrim at the same time was a mistake. Compositing the new field under
it and measuring contrast against `--steel-100` in the headline band gave
**2.54:1** — under the 3:1 large text needs, and this site has run at zero axe
violations since the accessibility pass.

The fix is not a dimmer field. The scrim is now shaped like the copy it
protects: a flat core wide and short enough to cover the headline and both
buttons — `ellipse 62% 46%`, solid to 42% — then a long falloff to nothing, so
the field reads brightly above, below and either side of the text. Back to
**5.1:1**.

Worth stating plainly: a decorative backdrop is a contrast change. It is
measurable before anyone looks at it, and on this site it has to be measured.

## 28. A shorter hero, without touching the shared scale

Hero height at 1440px: **1204 → 1032px**, a 14% cut, with no change to what the
section contains.

Most of it was the headline. Two blocks of `text-h1` wrap to four lines, and
that scale is `clamp(3rem, 8vw, 8rem)` — 115px a line at 1440. But `text-h1` is
also every other page's `<h1>` via `PageHero`, and the closing band's `<h2>`.
Shrinking it globally would have quietly restyled the whole site to shorten one
section.

So the hero takes a local clamp, `clamp(2.625rem, 6.4vw, 6rem)` — 92px at 1440
— and the shared token is untouched. Verified after: `/platform/terminal` and
the closing `<h2>` still compute to 115px, the homepage `<h1>` to 92px.

The rest came from spacing: section padding `pb-20 pt-12 md:pb-28 md:pt-16` →
`pb-14 pt-6 md:pb-20 md:pt-10`, the stack gap 7 → 5 (6 at md), and the gap
above the ecosystem grid 16 → 10 (12 at md). Still four lines, still no
horizontal scroll at 390, 1440 or 1920, heading order unbroken.

Mobile is unchanged in character and still tall — 1506px at 390px, and that is
the six-tile ecosystem grid stacking, not the headline. Worth a separate look
if the mobile hero needs to come down too.

## 29. "No animation" was the site's own Reduce motion toggle

Three rounds were spent turning the particle field up, speeding its orbits,
fixing a latched intersection flag and adding a watchdog — all real defects,
none of them the reported fault.

Measuring in the user's actual Chrome, rather than the preview pane, answered
it in one call:

```
prefersReducedMotion    : false      <- not the OS
siteReduceMotionStored  : "true"     <- the site's own toggle
siteReduceMotionAttr    : "true"
```

The footer's "Reduce motion" control had been switched on and persisted to
`localStorage`. `html[data-reduce-motion='true'] *` disables every transition
and animation on the site, and the backdrop hook honours the same flag by
drawing one static frame. Everything was working exactly as designed; the site
had been told not to move.

The lesson is about instruments, not code. The preview pane throttles
`requestAnimationFrame` to roughly 1/s whether or not `visibilityState` says
"visible", so "is it animating" was unanswerable there — and a control test
would have shown that three rounds earlier. The moment the question was put to
a browser that runs frames normally, the cause fell out immediately.

Kept anyway, because each was a genuine fault: the latched flag (a hidden tab
permanently killed the canvas), the stall watchdog, the `loseContext()` footgun,
and the scrim that was larger than the field it covered.

## 30. Scroll controls, and where they had to go

A page-scroll control, one viewport per press. It sits on the right edge at
vertical centre rather than the usual bottom-right corner, because the cookie
banner already owns that corner at `fixed bottom-4 right-6 z-50` and two
floating controls competing for one spot is worse than an unfamiliar position.

Hidden entirely when the page does not scroll, so a short legal notice does not
carry a control that would do nothing. Each button disables at its end of the
page rather than disappearing, so the control never changes size under the
pointer. Scrolling uses `behavior: 'auto'` when motion is reduced — which, per
§29, is a setting worth remembering exists.

## 31. Backdrops at full strength, pointer-driven, layers off

Asked for the animations to behave as the source pens do, to respond to the
pointer, and for the layers over them to come off. All three, with one
consequence worth stating plainly.

**The layers are gone.** The hero no longer renders `<HeroImage>` at all — its
wash, tint, radial scrim, bottom fade and hairline grid were what kept the
lattice dim, and with no hero photo in `public/hero/` it was contributing
nothing else. The closing band's radial scrim is deleted. Both canvases now run
at full opacity with nothing above them. `<HeroImage>` is untouched and still
used by `PageHero` on every other page.

**Legibility moved onto the type.** Instead of a layer over the animation, the
hero `<h1>` and the closing `<h2>` carry
`drop-shadow(0 2px 22px var(--bg-0)) drop-shadow(0 0 6px var(--bg-0))` — the
page's own background colour as a token, no literal. This is weaker than a
scrim: §27 could guarantee a measured 4:1 in the headline band and this cannot,
because the shadow is a CSS filter over a live canvas rather than a compositing
step that can be sampled. That trade was the explicit instruction; it is
recorded here so it is a decision rather than a regression.

**Pointer, without stealing clicks.** Both canvases keep `pointer-events-none`,
so the hero's buttons and the closing CTAs stay clickable. The pointer is read
from `window` and eased inside `draw()` — the lattice steers its camera by it
(`uMove`, as the original pen does), and the particle field pushes away from it
with an exponential falloff measured in aspect-corrected space so the influence
is a circle on screen rather than an ellipse. The particle pointer parks
off-screen until a real pointer arrives, so touch devices that never hover see
an undisturbed field.

**The lattice is brighter, not just unblocked.** Glow 0.055 → 0.10, falloff
0.085 → 0.062, alpha 1.6 → 2.1, march 64 → 72 steps, resolution 0.5 → 0.6.

## 32. The pens' own colours, and Three.js for exactly one section

**Hero: Grid Run's grading, not the site's tokens.** Asked to keep the original
colours. The pen's look is its grading — a warm `vec3(1.2, .95, .9)` tint, the
`hue()` sweep, a double `tanh`/`sqrt` curve and an edge lift — and none of that
survives being expressed in `--signal` and `--steel-700`. So this one component
writes colour down, against the rule everything else on the site follows. It is
the pen's palette; substituting the brand's would be a different picture.

Alpha still comes from luminance rather than the pen's opaque output, so the
void stays see-through and the light theme is not turned into a dark box.

Aspect is untouched: like the original, `uv` divides by `min(uRes.x, uRes.y)`,
so a shorter hero crops the view rather than squashing it.

**Hero height: 1045 → 891px.** Headline clamp `6.4vw/6rem` → `5.2vw/4.75rem`,
tighter section padding and stack gap, and the ecosystem tiles' vertical padding
down a step. The shared `text-h1` token is still untouched.

**Closing: the singularity, and the Three.js exception.** "The Life of a
Singularity" by VoXelo replaces the particle field. It cannot be had without
Three.js — it is an instanced mesh of 5,000 streaks with a noise-morphed
vertex shader, a rim-lit horizon and ACES tone mapping — so §5 gets its first
exception, deliberately and in one place.

The cost is contained rather than accepted:

- `next/dynamic` with `ssr: false` puts Three in its own chunk, so the
  homepage's **First Load JS is unchanged at 180 kB**. The chunk is 348KB and
  is not on the critical path.
- The chunk is not even requested until the closing band is within 600px of the
  viewport. A visitor who never scrolls that far never downloads it.
- OrbitControls was dropped: a background that captures pointer events cannot
  be scrolled past. The camera auto-orbits and takes an eased offset from the
  pointer instead.
- GSAP was dropped: the state transitions are four-second eases over seven
  numbers, which is a lerp, not a reason to ship an animation library.
- The HUD text is not reproduced, as asked.

**Failure is non-fatal.** A refused context, a driver that rejects the
instanced shader, a device that runs out of memory on 5,000 instances — all of
it is caught and degrades to an empty canvas. Nothing in a decorative backdrop
is worth taking a section down for.

**Not verified: any of it running.** Every browser surface available here —
the preview pane and a Chrome tab alike — freezes `requestAnimationFrame` *and*
`IntersectionObserver` when the window is not focused, which was confirmed with
a control that fired zero times for a fixed element at the top of the viewport.
The build is clean and the shapes are right; whether the scene draws needs one
look from a focused window.

## 33. The hero blowout was exposure, not palette

First attempt at the pen's colours produced a milky white wash with the
headline barely readable. The palette was right; the exposure was not.

Grid Run's grading ends `tanh(col*col)` then `sqrt(col)`, and `sqrt` lifts
midtones hard — 0.25 becomes 0.5. That is flattering when almost every pixel is
near zero, which is true of the original because it resolves surfaces and most
rays hit nothing. My glow march lights *every* pixel to some degree, so the
lift had plenty to work with and took the whole frame with it.

Measured, rendering the two offscreen and reading the buffer back:

| | mean alpha | mean luminance | near-opaque | bright |
|---|---|---|---|---|
| blown out | 0.926 | 0.578 | 79.9% | 59.1% |
| over-corrected | 0.088 | 0.009 | 0% | 0% |
| **shipped** | **0.297** | **0.076** | **3.2%** | **2.2%** |

The fix is a tighter glow kernel (`d*d*58` → `150`), a damped atmosphere term,
a shorter distance falloff and a scaled-back lift. Same grading, same colours,
three per cent of the frame actually bright — which is what "dark with glowing
struts" means numerically.

Worth keeping as a method note: a backdrop's exposure is measurable without
being able to see it. Render it offscreen with `preserveDrawingBuffer`, read the
pixels, and look at the distribution rather than the average alone — the mean
would have called the wash "bright" and the correction "dark" without telling
you which was wrong.

## 34. Both bands shorter again

Hero 891 → smaller still: headline clamp `5.2vw/4.75rem` → `4.3vw/3.75rem`,
padding and the gap above the ecosystem tiles down another step.

The closing band was the other tall one and had not been touched: `py-28
md:py-36` with the shared `text-h1`, which is 115px at 1440 and ran the
headline to five lines. Now `py-16 md:py-20` and a local
`clamp(1.875rem, 4vw, 3.5rem)`, the same approach as the hero — the shared
token stays untouched for every other page.

## 35. It was the wrong renderer, not the wrong exposure

Two rounds were spent grading a glow march to look like Grid Run. Seeing the
pen rendered settled it: Grid Run is not a glow at all. It **resolves
surfaces** — solid beams with a point light, specular, ambient occlusion and
soft shadows, receding into black. A glow march draws bright lines through fog
and no amount of grading turns one into the other.

So the hero now does what the pen does: march to `abs(d) < 1e-3`, take a
tetrahedron normal, and light the hit — `calcAO` over five taps, a soft shadow
march toward the moving light, distance attenuation, then the pen's own
grading. The cell is the pen's too: a node cube plus three axis struts welded
with `smin`, repeated through `fract`.

The earlier §33 exposure work was answering the wrong question, and the
histogram shows why it could never have arrived: a surface render puts **82% of
pixels in the darkest fifth** with a 2% specular tail reaching 1.0. A fog march
has no such tail — it has a hump in the middle, which is exactly the milky wash
that kept coming back.

Compiled and measured before shipping: links clean, `glError` 0, 7ms for a
480×300 draw on an Intel iGPU, mean luminance 0.123.

**Cost, stated plainly.** This is much more expensive than what it replaced —
up to 220 march steps plus a 48-step shadow and five AO taps per pixel, against
a single 72-step loop. Render resolution drops to 0.5 and DPR is capped at 1.25
to pay for it, and the existing pausing (offscreen, hidden tab, reduced motion)
matters more than it did. Worth watching on a low-end phone.

**Opaque in dark, keyed in light.** The pen owns its black ground, so in dark
the canvas is opaque, as the original is. In light that would make the hero a
dark slab, so alpha there still comes from luminance. One uniform, set from the
theme observer.

## 36. Overlays off the hero, closing band back

The ecosystem tiles were `bg-bg-1/80` with `backdrop-blur-sm` — a translucent,
blurred sheet across the animation, and the smeared rectangle in the middle of
the hero screenshot. Now a solid panel: the animation is either behind the card
or not, with nothing smeared in between.

The closing band is back to `py-28 md:py-36` and the shared `text-h1`. It was
shortened in §34 and the larger version read better against the singularity.

## 37. The animated bands are dark in both themes

Light mode broke both backdrops. Their alpha was keyed off luminance so a white
page could show through the gaps — which works as an idea and looks like a grey
smear in practice, with the headline sitting on the wreckage.

The pens both assume a black ground. So rather than fight that, the bands get
one: `.force-dark` re-declares the dark palette on a subtree, and the hero and
closing sections carry it. The animation gets the ground it was drawn for, and
the copy over it gets the dark palette's light ink, in both themes.

Verified by sampling computed styles with the theme toggled either way — the
two are byte-identical: band `rgb(5,5,5)`, chrome gradient on its light values,
lead copy at **12.66:1** against the band, tile titles at **16.91:1**.

The lattice is now opaque unconditionally, which is what the pen is; the
luminance-keyed alpha and its theme observer are gone.

This is a real trade: two sections of the site no longer follow the page theme.
It is the right one — a light-mode hero showing a grey smear is worse than a
dark band on a light page, and every other section still themes normally.

## 38. The swinging robot, on every inner hero

"A swinging robot (CSS only)" by amit_sheen now backs `PageHero` — the shared
inner-page hero, so roughly forty pages carry it.

**Faithful to its colours**, as asked: the frame and seat are CSS `brown`
(`rgb(165,42,42)`), the floor `#333`, the robot white, every timing the pen's
own. Verified from computed styles rather than by eye.

Two changes were unavoidable to make a page into a section backdrop:

1. **Scoped.** The pen styles `body` and a bare `*`. Left alone, `* { position:
   absolute }` would have detonated the site. Everything now sits under
   `.swing-scene`.
2. **Flattened.** The pen's CSS is nested. This project's PostCSS chain is
   Tailwind plus autoprefixer with no nesting plugin, so shipping it nested
   would have relied on a build step that is not there.

Scale is a `font-size` on the container, since the whole scene is expressed in
`em` — `clamp(2.2px, 0.52vw, 6.5px)` fits it to a hero band.

**It costs no JavaScript.** `/platform` went 94.3 → 94.4 kB. No canvas, no
render loop, no hook — which also means the site's reduce-motion rules stop it
for free, like any other CSS animation, and a hidden tab stops compositing it.

The band is `.force-dark` like the other two, per §37: the pen assumes a black
ground and now gets one in both themes.

`<HeroImage>` is no longer rendered anywhere. The file and
`public/hero/README.md` stay — the supplied-render system is a documented
feature of this repo and removing it is a bigger decision than this change. The
`imageVariant` prop on `PageHero` is likewise kept, inert, because two EMIL
pages still pass it.
