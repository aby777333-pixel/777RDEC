# Brand assets

## The logo

Drop the master logo here as **`raptor-logo.png`** (or `raptor-logo.svg` — either
is picked up, SVG preferred if both exist).

`src/components/ui/raptor-logo.tsx` checks for those files on the server at
render time:

- **File present** → it is used everywhere the lockup appears: header, footer,
  mobile drawer, 404, 500, design system.
- **File absent** → the component composes the lockup from live type plus the
  abstracted five-feather wing, which is crisp at every size and re-themes with
  the palette. That is what the site currently shows.

No code change is needed either way. Add the file, redeploy, done.

### What to supply

The master mark is brushed silver on transparent or black: falcon head with a
swept five-feather wing, a vertical divider, then `777` / `RAPTOR` in heavy
metallic sans with `PRECISION. POWER. PERFORMANCE.` beneath.

- **Transparent background.** The logo sits on white in the light theme and on
  near-black in the dark theme, so a baked-in background will show as a box.
- Roughly 1200×640 or larger for the PNG, or any SVG.
- If the silver mark disappears against white in the light theme, also supply
  **`raptor-logo-dark.png`** — a darker-inked variant — and it will be used for
  the light theme automatically.

### Favicon

`public/favicon.svg` is currently the abstracted wing on black. Replace it with
a crop of the falcon head once the master file is here; keep it as an SVG and
keep the filename.
