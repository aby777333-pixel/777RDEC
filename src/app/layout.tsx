import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { BrandProvider } from '@/components/layout/brand-provider'
import { logoSources } from '@/lib/brand-assets'
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/brand'
import { organizationJsonLd } from '@/lib/seo'

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'The market does not stand still. Neither should your technology. Terminal, CRM, client portal, risk engine, API and an intelligence layer — one connected ecosystem.',
  applicationName: SITE_NAME,
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    // Generated from the falcon mark in public/brand/raptor-logo.png, on a
    // dark plate so it stays legible in any browser tab. The SVG wing is kept
    // as a fallback for clients that prefer vector.
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </body>
    </html>
  )
}
