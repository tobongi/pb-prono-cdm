import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin('./i18n.ts')

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/flagcdn\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'flags',
        expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/groups/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'groups',
        expiration: { maxAgeSeconds: 3600 },
      },
    },
    {
      urlPattern: /\/api\/matches/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'matches',
        networkTimeoutSeconds: 5,
        expiration: { maxAgeSeconds: 60 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
}

export default withPWA(withNextIntl(nextConfig))
