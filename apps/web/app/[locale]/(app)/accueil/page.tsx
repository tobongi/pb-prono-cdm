interface Props {
  params: Promise<{ locale: string }>
}

export default async function AccueilPage({ params }: Props) {
  const { locale } = await params

  return (
    <main className="px-4 py-8 pb-24 max-w-lg mx-auto flex flex-col gap-6">
      {/* Logo + titre */}
      <div className="flex flex-col items-center gap-3 pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192.png"
          alt="PB Prono CDM"
          width={72}
          height={72}
          className="rounded-2xl"
        />
        <div className="text-center">
          <h1 className="font-display text-3xl text-cream uppercase tracking-wide">
            PB PRONO CDM 2026
          </h1>
          <p className="text-beige text-xs uppercase tracking-widest mt-1">
            COUPE DU MONDE · JUIN 2026
          </p>
        </div>
      </div>

      {/* Séparateur */}
      <div className="h-px bg-olive/30" />

      {/* Section concept */}
      <div className="flex flex-col gap-3">
        <p className="text-gold text-xs uppercase tracking-widest font-display">LE CONCEPT</p>

        {/* Carte 1 */}
        <div className="bg-bg-card rounded-xl p-4 flex gap-4 items-start">
          <span className="text-2xl leading-none mt-0.5">🎯</span>
          <div className="flex flex-col gap-1">
            <p className="font-display text-cream uppercase tracking-wide">PRONOSTIQUE</p>
            <p className="text-beige text-sm font-body leading-relaxed">
              Choisis le score exact avant le coup d&apos;envoi. Les pronos se ferment au coup d&apos;envoi.
            </p>
          </div>
        </div>

        {/* Carte 2 */}
        <div className="bg-bg-card rounded-xl p-4 flex gap-4 items-start">
          <span className="text-2xl leading-none mt-0.5">🏆</span>
          <div className="flex flex-col gap-1">
            <p className="font-display text-cream uppercase tracking-wide">GAGNE DES POINTS</p>
            <p className="text-beige text-sm font-body leading-relaxed">
              Score exact = 7 pts. Bon résultat = 3 pts. Sois le meilleur&nbsp;!
            </p>
          </div>
        </div>

        {/* Carte 3 */}
        <div className="bg-bg-card rounded-xl p-4 flex gap-4 items-start">
          <span className="text-2xl leading-none mt-0.5">🍗</span>
          <div className="flex flex-col gap-1">
            <p className="font-display text-cream uppercase tracking-wide">RÉCOMPENSE PB</p>
            <p className="text-beige text-sm font-body leading-relaxed">
              Les meilleurs pronostiqueurs gagnent une surprise Poulet Braisé à la fin de la compétition.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <a
        href={`/${locale}/calendrier`}
        className="bg-gold text-bg-dark font-display text-xl uppercase py-4 rounded-xl text-center block tracking-wide"
      >
        🏈 PRONOSTIQUER MAINTENANT
      </a>

      {/* Note bas */}
      <p className="text-muted text-xs text-center font-body">
        Jeu 100% gratuit · Aucun achat requis
      </p>
    </main>
  )
}
