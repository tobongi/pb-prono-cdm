import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin('./i18n.ts')

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
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
const nextConfig = {}

export default withPWA(withNextIntl(nextConfig))
