import 'server-only'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Optional brand imagery.
 *
 * These files are NOT in the repository yet. Drop them into `public/hero/`
 * using the filenames below and they are picked up automatically — see
 * public/hero/README.md.
 *
 * Presence is checked on the server at render time, so a missing file produces
 * no request at all rather than a 404 in the browser console. The hero falls
 * back to the gradient and hairline grid.
 *
 * The site's product visuals are deliberately live components or diagrams,
 * never screenshots (design system §3) — these images are atmosphere only,
 * used at low opacity behind hero sections.
 */

export type AmbientImage = {
  /** Public path, and the path to drop the file at under `public/`. */
  src: string
  theme: 'light' | 'dark'
  /** Which supplied render belongs here. */
  note: string
}

const CANDIDATES: readonly AmbientImage[] = [
  {
    src: '/hero/office-day.jpg',
    theme: 'light',
    note: 'Bright office, curved monitor showing a partner dashboard, daylight city. Light theme.',
  },
  {
    src: '/hero/office-night.jpg',
    theme: 'dark',
    note: 'Night city skyline, multi-monitor desk with charts. Dark theme.',
  },
  {
    src: '/hero/cockpit-night.jpg',
    theme: 'dark',
    note: 'EMIL control cockpit against a night skyline. Used on EMIL surfaces.',
  },
]

function present(src: string): boolean {
  return existsSync(join(process.cwd(), 'public', src))
}

/** Only images that actually exist on disk. */
export function heroImages(): readonly AmbientImage[] {
  return CANDIDATES.filter((image) => present(image.src))
}

/**
 * Master logo.
 *
 * Checked on the server in preference order. Absent → <RaptorLogo> composes
 * the lockup from live type plus the abstracted wing, so nothing breaks and no
 * broken-image icon appears. See public/brand/README.md.
 *
 * `light` is an optional darker-inked variant for use on white, since the
 * master mark is brushed silver and can wash out against a light background.
 */
const LOGO_CANDIDATES = {
  default: ['/brand/raptor-logo.svg', '/brand/raptor-logo.png'],
  light: ['/brand/raptor-logo-dark.svg', '/brand/raptor-logo-dark.png'],
} as const

export type LogoSources = { default: string | null; light: string | null }

export function logoSources(): LogoSources {
  const first = (paths: readonly string[]) => paths.find(present) ?? null
  return {
    default: first(LOGO_CANDIDATES.default),
    light: first(LOGO_CANDIDATES.light),
  }
}

/**
 * Optional session imagery for the session globe on `/platform/markets`.
 *
 * Same contract as the hero images: not in the repository, dropped in by hand,
 * presence checked on the server so a missing file is never requested. See
 * public/sessions/README.md.
 */
export type SessionImage = {
  session: 'Asia' | 'London' | 'NewYork'
  src: string
  note: string
}

const SESSION_CANDIDATES: readonly SessionImage[] = [
  {
    session: 'Asia',
    src: '/sessions/asia.jpg',
    note: 'Tokyo or Singapore skyline, or a desk at the Asian open.',
  },
  {
    session: 'London',
    src: '/sessions/london.jpg',
    note: 'London skyline, or a desk at the European open.',
  },
  {
    session: 'NewYork',
    src: '/sessions/new-york.jpg',
    note: 'New York skyline, or a desk at the US open.',
  },
]

/** Only session images that actually exist on disk. */
export function sessionImages(): readonly SessionImage[] {
  return SESSION_CANDIDATES.filter((image) => present(image.src))
}
