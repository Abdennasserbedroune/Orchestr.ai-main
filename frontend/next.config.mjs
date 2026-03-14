/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for Vercel serverless/edge deployment
  output: 'standalone',
  // Prevent bundling of server-only packages
  experimental: {
    serverComponentsExternalPackages: ['groq-sdk'],
  },
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  // Silence ESLint and TypeScript errors from blocking build on Vercel
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}
export default nextConfig
