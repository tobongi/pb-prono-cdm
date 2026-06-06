'use client'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

const tabs = [
  { href: '/', icon: '📅', labelFr: 'Calendrier', labelEn: 'Schedule' },
  { href: '/pronos', icon: '🎯', labelFr: 'Pronostics', labelEn: 'Predictions' },
  { href: '/groupes', icon: '📊', labelFr: 'Groupes', labelEn: 'Groups' },
  { href: '/classement', icon: '🏆', labelFr: 'Classement', labelEn: 'Ranking' },
]

export function BottomNav() {
  const pathname = usePathname()
  const locale = useLocale()

  function isActive(href: string) {
    const full = `/${locale}${href === '/' ? '' : href}`
    return pathname === full || pathname.startsWith(`/${locale}${href}/`)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-olive/30 md:hidden">
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const active = isActive(tab.href)
          const label = locale === 'fr' ? tab.labelFr : tab.labelEn
          const href = `/${locale}${tab.href === '/' ? '' : tab.href}`
          return (
            <a
              key={tab.href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 gap-1 text-xs font-body transition-colors ${
                active
                  ? 'text-gold border-t-2 border-gold -mt-px'
                  : 'text-cream/50 hover:text-cream'
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="leading-none">{label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
