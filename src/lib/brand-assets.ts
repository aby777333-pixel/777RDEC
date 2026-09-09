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

/** Master logo. Absent → <RaptorLogo> composes the lockup from type + wing. */
export const LOGO_RASTER_PATH = '/brand/raptor-logo.png'
