import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { BrandProvider } from '@/components/layout/brand-provider'
import { logoSources } from '@/lib/brand-assets'
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/brand'
import {
  INDEXABLE_ROBOTS,
  SITE_LOCALE,
  jsonLdScript,
  ogImageUrl,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo'

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

/**
 * Search Console / Bing Webmaster Tools ownership tags. Each is emitted only
 * when its variable is set in the Netlify build environment, so nothing ships
 * with a placeholder code. DNS verification needs none of these.
 */
function siteVerification(): Metadata['verification'] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim()
  const bing = process.env.BING_SITE_VERIFICATION?.trim()
  const yandex = process.env.YANDEX_SITE_VERIFICATION?.trim()
  const other: Record<string, string> = {}
  if (bing) other['msvalidate.01'] = bing
  if (!google && !yandex && !bing) return undefined
  return {
    ...(google ? { google } : {}),
    ...(yandex ? { yandex } : {}),
    ...(bing ? { other } : {}),
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'The market does not stand still. Neither should your technology. Terminal, CRM, client portal, risk engine, API and an intelligence layer — one connected ecosystem.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  // Every page sets its own robots, canonical and cards through pageMetadata();
  // these are the fallbacks for anything that does not.
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: SITE_URL,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    images: [{ url: ogImageUrl(SITE_TAGLINE, '/'), width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    images: [ogImageUrl(SITE_TAGLINE, '/')],
  },
  verification: siteVerification(),
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    // The falcon mark alone, cut from the master logo and filling a black
    // square. No SVG: browsers prefer a vector icon when one is listed, and the
    // old wing-lines SVG was winning the tab over the falcon. The .ico carries
    // 16, 32 and 48px renders sharpened for the tab; it also answers the
    // /favicon.ico request browsers make on their own.
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-bg-0 antialiased">
        <ThemeProvider>
          <BrandProvider logo={logoSources()}>{children}</BrandProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          // Static, build-time constant — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
      </body>
    </html>
  )
}
