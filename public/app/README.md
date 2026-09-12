# Application screenshots

Captures of the running products. Drop them in here using these exact
filenames and they appear on the pages listed; leave one out and that frame
simply does not render, and a section whose captures are all missing keeps its
explanation and loses only the pictures.

Clicking any of them on the site opens it at the size of the window. Clicking
outside the image, or pressing Escape, puts it back.

## EMIL Control Cockpit → `/platform/emil`

| Filename | What to capture |
|---|---|
| `cockpit.png` | **Dashboard**, signed in, scrolled to the top: the mode line, the morning brief with its sourcing footer, and the capital, exposure and risk-budget meters. |
| `markets.png` | **Global Markets**, from the exchange clocks down through the crypto venue table. |
| `instruments.png` | **Instrument Master** with one category expanded, so the provider-spelling columns are visible. |
| `heatmap.png` | **Heatmap & Breadth** on the 1 day / 24h view. |
| `charts.png` | **Charts** with a symbol loaded and at least one indicator on, including the footer that states the provider and fetch time. |
| `company.png` | **Company Intelligence** for a large listed name, including the quarterly table. |
| `screener.png` | **Equity Screener** with results listed and the status chips visible. |
| `news.png` | **EMIL News** on the Markets tab. |
| `alerts.png` | **Alert Center**. |
| `arm.png` | **ARM / DISARM**, disarmed, with a mode selected — disclosure, mode grid, limit sheet and acknowledgements. |
| `cards.png` | **Trade Cards** showing a proposal that was *not* approved, with the agent votes. |
| `portfolio.png` | **Portfolio & Exposure** with several accounts linked, including any that are erroring. |
| `scenario.png` | **Scenario & Hedges** with a preset applied. |
| `council.png` | **Agent Council** with the 29-step pipeline expanded. |
| `apihub.png` | **Global API Hub** showing both execution routes and the market selector. |
| `paper.png` | **Paper Trading Desk** with a venue connected, including the ticket protections. |
| `agentdesk.png` | **Agent Paper Desk** showing the gates and the autopilot state. |
| `backtest.png` | **Backtest Engine** after a run: the verdict banner, the metric tiles and the walk-forward panel. |
| `options.png` | **Options Analytics** with an expiry selected and the chain visible. |
| `calendar.png` | **Calendar & Central Banks**, from the bank monitor down into the economic calendar. |
| `journal.png` | **Trade Journal** with at least one reviewed entry, including the review text and the process grade. |
| `risk.png` | **Risk Management**: the sizing calculator, the nine-breaker grid and the trip history. |
| `capital.png` | **Capital & Performance** with the 90-day equity curve and the drawdown events list. |
| `strategycenter.png` | **Strategy Center**: champion against challenger, plus several strategy cards with health scores. |
| `strategylab.png` | **Strategy Lab** with a candidate open and the data-mode banner visible. |
| `teach.png` | **Teach EMIL** on the Ingest tab, including the provenance note under the analyse button. |
| `trust.png` | **Trust & Metacognition**, including the confidence-versus-trust panel and novelty detection. |
| `connect.png` | **Connect Your Platform** with at least one bridged account listed. |
| `developers.png` | **Developers & API** on the reference tab, with the scope chips and quickstart visible. |
| `integrations.png` | **Integrations Directory** including chat channels and embeddable widgets. |
| `datafeed.png` | **Your Data Feed**, including the ingest example. |
| `settings.png` | **Settings & Permissions**: the grants, the risk profile editor and the privacy section. |
| `organization.png` | **Organization**. |

## The other two products

| Filename | What to capture | Appears on |
|---|---|---|
| `terminal.png` | **EMIL Trade terminal** with a chart loaded, the watchlist open and at least one position in the order desk, so the margin bar along the bottom has something in it. | `/platform/emil`, `/platform/terminal` |
| `desk.png` | **Broker admin** — the dealing desk or the risk view. | `/brokers/platform` |

## Before you export one

- **Demo accounts only.** No client names, no real account numbers, no
  balances that belong to anybody. The capture is a marketing asset and it will
  be indexed.
- **The whole window.** The frame is `aspect-[16/9]` and the image is
  `contain`, not `cover`, so nothing is cropped — a wide capture just leaves a
  hairline of ground above and below. Include the left nav and the status bar:
  they are part of what the surface is.
- **2560px wide or so**, PNG. It is rendered at up to ~1100px inline and full
  size on click, and Next generates the smaller sizes, so oversupplying costs
  nothing at request time.
- **Dark theme**, to sit with the band around it.

## Why these are here at all

Design system §3: *the site's product visuals are live components and
diagrams, never screenshots.* That still holds everywhere else — the client
portal, the CRM and the terminal workspace on these pages are built, not
photographed, which is why the white-label demo can re-skin the portal in the
browser and a screenshot could not.

These slots are the narrow exception, asked for by the owner: real captures of
the two applications, shown *beside* the live components and the written
feature lists rather than instead of them. Every section on `/platform/emil`
explains its surface in text and in a diagram first; the capture is evidence,
not the explanation. If none of these files is ever added, the page still says
everything it says now.
