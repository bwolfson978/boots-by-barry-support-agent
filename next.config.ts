import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Allow local /public/images — Next.js serves these natively.
    // Add remote hosts here if you later source images from a CDN.
    remotePatterns: [],
    // Treat missing images gracefully in development
  },
}

export default nextConfig
