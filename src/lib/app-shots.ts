import 'server-only'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Optional screenshots of the running applications.
 *
 * ## Why these exist at all
 *
 * Design system §3 says the site's product visuals are live components and
 * diagrams, never screenshots — and the site keeps to that: the client portal,
 * the CRM and the terminal workspace on these pages are all built rather than
 * photographed. That rule is restated in `public/hero/README.md` and in
 * `brand-assets.ts`, and it exists for good reasons: a screenshot ages the
 * moment the product ships, it cannot be re-skinned for a white-label demo,
 * it carries whatever was on screen that day, and it is never legible on a
 * phone.
 *
 * These slots are a deliberate, narrow exception, asked for by the owner: real
 * captures of the EMIL Control Cockpit and the EMIL Trade terminal, shown
 * alongside the live components rather than instead of them. Nothing else on
 * the site becomes a screenshot.
 *
 * ## How they behave
 *
 * The same contract as the hero imagery: the files are not in the repository,
 * they are dropped into `public/app/` by hand, and presence is checked on the
 * server at render time. A file that is absent is never referenced — no
 * request, no 404, no broken frame — and the section simply does not appear.
 * See `public/app/README.md` for the filenames.
 */

export type AppShot = {
  /** Referenced by <AppShotFrame id="...">. */
  id: 'cockpit' | 'terminal' | 'desk'
  src: string
  /** Shown under the frame. A screenshot without a caption is decoration. */
  caption: string
  /** What to capture, for whoever takes it. */
  note: string
}

const CANDIDATES: readonly AppShot[] = [
  {
    id: 'cockpit',
    src: '/app/cockpit.png',
    caption:
      'The EMIL cockpit: the council’s current reading, the mandate it is operating inside, and the risk engine’s standing.',
    note: 'EMIL Control Cockpit, signed in, on the main view. Dark theme.',
  },
  {
    id: 'terminal',
    src: '/app/terminal.png',
    caption:
      'The terminal: chart, watchlist, order desk and open positions on one surface, with the account’s margin state along the bottom.',
    note: 'EMIL Trade terminal with a chart loaded, the watchlist open and at least one position in the order desk. Demo account, so no client data.',
  },
  {
    id: 'desk',
    src: '/app/desk.png',
    caption:
      'The broker side: the book, exposure across it, and the clients behind the flow.',
    note: 'Broker admin — dealing desk or risk view. Demo tenant only.',
  },
]

function present(src: string): boolean {
  return existsSync(join(process.cwd(), 'public', src))
}

/** The one with this id, if the file is actually on disk. */
export function appShot(id: AppShot['id']): AppShot | null {
  const found = CANDIDATES.find((shot) => shot.id === id)
  return found && present(found.src) ? found : null
}

/** Every slot, whether or not the file exists — for the README and for tests. */
export function appShotSlots(): readonly AppShot[] {
  return CANDIDATES
}
