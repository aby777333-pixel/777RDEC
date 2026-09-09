# Brand assets

## Files in use

| File | Used for |
|---|---|
| `raptor-logo.png` | The master lockup, brushed silver. Used in the **dark** theme. |
| `raptor-logo-dark.png` | Darker-inked version of the same lockup. Used in the **light** theme. |
| `raptor-lockup.svg` | Type-and-wing fallback, kept for decks, email signatures and anywhere a vector is easier than a raster. Not used by the site while the two PNGs above exist. |

`src/components/ui/raptor-logo.tsx` resolves these on the server and the result
is passed down through `BrandProvider`. Order of preference is
`raptor-logo.svg` then `raptor-logo.png`; if neither exists the component
composes the lockup from live type plus the abstracted wing instead, so the
site never shows a broken image.

## What was done to the supplied file

The master logo arrived as `Raptor transparent logo.png` (612 x 408, RGBA).
Two things needed fixing before it could be used:

1. **92% of the canvas was transparent padding.** The mark occupied only
   474 x 220, offset from centre (82px of space above, 106px below). Sized by
   height in a 40px header slot, the visible mark would have rendered about
   21px tall and sat noticeably high. It was cropped to its alpha bounding box
   plus an even 2% margin, giving 492 x 238.

2. **The silver washed out on white.** Mean luminance of the opaque pixels was
   160/255, which is 2.6:1 against a white background — below any usable
   threshold. `raptor-logo-dark.png` remaps the tonal range to
   `[20..150]`, preserving the internal gradient so it still reads as brushed
   metal, and lands at 5.8:1.

The untouched original is preserved in git history in commit `daaad9d`.

## Replacing the logo later

Drop a new `raptor-logo.png` (or `.svg`) in here. Two things to check:

- **Transparent background**, or it will show as a box against both themes.
- **Trim the padding** before saving. The component sizes by height, so
  built-in whitespace shrinks the visible mark.

If the new artwork is dark enough to work on white, delete
`raptor-logo-dark.png` and both themes will use the single file.

## Favicon

`public/favicon.svg` is the abstracted wing on black. Replace it with a crop
of the falcon head when convenient — keep it as an SVG and keep the filename.
