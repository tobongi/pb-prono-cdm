# PB Prono CDM — Design Spec
**Date** : 2026-06-05  
**Produit** : PWA de pronostics Coupe du Monde 2026 pour PB Poulet Braisé  
**Repo** : https://github.com/tobongi/pb-prono-cdm  
**Statut** : Approuvé — prêt pour implémentation

---

## 1. Contexte & Objectif

PB Poulet Braisé offre à ses clients un jeu de pronostics gratuit pour la Coupe du Monde 2026. Les utilisateurs se connectent via login social, pronostiquent les résultats des 104 matchs (+ pronostics spéciaux pré-tournoi), et s'affrontent sur un classement global. L'app affiche aussi toute la structure du tournoi en temps réel (poules, calendrier, scores live, bracket).

**Marché cible** : France. Jeu gratuit, sans argent réel — hors champ ANJ/KYC.  
**Langues** : Français (défaut) + Anglais (bascule dans Profil).  
**Plateforme** : PWA installable mobile + desktop.

---

## 2. Brand Design System

### Palette de couleurs

| Token CSS | Hex | Usage |
|-----------|-----|-------|
| `--bg-dark` | `#0D100A` | Fond principal (noir à tinte verte) |
| `--bg-card` | `#1C2012` | Fond des cartes |
| `--olive-brand` | `#3A4020` | Headers, fonds secondaires |
| `--cream` | `#F5EFE6` | Texte principal |
| `--beige-warm` | `#EDD9BC` | Texte secondaire, icônes |
| `--gold-cta` | `#D4A84B` | CTA, accents, points ("poulet doré") |
| `--gray-muted` | `#C8C8C2` | Texte désactivé, slots inconnus |
| `--live-red` | `#FF3B3B` | Badge EN DIRECT (pulsant) |
| `--success` | `#6DB56D` | Pronostic correct |
| `--error` | `#E05555` | Pronostic raté |

### Typographie

- **Titres / scores / labels forts** : `Barlow Condensed Bold` (Google Fonts) — compact, sportif
- **Corps / labels courants** : `Inter` (Google Fonts) — lisible, neutre
- **Logo** : SVG/PNG PB Poulet Braisé (cercle PB + texte italic), assets fournis par le client

### Texture signature

Motif silhouettes de poulet (extrait brand book page 6, vert olive sur vert olive foncé) utilisé en filigrane à opacity 5% sur : écran login, header app. Jamais sur les cartes ou zones de lecture.

### Ton éditorial

Direct, tonique, chaleureux. Pas de jargon tech.  
Exemples : "JE PRONOSTIQUE →" (pas "Submit"), "TON PRONO" (pas "Votre pronostic"), "PB TE RÉGALE".

---

## 3. Architecture Technique

### Stack

| Couche | Technologie | Hébergement |
|--------|-------------|-------------|
| Frontend PWA | Next.js 14 App Router + TypeScript | Vercel (gratuit) |
| Styles | Tailwind CSS | — |
| i18n | next-intl (FR défaut, EN) | — |
| Auth | Supabase Auth (Google + Facebook OAuth) | Supabase |
| State serveur | TanStack Query | — |
| Base de données | Supabase PostgreSQL | Supabase (gratuit 500 MB) |
| Realtime leaderboard | Supabase Realtime | Supabase |
| Backend proxy | Node.js / Express | Railway (~5$/mois) |
| API live scores | rezarahiminia/worldcup2026 (Docker) | Railway |
| MongoDB | MongoDB (pour worldcup2026) | Railway |
| PWA | next-pwa (Workbox) | — |

### Schéma des couches

```
[ PWA Next.js 14 — Vercel ]
         │
         ▼
[ Backend Proxy Express — Railway ]
      ╱              ╲
     ▼                ▼
[ openfootball ]   [ worldcup2026 API — Railway ]
  JSON statique      Node.js + MongoDB
  (cache 24h)        (cache 30s)
         │
         ▼
[ Supabase PostgreSQL ]
  users · predictions · leaderboard
```

### Règle fondamentale

Le frontend n'appelle **jamais** les sources de données directement. Tout transite par le backend proxy Railway, qui fusionne et cache les données avant de les servir.

---

## 4. Sources de données

### openfootball (statique)

- Repo : `https://github.com/openfootball/worldcup.json` dossier `/2026`
- Fichiers : `worldcup.json` (matchs + groupes), `worldcup.teams.json`, `worldcup.stadiums.json`
- Chargés une fois au démarrage du proxy, mis en cache 24h
- Données : calendrier complet, 48 équipes, 12 groupes, 16 stades, 104 matchs

### worldcup2026 API (live)

- Repo : `https://github.com/rezarahiminia/worldcup2026`
- Cloné et auto-hébergé sur Railway (Docker)
- Endpoints utilisés : `/get/games`, `/get/groups`, `/get/teams`
- TTL cache proxy : 30 secondes
- Résilience : si source live indisponible → servir dernière valeur connue + flag `stale: true`

