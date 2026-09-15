import type { MetadataRoute } from 'next'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/brand'

/** Web app manifest: name, icons and colours for installs and home-screen links. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: `${SITE_NAME} — ${SITE_TAGLINE}`,
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#050505',
    theme_color: '#050505',
    lang: 'en-GB',
    icons: [
      { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  }
}
