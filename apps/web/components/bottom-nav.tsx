'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

const tabs = [
  { href: '/accueil', icon: '🏠', label: 'Accueil' },
  { href: '/calendrier', icon: '🎯', label: 'Pronos' },
  { href: '/classement', icon: '🏆', label: 'Classement' },
  { href: '/mes-pronos', icon: '📋', label: 'Mes pronos' },
  { href: '/profil', icon: '👤', label: 'Profil' },
]

export function BottomNav() {
  const pathname = usePathname()
  const locale = useLocale()

  function isActive(href: string) {
    const full = `/${locale}${href}`
    return pathname === full || pathname.startsWith(full + '/')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-white/10">
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const active = isActive(tab.href)
          const href = `/${locale}${tab.href}`
          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-body transition-colors ${
                active ? 'text-gold' : 'text-cream/40 hover:text-cream/70'
              }`}
            >
              <span className={`text-xl leading-none ${active ? 'filter drop-shadow-[0_0_6px_rgba(212,168,83,0.8)]' : ''}`}>{tab.icon}</span>
              <span className="leading-none">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