### Logique de fusion

Clé de matching : `date_utc + normalize(team_home) + normalize(team_away)`

```typescript
// lib/team-aliases.ts — table centralisée des 48 équipes
const ALIASES: Record<string, string> = {
  "usa": "united states",
  "états-unis": "united states",
  "corée du sud": "south korea",
  "republic of korea": "south korea",
  // ... 48 entrées
}

function normalize(name: string): string {
  return name.toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(ALIASES[name] ?? name, v => ALIASES[v] ?? v)
}
```

---

## 5. Modèle de données (Supabase PostgreSQL)

### Table `users`

```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
provider      text NOT NULL  -- 'google' | 'facebook'
provider_id   text NOT NULL
pseudo        text NOT NULL
avatar_url    text
device_fp     text           -- fingerprint anti-fraude
created_at    timestamptz DEFAULT now()

UNIQUE (provider, provider_id)  -- anti multi-comptes
```

### Table `predictions`

```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id           uuid REFERENCES users(id)
match_id          text NOT NULL    -- clé openfootball
home_score_pred   int NOT NULL
away_score_pred   int NOT NULL
predicted_result  text            -- 'home' | 'draw' | 'away' (calculé)
actual_result     text            -- rempli après le match
points_earned     int             -- null tant que non validé
locked_at         timestamptz     -- heure de verrouillage
created_at        timestamptz DEFAULT now()

UNIQUE (user_id, match_id)
```

### Table `special_predictions`

```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id           uuid REFERENCES users(id)
winner_team_id    text NOT NULL
runner_up_team_id text NOT NULL
locked_at         timestamptz     -- verrouillé au 11/06 00:00 UTC
points_earned     int

UNIQUE (user_id)
```

### Vue `leaderboard`

```sql
CREATE VIEW leaderboard AS
SELECT
  u.id,
  u.pseudo,
  u.avatar_url,
  COALESCE(SUM(p.points_earned), 0) +
    COALESCE(sp.points_earned, 0) AS total_points,
  COUNT(p.id) AS predictions_count,
  COUNT(CASE WHEN p.points_earned > 0 THEN 1 END) AS correct_count,
  COUNT(CASE WHEN p.home_score_pred = actual_home
              AND p.away_score_pred = actual_away THEN 1 END) AS exact_count,
  RANK() OVER (ORDER BY total_points DESC) AS rank
FROM users u
LEFT JOIN predictions p ON p.user_id = u.id
LEFT JOIN special_predictions sp ON sp.user_id = u.id
GROUP BY u.id, u.pseudo, u.avatar_url, sp.points_earned
```

---

## 6. Barème des points

### Phase de groupes (matchs 1–48)

| Pronostic | Points |
|-----------|--------|
| Bon résultat (1-N-2 correct) | **3 pts** |
| Score exact | **7 pts** (inclut les 3 pts résultat) |

### Phase finale (Round of 32 → Finale)

| Pronostic | Points |
|-----------|--------|
| Bon résultat | **5 pts** |
| Score exact | **12 pts** |

### Pronostics spéciaux (saisis avant le 11/06/2026 00:00 UTC)

| Pronostic | Points |
|-----------|--------|
| Vainqueur de la compétition | **20 pts** |
| Finaliste perdant | **10 pts** |

### Règle de validation

- Validation automatique déclenchée par le backend proxy quand le statut du match passe à `finished` dans l'API live
- Mise à jour de `predictions.points_earned` en base
- Notification Supabase Realtime → mise à jour du leaderboard côté client

---

## 7. Authentification & Anti-fraude

### Auth (Supabase Auth)

- Providers : Google (prioritaire) + Facebook
- Pas de mot de passe, pas de SMS
- Session : JWT Supabase, refresh automatique
- Après 1er login → onboarding (choix pseudo)
- Unicité : `UNIQUE (provider, provider_id)` en base

### Anti-fraude (gratuit, sans SMS)

1. **Déduplication par identité** : un compte Google = un joueur (contrainte DB)
2. **Device fingerprint** : hash de `navigator.userAgent + screen.width + timezone` stocké à l'inscription, loggé pour détection de masse
3. **Rate limiting** côté proxy :
   - 100 req/min par IP (express-rate-limit)
   - Max 10 soumissions de pronostics par minute par user_id

---

## 8. PWA — Manifest & Service Worker

### manifest.json

