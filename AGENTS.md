# PB Prono CDM — Contexte projet pour IA

## Vue d'ensemble
Application web de pronostics Coupe du Monde 2026, branded **PB Poulet Braisé**. Les joueurs pronostiquent les scores avant chaque match pour gagner des points. Les 10 meilleurs à la fin gagnent une surprise PB.

## URL et déploiement

| Service | URL | Plateforme |
|---------|-----|-----------|
| Site live | https://pb-prono-cdm.vercel.app | Vercel |
| Repo GitHub | https://github.com/tobongi/pb-prono-cdm | GitHub |
| Supabase | app.supabase.com (projet pb-prono-cdm) | Supabase |

**Deploy manuel** (webhook GitHub → Vercel cassé) :
```bash
cd C:/Users/glaib/pb-prono-cdm
npx vercel --prod --yes
```
Toujours depuis la **racine du monorepo** (pas `apps/web`) — sinon path doubling error.

## Architecture

### Monorepo pnpm + Turborepo
```
pb-prono-cdm/
├── apps/
│   ├── web/          # Next.js 14 App Router (Vercel)
│   └── proxy/        # Express.js API (non déployé — données statiques openfootball)
├── supabase/
│   └── migrations/   # SQL migrations (à exécuter manuellement dans SQL Editor)
```

### Stack technique

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | Next.js App Router | 14.2.35 |
| Styling | Tailwind CSS | 3.4 |
| i18n | next-intl | ^4.13.0 |
| Auth | Supabase Auth (Google + Facebook OAuth) | ^2.107 |
| DB | Supabase PostgreSQL | — |
| Realtime | Supabase Realtime (leaderboard) | — |
| PWA | next-pwa + Workbox | ^5.6.0 |
| Data fetching | TanStack Query | ^5.101 |
| Flags | flag-icons CSS | ^7.5.0 |

## Design System

| Token | Valeur | Classe Tailwind |
|-------|--------|-----------------|
| Fond sombre | `#06060e` | `bg-bg-dark` |
| Fond carte | `#1a1a1a` | `bg-bg-card` |
| Olive/vert PB | `#3A4820` | `bg-olive` |
| Or | `#D4A853` | `text-gold` |
| Crème | `#F5F0E8` | `text-cream` |
| Beige | `#C8B89A` | `text-beige` |
| Live/rouge | `#EF4444` | `text-live` |
| Font display | Barlow Condensed 700 | `font-display` |
| Font body | Inter 400/500/600 | `font-body` |
| Fond motif | `pb-pattern.png` tile | `pb-pattern-bg` |

## Pages (App Router)

```
app/
├── layout.tsx                        # Root (fonts, OG meta)
├── page.tsx                          # Redirect → /fr
├── [locale]/
│   ├── layout.tsx                    # NextIntlClientProvider + QueryProvider + ErrorBoundary
│   ├── page.tsx                      # Redirect → /[locale]/accueil
│   ├── (auth)/
│   │   └── login/page.tsx            # Login Google/Facebook (client)
│   ├── onboarding/page.tsx           # Choix du pseudo (client, après 1er login)
│   └── (app)/                        # Protégé — redirect login si pas de session
│       ├── layout.tsx                # Auth check + BottomNav + pb-pattern-bg
│       ├── error.tsx                 # Erreur server components (Next.js error page)
│       ├── accueil/page.tsx          # Accueil + VideoBackground (mobile)
│       ├── calendrier/page.tsx       # Calendrier matchs + polling 30s
│       ├── groupes/page.tsx          # Classements groupes
│       ├── classement/page.tsx       # Leaderboard Realtime
│       ├── mes-pronos/page.tsx       # Historique pronos utilisateur
│       ├── profil/page.tsx           # Profil + points
│       └── pronos/[matchId]/page.tsx # Formulaire prono (client)
└── auth/callback/route.ts            # OAuth callback → exchange code
```

## Composants clés

| Composant | Rôle |
|-----------|------|
| `BottomNav` | Navigation fixe bas — 5 tabs (Accueil/Pronos/Classement/Mes Pronos/Profil) |
| `MatchCard` | Carte match avec drapeaux, score live/final, CTA prono |
| `MatchCardWrapper` | ErrorBoundary local autour de chaque MatchCard |
| `MatchesLive` | Liste matchs + polling 30s via TanStack Query |
| `Flag` | Drapeau via `flag-icons` CSS (`fi fi-xx fis`) |
| `ScoreInput` | Input score +/- avec boutons circulaires |
| `LeaderboardLive` | Classement avec Supabase Realtime |
| `LeaderboardTable` | Table classement avec mise en valeur de l'utilisateur courant |
| `GroupStandings` | Table classement de groupe |
| `VideoBackground` | Vidéo hero mobile (`pb-prono-video.mp4`), autoplay forcé mobile Safari |
| `ErrorBoundary` | React class component — affiche erreur réelle + reload button |
| `OfflineBanner` | Bannière hors-ligne (navigator.onLine) |

## Schéma Supabase (tables)

### `public.users`
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid (PK) | Custom UUID (≠ auth.uid()) |
| provider | text | 'google' \| 'facebook' |
| provider_id | text | = `auth.uid()` (OAuth UUID) |
| pseudo | text | Unique |
| avatar_url | text | |
| device_fp | text | Hash fingerprint device |
| created_at | timestamptz | |

### `public.predictions`
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users.id) | PAS auth.uid() |
| match_id | text | Numéro du match (string) |
| home_score_pred | int | |
| away_score_pred | int | |
| predicted_result | text | 'home' \| 'draw' \| 'away' |
| locked_at | timestamptz | Heure coup d'envoi |
| change_count | int | Défaut 0, max 2 modifications |
| points_earned | int | null tant que non validé |

