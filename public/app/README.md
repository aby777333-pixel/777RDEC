# Application screenshots

Captures of the running products. Drop them in here using these exact
filenames and they appear on the pages listed; leave one out and that section
simply does not render.

| Filename | What to capture | Appears on |
|---|---|---|
| `cockpit.png` | **EMIL Control Cockpit**, signed in, main view. Dark theme. | `/platform/emil` |
| `terminal.png` | **EMIL Trade terminal** with a chart loaded, the watchlist open and at least one position in the order desk, so the margin bar along the bottom has something in it. | `/platform/terminal` |
| `desk.png` | **Broker admin** — the dealing desk or the risk view. | `/brokers/platform` |

## Before you export one

- **Demo accounts only.** No client names, no real account numbers, no
  balances that belong to anybody. The capture is a marketing asset and it will
  be indexed.
- **A wide crop, 16:10.** The frame is `aspect-[16/10]` and anchored top-left,
  so a taller capture loses its bottom edge — which on a terminal is the order
  desk, the half worth showing.
- **2560px wide or so**, PNG. It is rendered at up to ~1100px and Next
  generates the smaller sizes, so oversupplying costs nothing at request time.
- **Dark theme**, to sit with the band around it.

## Why these are here at all

Design system §3: *the site's product visuals are live components and
diagrams, never screenshots.* That still holds everywhere else — the client
portal, the CRM and the terminal workspace on these pages are built, not
photographed, which is why the white-label demo can re-skin the portal in the
browser and why none of it ages when the product ships.

These three slots are a deliberate exception, asked for by the owner: real
captures shown **alongside** those live components, not instead of them. If
you are adding a fourth, the question to answer first is why a live component
would not do the job better.

`src/lib/app-shots.ts` holds the list; presence is checked on the server, so a
missing file is never requested.