```json
{
  "name": "PB Prono CDM",
  "short_name": "PB Prono",
  "description": "Pronostique la Coupe du Monde 2026 avec PB Poulet Braisé",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3A4020",
  "background_color": "#0D100A",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Stratégies Workbox (next-pwa)

| Ressource | Stratégie | TTL |
|-----------|-----------|-----|
| JS/CSS/fonts | Cache First | Indéfini |
| Drapeaux / logos | Cache First | 30 jours |
| Calendrier + poules (proxy) | Stale While Revalidate | 1h |
| Scores live (proxy) | Network First + fallback cache | 30s |
| Pronostics utilisateur | Network First | — |

### Mode hors-ligne

Afficher dernière donnée connue + badge "⚠ Données du [heure]" en haut de page.  
Les formulaires de pronostic sont désactivés hors-ligne (impossible de garantir l'heure de soumission).

---

## 9. Écrans & Navigation

### Bottom Navigation (5 tabs fixes)

```
🏠 Accueil  |  🎯 Pronos  |  🏆 Classement  |  📅 Calendrier  |  👤 Profil
```

### Liste des 12 écrans

#### E1 — Login
- Background : photo stade + overlay `#0D100A` 80% + texture poulet opacity 5%
- Logo PB centré
- Accroche : "PB TE RÉGALE · PRONOSTIQUE LA COUPE DU MONDE 2026"
- 2 boutons OAuth : Google (prioritaire) + Facebook
- Mention : "Jeu gratuit · Sans enjeu réel"

#### E2 — Onboarding (1 fois)
- Choix pseudo (pré-rempli depuis le provider, modifiable)
- Avatar affiché (récupéré OAuth)
- CTA : "C'EST PARTI →"
- Déclenché uniquement au 1er login

#### E3 — Accueil
- Header : Logo PB + pseudo utilisateur
- "À TOI DE JOUER · [DATE DU JOUR]"
- Card match vedette (prochain match non pronostiqué) :
  - Groupe, heure locale, drapeaux, countdown
  - CTA "JE PRONOSTIQUE →" (gold)
- Bandeau "🌟 PRONOSTICS SPÉCIAUX" si avant le 11/06 et non encore saisis
- Widget "Ma position" : rang + points totaux

#### E4 — Saisie Pronostic (vue match)
- Header : groupe + date + heure locale
- Drapeaux + noms des équipes
- 2 inputs numériques score (clavier natif)
- Résultat prévu calculé automatiquement (ex: "MEX gagne")
- CTA "VALIDER MON PRONO →" (gold)
- Mention "⚠ Ferme au coup d'envoi [heure locale]"
- Si prono déjà existant : pré-rempli + "MODIFIER MON PRONO"
- Si match verrouillé : inputs désactivés + score réel affiché

#### E5 — Pronostics (liste)
- Tabs : "À VENIR" / "MES PRONOS"
- Cards groupées par date, triées par heure
- États d'une card :
  - À pronostiquer → CTA "PRONOSTIQUER →"
  - Prono saisi → score prédit affiché
  - Fermé en cours → "🔴 EN DIRECT"
  - Terminé correct → score réel + "✓ +X pts" (vert)
  - Terminé raté → score réel + "✗ +Xpts" (rouge, avec pts partiels si bon résultat)

#### E6 — Classement
- Titre "TOP PRONOSTIQUEURS · CLASSEMENT"
- Podium top 3 : icônes 🥇🥈🥉 + pseudo + points (mis en valeur visuellement)
- Liste scrollable positions 4+
- Séparateur "─── Tu es ici ───" avec highlight gold pour la position de l'utilisateur
- Mis à jour via Supabase Realtime après chaque match validé

#### E7 — Calendrier / Live
- 3 tabs : "CALENDRIER" / "POULES" / "BRACKET"

**Tab Calendrier :**
- Filtre rapide : Tous / Groupe A-L / Phase finale
- Groupé par journée
- Card match EN DIRECT : badge rouge pulsant + score live + minute
- Card match à venir : heure locale + groupes + bouton prono si applicable
- Card match terminé : score final + résultat

**Tab Poules (12 groupes A→L) :**
- Sélecteur groupe (chips horizontaux scrollables)
- Tableau : Équipe · J · G · N · P · BP · BC · Diff · Pts
- Mise à jour live depuis l'API

**Tab Bracket :**
- Arbre Round of 32 → R16 → QF → SF → Finale
- Scrollable horizontalement
- Slots vides en grisé (`--gray-muted`) avec "?"
- Se remplit automatiquement selon les résultats

#### E8 — Profil
- Avatar + pseudo + "#X au classement"
- Stats : Total pts / Nb pronos / % bons résultats / % scores exacts
- Liens : "Comment jouer →" / "Mes pronostics →" / "Pronostics spéciaux →"
- Toggle langue FR | EN
- Bouton "Se déconnecter" (en bas, discret)