### `public.special_predictions`
Pronostics vainqueur CDM + finaliste. Même pattern RLS que predictions.

### `public.leaderboard` (view ou table matérialisée)
Colonnes: id, pseudo, avatar_url, total_points, rank, correct_count, exact_count

## RLS — Pattern critique

**IMPORTANT** : `predictions.user_id` = UUID de `public.users.id` (pas `auth.uid()`).
Les policies utilisent un `EXISTS` subquery pour joindre via `provider_id` :

```sql
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE public.users.id = predictions.user_id
      AND public.users.provider_id = auth.uid()::text
  )
)
```

Migrations applicables :
- `supabase/migrations/005_fix_predictions_rls.sql`
- `supabase/migrations/006_fix_special_predictions_rls.sql`
- ✅ Exécutées manuellement dans SQL Editor le 06/06/2026

## Système de points

| Situation | Points |
|-----------|--------|
| Score exact | 7 pts |
| Bon résultat (groupes) | 3 pts |
| Bon résultat (phase KO) | 3 pts |
| Mauvais résultat | 0 pt |

Règle KO : score à 90 min fait foi (pas prolongations).

## Bugs résolus (session 06/06/2026)

| Bug | Cause | Fix |
|-----|-------|-----|
| Spinner bloqué sur page prono | `match.time` = `"21:00 UTC+3"` → `Invalid Date` → `toISOString()` throw → `setSaving(false)` jamais appelé | `getCleanTime()` strip UTC suffix, `try/finally` sur handleSubmit |
| RLS predictions cassée | Policy comparait `auth.uid()` (OAuth UUID) directement avec `user_id` (custom UUID) | EXISTS subquery via `provider_id` (migration 005) |
| Points toujours 0 sur profil | `session.user.id` (OAuth UUID) utilisé pour query predictions au lieu de `data.id` (custom UUID) | Sélectionner `id` dans users, utiliser `data.id` |
| BottomNav doublé | Présent dans `[locale]/layout.tsx` ET `(app)/layout.tsx` | Supprimé de `[locale]/layout.tsx` |
| Flag KSA manquant | `fifa-codes.ts` mappait `SAU` mais pas `KSA` | Ajout `KSA: 'sa'` |
| `validation.ts` colonnes | Mauvais noms de colonnes (`score_home/away`, `match_num`, etc.) | Corrigé → `home_score_pred`, `away_score_pred`, `match_id`, `points_earned` |

## Fichiers publics (`apps/web/public/`)

| Fichier | Description |
|---------|-------------|
| `pb-logo.png` | Logo PB vert foncé original |
| `pb-logo-blanc.png` | Logo PB blanc |
| `pb-logo-transparent.png` | Logo PB fond transparent (généré via PIL) |
| `pb-logo.svg` | ⚠️ FAKE SVG (approximation) — ne pas utiliser |
| `pb-pattern.png` | Motif poulet tuilable (fond des pages app) |
| `pb-prono-video.mp4` | Vidéo hero (mobile/tablette) |
| `icons/icon-192.png` | PWA icon 192px |
| `icons/icon-512.png` | PWA icon 512px + OG image |
| `icons/icon-512-maskable.png` | PWA icon maskable (fond olive #3B4A1D) |
| `manifest.json` | PWA manifest |
| `sw.js` | Service Worker généré par next-pwa |

**Logos source** : `C:\Users\glaib\Downloads\La-Maison-PB\Nouvelle DA La Maison PB-20260224T065736Z-3-001\Nouvelle DA La Maison PB\Logos\`

## Variables d'environnement Vercel

| Variable | Usage |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase (public) |
| `SUPABASE_SERVICE_KEY` | Clé service Supabase (server only) |
| `PROXY_URL` | URL du proxy Express (si déployé) |

## Notes techniques importantes

### `match.time` format
Le proxy retourne `match.time` avec timezone suffix : `"21:00 UTC+3"`.
Toujours utiliser `getCleanTime(match.time)` (défini dans `pronos/[matchId]/page.tsx`) :
```tsx
function getCleanTime(raw?: string): string {
  return (raw ?? '21:00').replace(/\s*UTC[+-]\d+/gi, '').trim() || '21:00'
}
```

### Auth — UUID double
- `session.user.id` = OAuth UUID (provider) — NE PAS utiliser pour queries DB
- `public.users.id` = UUID custom — toujours fetch via `.eq('provider_id', session.user.id)`

### Deploy Vercel
- GitHub webhook cassé → toujours `npx vercel --prod --yes` depuis la racine
- Ne JAMAIS `cd apps/web && npx vercel` — cause path doubling `apps/web/apps/web`

### Proxy Express (`apps/proxy/`)
- Non déployé — fonctionne en local uniquement (`npm run dev` port 3001)
- Sur Vercel, `PROXY_URL` pointe vers... rien de stable (à déployer Railway si données live)
- Les pages `calendrier` et `groupes` ont des `try/catch` qui retournent `[]` si le proxy est down
- Les API routes Next.js (`/api/matches`, `/api/groups`) proxifient vers `PROXY_URL`

### PWA Service Worker
- Actif en production (désactivé en dev)
- Cache `StaleWhileRevalidate` pour `/api/groups` (1h)
- Cache `NetworkFirst` pour `/api/matches` (60s, timeout 5s)

## Commandes utiles

```bash
# Dev local
cd apps/web && npx next dev

# Build local
cd apps/web && npx next build

# Deploy production
cd C:/Users/glaib/pb-prono-cdm && npx vercel --prod --yes

# Push GitHub
git push origin main
```
