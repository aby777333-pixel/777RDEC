/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
