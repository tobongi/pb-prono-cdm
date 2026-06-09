import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-dark pb-pattern-bg">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Back link */}
        <Link
          href="/fr/login"
          className="inline-flex items-center gap-2 text-muted hover:text-cream text-sm font-body mb-8 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-gold uppercase tracking-widest mb-2">
            Politique de confidentialité
          </h1>
          <p className="text-muted text-xs font-body">
            Dernière mise à jour : 9 juin 2026
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4">

          {/* 1. Qui sommes-nous */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              1. Qui sommes-nous
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body">
              <strong className="text-cream">PB Prono CDM</strong> est un jeu de pronostics autour de la Coupe du Monde 2026,
              opéré par <strong className="text-cream">PB Poulet Braisé</strong>.
              Pour toute question relative à vos données personnelles, contactez-nous à{' '}
              <a
                href="mailto:pb-prono@pouletbraise.com"
                className="text-gold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                pb-prono@pouletbraise.com
              </a>.
            </p>
          </div>

          {/* 2. Données collectées */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              2. Données collectées
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body mb-3">
              Lors de votre inscription et utilisation du service, nous collectons les données suivantes :
            </p>
            <ul className="text-beige text-sm leading-relaxed font-body space-y-1 list-none pl-0">
              {[
                'Nom et prénom (transmis par Google ou Facebook OAuth)',
                'Adresse email',
                'Photo de profil',
                'Identifiant OAuth unique (Google ID / Facebook ID)',
                'Empreinte appareil anonymisée',
                'Pronostics soumis',
                'Points accumulés',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-gold mt-0.5 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Pourquoi */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              3. Pourquoi nous collectons ces données
            </h2>
            <ul className="text-beige text-sm leading-relaxed font-body space-y-1 list-none pl-0">
              {[
                'Identification unique du joueur sur la plateforme',
                'Affichage du pseudo et de l\'avatar dans le classement',
                'Sauvegarde de vos pronostics',
                'Calcul et attribution des points',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-gold mt-0.5 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Base légale */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              4. Base légale
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body">
              Le traitement de vos données repose sur votre{' '}
              <strong className="text-cream">consentement</strong>,
              exprimé librement lors de la connexion via Google ou Facebook OAuth.
              Vous pouvez retirer ce consentement à tout moment en supprimant votre compte.
            </p>
          </div>

          {/* 5. Partage */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              5. Partage des données
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body mb-3">
              Nous ne vendons jamais vos données à des tiers. Vos données sont uniquement transmises à nos sous-traitants techniques :
            </p>
            <ul className="text-beige text-sm leading-relaxed font-body space-y-1 list-none pl-0 mb-3">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5 shrink-0">—</span>
                <span><strong className="text-cream">Supabase</strong> — hébergement de la base de données (USA / Union Européenne)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5 shrink-0">—</span>
                <span><strong className="text-cream">Vercel</strong> — hébergement de l'application (USA)</span>
              </li>
            </ul>
            <p className="text-beige text-sm leading-relaxed font-body">
              Toutes les données en transit sont chiffrées via <strong className="text-cream">TLS</strong>.
            </p>
          </div>

          {/* 6. Conservation */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              6. Durée de conservation
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body">
              Vos données sont conservées pendant toute la durée de la compétition (Coupe du Monde 2026),
              puis pendant <strong className="text-cream">90 jours</strong> après la fin du tournoi.
              Passé ce délai, elles sont automatiquement supprimées.
              Vous pouvez demander la suppression anticipée de vos données à tout moment.
            </p>
          </div>

          {/* 7. Droits */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              7. Vos droits
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body mb-3">
              Conformément au RGPD, vous disposez des droits suivants : accès, rectification, suppression et portabilité de vos données.
            </p>
            <p className="text-beige text-sm leading-relaxed font-body">
              Pour exercer ces droits, utilisez la{' '}
              <strong className="text-cream">page de suppression des données</strong> disponible dans l'application,
              ou contactez-nous par email à{' '}
              <a
                href="mailto:pb-prono@pouletbraise.com"
                className="text-gold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                pb-prono@pouletbraise.com
              </a>.
            </p>
          </div>

          {/* 8. Cookies */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              8. Cookies
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body">
              Nous utilisons uniquement un{' '}
              <strong className="text-cream">cookie de session Supabase</strong> (httpOnly),
              strictement nécessaire au fonctionnement de l'authentification.
              Nous n'utilisons aucun cookie publicitaire ni de traçage tiers.
            </p>
          </div>

          {/* 9. Mineurs */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              9. Mineurs
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body">
              Ce service est réservé aux personnes âgées de{' '}
              <strong className="text-cream">13 ans et plus</strong>.
              Nous ne collectons pas sciemment de données relatives à des enfants de moins de 13 ans.
            </p>
          </div>

          {/* 10. Modifications */}
          <div className="bg-bg-card rounded-xl p-4">
            <h2 className="text-gold font-display font-semibold uppercase text-xs tracking-widest mb-3">
              10. Modifications
            </h2>
            <p className="text-beige text-sm leading-relaxed font-body">
              En cas de modification substantielle de cette politique, vous serez notifié directement
              via l'application. La date de dernière mise à jour figurant en haut de cette page
              sera également actualisée.
            </p>
          </div>

        </div>

        {/* Footer note */}
        <p className="text-muted text-xs font-body text-center mt-10">
          © 2026 PB Poulet Braisé — PB Prono CDM
        </p>

      </div>
    </div>
  );
}
