import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PB Prono CDM — Pronostique la Coupe du Monde',
  description: 'Pronostique la Coupe du Monde 2026 avec PB Poulet Braisé. Score exact = 7 pts. Jeu 100% gratuit.',
  metadataBase: new URL('https://pb-prono-cdm.vercel.app'),
  openGraph: {
    title: 'PB Prono CDM — Pronostique la Coupe du Monde 2026 🍗',
    description: 'Score exact = 7 pts. Bon résultat = 3 pts. Les 10 meilleurs gagnent une surprise PB !',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'PB Poulet Braisé' }],
    type: 'website',
    siteName: 'PB Prono CDM',
  },
  twitter: {
    card: 'summary',
    title: 'PB Prono CDM',
    description: 'Pronostique la Coupe du Monde 2026 avec PB Poulet Braisé !',
    images: ['/icons/icon-512.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
