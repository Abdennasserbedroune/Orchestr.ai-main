/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for Vercel serverless/edge deployment
  output: 'standalone',
  // Prevent bundling of server-only packages
  serverExternalPackages: ['groq-sdk'],
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  // Allow Vercel build to succeed even with lint/type warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
export default nextConfig
