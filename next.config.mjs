/**
 * The public origin every canonical, sitemap entry, Open Graph image and JSON-LD
 * id is built from. Order of precedence:
 *
 *   1. NEXT_PUBLIC_SITE_URL, when set explicitly.
 *   2. URL — set by Netlify on every build to the site's primary domain. Today
 *      that is https://777raptor.netlify.app; once 777raptor.com is added as
 *      the primary custom domain it becomes that, with no code change, and
 *      Netlify redirects the netlify.app hostname to it.
 *   3. https://777raptor.com for local builds.
 *
 * Resolved here and inlined through `env` so server and client bundles always
 * agree on one value.
 */
function resolveSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'https://777raptor.com'
  const trimmed = raw.trim().replace(/\/+$/, '')
  // Netlify reports the primary URL over https, but never let a public
  // canonical go out over plain http. Local dev hosts are left alone.
  return /^http:\/\/(localhost|127\.0\.0\.1)/.test(trimmed)
    ? trimmed
    : trimmed.replace(/^http:\/\//, 'https://')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SITE_URL: resolveSiteUrl(),
  },
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  async redirects() {
    return [
      // One canonical EMIL page (super-prompt §2).
      { source: '/intelligence/emil', destination: '/platform/emil', permanent: true },
      // The live product experience is supplied separately. Until it is wired
      // up here, keep the URL working rather than serving a placeholder.
      { source: '/experience', destination: '/request-demo', permanent: false },
    ]
  },
}

export default nextConfig
