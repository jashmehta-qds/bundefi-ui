const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['logo.moralis.io', "cdn.moralis.io", "assets.coingecko.com", "icons.llamao.fi", "icons.llama.fi", "avatars.githubusercontent.com", "cryptologos.cc"],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-*', 'lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize loading of external fonts
  optimizeFonts: true,
}

module.exports = withBundleAnalyzer(nextConfig) 