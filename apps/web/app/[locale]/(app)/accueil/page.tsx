import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { VideoBackground } from '@/components/video-background'

export default async function AccueilPage() {
  const locale = await getLocale()

  const cards = [
    {
      icon: '🎯',
      title: 'PRONOSTIQUE',
      desc: 'Choisis le score exact avant le coup d\'envoi. Les pronos se ferment au début du match.',
    },
    {
      icon: '🏆',
      title: 'GAGNE DES POINTS',
      desc: 'Score exact = 7 pts. Bon résultat = 3 pts. Accumule le max de points !',
    },
    {
      icon: '🍗',
      title: 'RÉCOMPENSE PB',
      desc: 'Les 10 meilleurs pronostiqueurs gagnent une surprise Poulet Braisé à la fin de la compétition.',
    },
  ]

  return (
    <main className="relative min-h-screen flex flex-col px-4 pt-8 pb-24 overflow-hidden">
      {/* Video background — mobile & tablet only (hidden on lg+) */}
      <VideoBackground />

      {/* Dark overlay over video for readability */}
      <div className="absolute inset-0 bg-black/65 lg:hidden" />

      {/* Desktop: solid dark background */}
      <div className="absolute inset-0 bg-bg-dark hidden lg:block" />

      {/* Content — sits above video + overlay */}
      <div className="relative z-10 flex flex-col flex-1">

        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pb-logo-transparent.png" alt="PB Poulet Braisé" className="w-24 h-24" />
          <p className="text-beige text-xs uppercase tracking-[0.25em]">PB POULET BRAISÉ TE RÉGALE</p>
          <h1 className="font-display text-3xl text-cream uppercase text-center leading-tight drop-shadow-lg">
            PRONOSTIQUE LA<br />COUPE DU MONDE<br />2026
          </h1>
        </div>

        {/* Concept */}
        <p className="text-gold text-[10px] uppercase tracking-widest text-center mb-4">LE CONCEPT</p>
        <h2 className="font-display text-2xl text-cream uppercase text-center mb-6 drop-shadow-md">JOUE. GAGNE. RÉCUPÈRE.</h2>

        {/* Cards */}
        <div className="flex flex-col gap-3 mb-8">
          {cards.map(c => (
            <div key={c.title} className="bg-bg-card/80 backdrop-blur-sm rounded-xl p-4 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0 text-2xl">
                {c.icon}
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-display text-sm text-cream uppercase tracking-wide">{c.title}</p>
                <p className="text-beige text-sm leading-snug">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/${locale}/calendrier`}
          className="bg-gold text-bg-dark font-display text-lg uppercase py-4 rounded-xl text-center block tracking-wider hover:brightness-110 transition"
        >
          🏈 PRONOSTIQUER MAINTENANT
        </Link>

        <p className="text-muted text-xs text-center mt-4">Jeu 100% gratuit · Aucun achat requis</p>
      </div>
    </main>
  )
}
