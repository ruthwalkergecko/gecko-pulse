/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensures googleapis only runs server-side (Next.js 14 syntax)
  experimental: {
    serverComponentsExternalPackages: ['googleapis'],
  },
}

module.exports = nextConfig