#### E9 — Pronostics Spéciaux
- Accessible depuis Accueil (bandeau) + Profil
- Verrouillé après le 11/06/2026 00:00 UTC
- Section 1 : "QUI VA GAGNER LA COUPE ?" → liste 48 équipes scrollable + recherche
- Section 2 : "QUI SERA FINALISTE ?" → même UX, équipe différente du vainqueur imposée
- Résumé barème : Vainqueur 20 pts / Finaliste 10 pts
- CTA "VALIDER →" (gold)
- Si déjà saisis : affichage en lecture seule avec bouton "MODIFIER" (si avant verrouillage)

#### E10 — Bracket (Tableau Final)
- Vue dédiée accessible depuis tab Calendrier
- Rendu SVG ou HTML/CSS imbriqué
- Couleur : gagnant en `--cream`, perdant en `--gray-muted`
- Zoom/scroll natif sur mobile

#### E11 — Comment Jouer
- Page scrollable, accessible depuis Profil
- 4 sections avec icônes :
  1. 🎯 PRONOSTIQUE — règle de verrouillage
  2. ⭐ LE BARÈME — tableau complet des points
  3. 🌟 PRONOS SPÉCIAUX — vainqueur/finaliste
  4. 🏆 CLASSEMENT — mise à jour + récompenses PB

#### E12 — Confirmation Pronostic
- Affiché 2s après validation, puis retour automatique
- Checkmark animé (scale-in gold)
- Résumé : score pronostiqué + message "Modifiable jusqu'à [heure]"
- CTA "PRONOSTIC SUIVANT →" si d'autres matchs ce jour non pronostiqués
- CTA "RETOUR" sinon

---

## 10. Temps Réel & Polling

### Scores live (pendant un match)

- Polling toutes les **30 secondes** via le backend proxy (TTL cache 30s)
- Déclenché uniquement quand au moins un match a le statut `in_progress`
- Indicateur "🔴 EN DIRECT" avec badge pulsant CSS
- Pas de WebSocket pour les scores (polling suffisant, plus simple)

### Leaderboard

- **Supabase Realtime** sur la table `predictions` (INSERT/UPDATE)
- Mise à jour UI sans rechargement de page après validation d'un match

### Résilience source live

Si `/get/games` ne répond pas en < 3s :
1. Servir le dernier cache connu
2. Ajouter le flag `stale: true` dans la réponse
3. Frontend affiche "⚠ Données possiblement en retard" (discret, en `--beige-warm`)

---

## 11. Internationalisation (i18n)

- Lib : `next-intl`
- Locales : `fr` (défaut), `en`
- Tous les textes dans `/messages/fr.json` et `/messages/en.json`
- Aucun texte hardcodé dans les composants
- Horaires : toujours affichés en heure locale via `Intl.DateTimeFormat` (détection auto navigateur)
- Dates en UTC côté backend, converties côté frontend

---

## 12. Infrastructure Docker (Railway)

```yaml
# docker-compose.yml (Railway)
version: "3.8"
services:
  proxy:
    build: ./apps/proxy
    ports: ["3001:3001"]
    environment:
      - MONGODB_URL=mongodb://mongodb:27017/worldcup
      - WORLDCUP_API_URL=http://worldcup:3002
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
    depends_on: [worldcup, mongodb]

  worldcup:
    build: ./apps/worldcup-api  # clone rezarahiminia/worldcup2026
    ports: ["3002:3002"]
    environment:
      - MONGODB_URL=mongodb://mongodb:27017/worldcup
    depends_on: [mongodb]

  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 13. Sécurité

- Variables sensibles : `.env.local` (local) + Vercel/Railway env vars (prod)
- Jamais de clés en dur dans le code
- RLS (Row Level Security) Supabase activé sur toutes les tables
- Politique RLS `predictions` : un utilisateur ne peut lire/écrire que ses propres pronostics
- Le leaderboard est une vue publique (lecture seule, pas de données sensibles)
- Headers sécurité Next.js : `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`

---

## 14. Plan de Build (8 phases)

| Phase | Contenu | Livrable |
|-------|---------|----------|
| 1 | Socle statique : openfootball → poules + calendrier + équipes | Pages visibles sans live ni auth |
| 2 | Backend proxy + cache : API unifiée, fusion team-aliases | Endpoint `/api/matches`, `/api/groups` |
| 3 | PWA : manifest + service worker + mode hors-ligne | Lighthouse PWA score > 90 |
| 4 | Auth : Supabase Google+Facebook, onboarding, profil, RLS | Login fonctionnel |
| 5 | Live : worldcup2026 Docker, fusion clé composite, scores live | Scores temps réel |
| 6 | Pronostics + classement : saisie, verrouillage, validation, points | Jeu complet jouable |
| 7 | Temps réel : polling 30s, Supabase Realtime leaderboard, badge EN DIRECT | UX live complète |
| 8 | Résilience + déploiement : gestion pannes, docker-compose final, doc | Production-ready |

---

*Spec approuvée le 2026-06-05. Auteur : Gael Bokongo × Claude Sonnet 4.6*
