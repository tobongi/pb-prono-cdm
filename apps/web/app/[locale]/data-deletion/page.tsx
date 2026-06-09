import Link from 'next/link'

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-bg-dark pb-pattern-bg">
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Back link */}
        <Link
          href="/fr/login"
          className="inline-flex items-center gap-2 text-muted text-sm font-body mb-8 hover:text-cream transition-colors"
        >
          <span>←</span>
          <span>Retour à la connexion</span>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl uppercase tracking-widest text-gold mb-3">
            Suppression de vos données
          </h1>
          <p className="font-body text-cream text-base">
            Vos données, votre contrôle.
          </p>
        </div>

        {/* Intro */}
        <div className="bg-bg-card rounded-xl p-4 mb-4">
          <p className="font-body text-beige text-sm leading-relaxed">
            Conformément au RGPD et aux exigences de Meta/Facebook, vous pouvez demander la suppression complète de vos données personnelles de <span className="text-cream font-medium">PB Prono CDM</span>.
          </p>
        </div>

        {/* Ce qui sera supprimé */}
        <div className="bg-bg-card rounded-xl p-4 mb-4">
          <h2 className="font-display text-sm uppercase tracking-widest text-gold mb-4">
            Ce qui sera supprimé
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-base leading-none mt-0.5">🧑</span>
              <span className="font-body text-beige text-sm leading-relaxed">
                Votre compte (pseudo, avatar, email)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-base leading-none mt-0.5">🎯</span>
              <span className="font-body text-beige text-sm leading-relaxed">
                Tous vos pronostics
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-base leading-none mt-0.5">🏆</span>
              <span className="font-body text-beige text-sm leading-relaxed">
                Votre position dans le classement
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-base leading-none mt-0.5">📱</span>
              <span className="font-body text-beige text-sm leading-relaxed">
                L&apos;empreinte de votre appareil
              </span>
            </li>
          </ul>
        </div>

        {/* Comment faire la demande */}
        <div className="bg-bg-card rounded-xl p-4 mb-4">
          <h2 className="font-display text-sm uppercase tracking-widest text-gold mb-4">
            Comment faire la demande
          </h2>
          <div className="space-y-3">

            {/* Par email */}
            <div className="border border-gold/30 rounded-xl p-4">
              <h3 className="font-display text-xs uppercase tracking-widest text-cream mb-2">
                Par email
              </h3>
              <p className="font-body text-beige text-sm leading-relaxed mb-3">
                Envoyez un email à l&apos;adresse ci-dessous avec l&apos;objet{' '}
                <span className="text-cream font-medium italic">
                  &ldquo;Suppression de données - [votre pseudo]&rdquo;
                </span>
              </p>
              <a
                href="mailto:pb-prono@pouletbraise.com"
                className="block font-body text-gold text-base font-medium hover:text-cream transition-colors break-all"
              >
                pb-prono@pouletbraise.com
              </a>
              <p className="font-body text-muted text-xs mt-2">
                Délai de traitement : 30 jours maximum
              </p>
            </div>

            {/* Confirmation */}
            <div className="border border-gold/30 rounded-xl p-4">
              <h3 className="font-display text-xs uppercase tracking-widest text-cream mb-2">
                Confirmation
              </h3>
              <p className="font-body text-beige text-sm leading-relaxed">
                Vous recevrez un email de confirmation une fois vos données supprimées.
              </p>
            </div>

          </div>
        </div>

        {/* Note importante */}
        <div className="bg-bg-card rounded-xl p-4 mb-8">
          <h2 className="font-display text-sm uppercase tracking-widest text-gold mb-3">
            Note importante
          </h2>
          <p className="font-body text-beige text-sm leading-relaxed">
            La suppression est <span className="text-cream font-medium">irréversible</span>. Vos pronostics et points seront définitivement perdus. Si vous participez à un concours en cours, votre candidature sera annulée.
          </p>
        </div>

        {/* Footer note */}
        <p className="font-body text-muted text-xs text-center leading-relaxed">
          Cette page est requise par Meta (Facebook/Instagram) conformément à leur politique de données.
        </p>

      </div>
    </div>
  )
}
