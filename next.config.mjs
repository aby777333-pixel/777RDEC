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
    ]
  },
}

export default nextConfig
