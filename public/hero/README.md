# Hero imagery

Drop the supplied renders in here, using these exact filenames:

| Filename | Which image |
|---|---|
| `office-day.jpg` | Bright office, curved monitor with the partner dashboard, daylight city skyline. Used behind hero sections in the **light** theme. |
| `office-night.jpg` | Night city skyline, multi-monitor desk with charts. Used behind hero sections in the **dark** theme. |
| `cockpit-night.jpg` | EMIL control cockpit against the night skyline. Used on EMIL surfaces. |

They are optional. `src/components/layout/ambient-hero.tsx` layers them under a
gradient scrim at 10–16% opacity, so if a file is missing the section falls
back to the gradient and hairline grid with no broken image and no layout
shift.

Keep them under ~400 kB each (they sit behind a scrim, so heavy compression is
fine) and prefer a 21:9 crop — they are only ever seen as a wide band.

The site's **product** visuals are not images: the terminal, portal and CRM
frames are live components (design system §3, "zero stock photography"). These
files are atmosphere only.

## Logo

The master logo belongs at `public/brand/raptor-logo.png`. Until it is added,
`src/components/ui/raptor-logo.tsx` composes the lockup from live type plus the
abstracted wing, which is crisp at every size and re-themes automatically.
