# PB Prono CDM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PWA de pronostics Coupe du Monde 2026 branded PB Poulet Braisé — login social, score exact + résultat 1N2, classement temps réel, scores live.

**Architecture:** Monorepo pnpm avec deux apps — `web` (Next.js 14 PWA sur Vercel) et `proxy` (Express sur Railway). Supabase pour PostgreSQL + Auth OAuth. Source live `rezarahiminia/worldcup2026` conteneurisée sur Railway, fusionnée avec données statiques openfootball par clé `date+equipes`.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase, next-intl, next-pwa, Express, Vitest, pnpm workspaces, Docker

**Spec:** `docs/superpowers/specs/2026-06-05-pb-prono-cdm-design.md`

---

## File Map

```
pb-prono-cdm/
├── apps/
│   ├── web/                              # Next.js 14 PWA → Vercel
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── (auth)/login/page.tsx
│   │   │   │   ├── onboarding/page.tsx
│   │   │   │   └── (app)/
│   │   │   │       ├── layout.tsx        # bottom nav
│   │   │   │       ├── page.tsx          # Accueil
│   │   │   │       ├── pronos/page.tsx
│   │   │   │       ├── pronos/[matchId]/page.tsx
│   │   │   │       ├── classement/page.tsx
│   │   │   │       ├── calendrier/page.tsx
│   │   │   │       ├── profil/page.tsx
│   │   │   │       ├── profil/comment-jouer/page.tsx
│   │   │   │       └── pronos-speciaux/page.tsx
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── match-card.tsx
│   │   │   ├── score-input.tsx
│   │   │   ├── prediction-form.tsx
│   │   │   ├── confirmation-overlay.tsx
│   │   │   ├── leaderboard-table.tsx
│   │   │   ├── group-standings.tsx
│   │   │   ├── bracket.tsx
│   │   │   ├── live-badge.tsx
│   │   │   ├── countdown.tsx
│   │   │   └── flag.tsx
│   │   ├── lib/
│   │   │   ├── supabase/client.ts
│   │   │   ├── supabase/server.ts
│   │   │   ├── supabase/types.ts
│   │   │   ├── api.ts                    # calls to proxy
│   │   │   ├── scoring.ts
│   │   │   ├── device-fp.ts
│   │   │   └── hooks/
│   │   │       ├── use-matches.ts
│   │   │       ├── use-predictions.ts
│   │   │       └── use-leaderboard.ts
│   │   ├── messages/fr.json
│   │   ├── messages/en.json
│   │   ├── public/manifest.json
│   │   ├── public/icons/icon-192.png
│   │   ├── public/icons/icon-512.png
│   │   ├── middleware.ts
│   │   ├── i18n.ts
│   │   ├── next.config.ts
│   │   └── tailwind.config.ts
│   └── proxy/                            # Express → Railway
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/matches.ts
│       │   ├── routes/groups.ts
│       │   ├── routes/teams.ts
│       │   ├── services/openfootball.ts
│       │   ├── services/worldcup-live.ts
│       │   ├── services/merger.ts
│       │   ├── lib/team-aliases.ts
│       │   ├── lib/normalize.ts
│       │   └── lib/cache.ts
│       ├── tests/
│       │   ├── normalize.test.ts
│       │   └── merger.test.ts
│       └── Dockerfile
├── supabase/migrations/
│   ├── 001_users.sql
│   ├── 002_predictions.sql
│   ├── 003_special_predictions.sql
│   └── 004_leaderboard_view.sql
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

---

## Phase 1 — Monorepo + Socle Statique

### Task 1: Monorepo setup

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `apps/web/package.json`
- Create: `apps/proxy/package.json`

- [ ] **Step 1: Init workspace root**

```bash
cd C:\Users\glaib\pb-prono-cdm
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
```

Create root `package.json`:
```json
{
  "name": "pb-prono-cdm",
  "private": true,
  "scripts": {
    "dev:web": "pnpm --filter web dev",
    "dev:proxy": "pnpm --filter proxy dev",
    "build:web": "pnpm --filter web build",
    "test": "pnpm --filter proxy test"
  },
  "engines": { "node": ">=20", "pnpm": ">=9" }
}
```

- [ ] **Step 2: Scaffold Next.js web app**

```bash
pnpm create next-app@14 apps/web --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-eslint
```

- [ ] **Step 3: Add web dependencies**

```bash
cd apps/web
pnpm add @supabase/supabase-js @supabase/ssr next-intl next-pwa @tanstack/react-query
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 4: Scaffold proxy app**

```bash
mkdir -p apps/proxy/src/routes apps/proxy/src/services apps/proxy/src/lib apps/proxy/tests
```

Create `apps/proxy/package.json`:
```json
{
  "name": "proxy",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.0.0",
    "node-fetch": "^3.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 5: Install all deps + commit**

```bash
cd C:\Users\glaib\pb-prono-cdm
pnpm install
git add .
git commit -m "feat: init monorepo pnpm workspaces — web + proxy"
```

---

### Task 2: Design tokens + Tailwind config

**Files:**
- Modify: `apps/web/tailwind.config.ts`
- Create: `apps/web/app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0D100A',
          card: '#1C2012',
        },
        olive: '#3A4020',
        cream: '#F5EFE6',
        beige: '#EDD9BC',
        gold: '#D4A84B',
        muted: '#C8C8C2',
        live: '#FF3B3B',
        success: '#6DB56D',
        error: '#E05555',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg-dark text-cream font-body;
  }
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.animate-live {
  animation: pulse-live 1.5s ease-in-out infinite;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/tailwind.config.ts apps/web/app/globals.css
git commit -m "feat: add PB brand design tokens to Tailwind"
```

---

### Task 3: Supabase migrations

**Files:**
- Create: `supabase/migrations/001_users.sql`
- Create: `supabase/migrations/002_predictions.sql`
- Create: `supabase/migrations/003_special_predictions.sql`
- Create: `supabase/migrations/004_leaderboard_view.sql`

- [ ] **Step 1: Create users migration**

Create `supabase/migrations/001_users.sql`:
```sql
CREATE TABLE public.users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider      text NOT NULL CHECK (provider IN ('google', 'facebook')),
  provider_id   text NOT NULL,
  pseudo        text NOT NULL CHECK (length(pseudo) BETWEEN 2 AND 20),
  avatar_url    text,
  device_fp     text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_id)
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text);
```

- [ ] **Step 2: Create predictions migration**

Create `supabase/migrations/002_predictions.sql`:
```sql
CREATE TABLE public.predictions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_id          text NOT NULL,
  home_score_pred   int NOT NULL CHECK (home_score_pred >= 0),
  away_score_pred   int NOT NULL CHECK (away_score_pred >= 0),
  predicted_result  text CHECK (predicted_result IN ('home', 'draw', 'away')),
  actual_home_score int,
  actual_away_score int,
  actual_result     text CHECK (actual_result IN ('home', 'draw', 'away')),
  points_earned     int,
  locked_at         timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage own predictions"
  ON public.predictions FOR ALL
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "leaderboard can read all points"
  ON public.predictions FOR SELECT
  USING (true);
```

- [ ] **Step 3: Create special predictions migration**

Create `supabase/migrations/003_special_predictions.sql`:
```sql
CREATE TABLE public.special_predictions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  winner_team_id    text NOT NULL,
  runner_up_team_id text NOT NULL,
  locked_at         timestamptz,
  points_earned     int,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.special_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage own special predictions"
  ON public.special_predictions FOR ALL
  USING (auth.uid()::text = user_id::text);
```

- [ ] **Step 4: Create leaderboard view**

Create `supabase/migrations/004_leaderboard_view.sql`:
```sql
CREATE VIEW public.leaderboard AS
SELECT
  u.id,
  u.pseudo,
  u.avatar_url,
  COALESCE(SUM(p.points_earned), 0) + COALESCE(sp.points_earned, 0) AS total_points,
  COUNT(p.id) AS predictions_count,
  COUNT(CASE WHEN p.points_earned > 0 THEN 1 END) AS correct_count,
  COUNT(CASE WHEN p.home_score_pred = p.actual_home_score
              AND p.away_score_pred = p.actual_away_score THEN 1 END) AS exact_count,
  RANK() OVER (ORDER BY (COALESCE(SUM(p.points_earned), 0) + COALESCE(sp.points_earned, 0)) DESC) AS rank
FROM public.users u
LEFT JOIN public.predictions p ON p.user_id = u.id
LEFT JOIN public.special_predictions sp ON sp.user_id = u.id
GROUP BY u.id, u.pseudo, u.avatar_url, sp.points_earned;
```

- [ ] **Step 5: Apply migrations**

```bash
# Install Supabase CLI if needed
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```

Expected: "Applying migration 001_users.sql... Done" × 4

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase migrations — users, predictions, leaderboard"
```

---

### Task 4: openfootball data loader (proxy)

**Files:**
- Create: `apps/proxy/src/lib/team-aliases.ts`
- Create: `apps/proxy/src/lib/normalize.ts`
- Create: `apps/proxy/src/lib/cache.ts`
- Create: `apps/proxy/src/services/openfootball.ts`
- Create: `apps/proxy/tests/normalize.test.ts`

- [ ] **Step 1: Write normalize tests**

Create `apps/proxy/tests/normalize.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { normalizeTeam } from '../src/lib/normalize'

describe('normalizeTeam', () => {
  it('lowercases and strips accents', () => {
    expect(normalizeTeam('États-Unis')).toBe('united states')
  })
  it('resolves known alias', () => {
    expect(normalizeTeam('USA')).toBe('united states')
  })
  it('handles Corée du Sud', () => {
    expect(normalizeTeam('Corée du Sud')).toBe('south korea')
  })
  it('passes through unknown names normalized', () => {
    expect(normalizeTeam('France')).toBe('france')
  })
})
```

- [ ] **Step 2: Run test — verify FAIL**

```bash
cd apps/proxy && pnpm test
```

Expected: FAIL — "Cannot find module '../src/lib/normalize'"

- [ ] **Step 3: Create team-aliases.ts**

Create `apps/proxy/src/lib/team-aliases.ts`:
```typescript
export const TEAM_ALIASES: Record<string, string> = {
  'usa': 'united states',
  'etats-unis': 'united states',
  'états-unis': 'united states',
  'u.s.a.': 'united states',
  'coree du sud': 'south korea',
  'corée du sud': 'south korea',
  'republic of korea': 'south korea',
  'corea del sur': 'south korea',
  'iran': 'ir iran',
  'cote d\'ivoire': 'ivory coast',
  'côte d\'ivoire': 'ivory coast',
  'czech republic': 'czechia',
  'north macedonia': 'north macedonia',
  'trinidad & tobago': 'trinidad and tobago',
  'dr congo': 'democratic republic of congo',
  'uae': 'united arab emirates',
  'new zealand': 'new zealand',
}
```

- [ ] **Step 4: Create normalize.ts**

Create `apps/proxy/src/lib/normalize.ts`:
```typescript
import { TEAM_ALIASES } from './team-aliases'

export function normalizeTeam(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
  return TEAM_ALIASES[base] ?? base
}

export function matchKey(date: string, home: string, away: string): string {
  return `${date}|${normalizeTeam(home)}|${normalizeTeam(away)}`
}
```

- [ ] **Step 5: Run test — verify PASS**

```bash
cd apps/proxy && pnpm test
```

Expected: PASS — 4 tests

- [ ] **Step 6: Create cache.ts**

Create `apps/proxy/src/lib/cache.ts`:
```typescript
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function getCache<T>(key: string): { data: T; stale: boolean } | null {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  return { data: entry.data, stale: Date.now() > entry.expiresAt }
}
```

- [ ] **Step 7: Create openfootball.ts**

Create `apps/proxy/src/services/openfootball.ts`:
```typescript
import { setCache, getCache } from '../lib/cache'
import { matchKey } from '../lib/normalize'

const BASE = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026'
const TTL = 24 * 60 * 60 * 1000 // 24h

export interface OFMatch {
  num: number
  date: string        // "2026-06-11"
  time?: string       // "21:00"
  team1: { name: string; code: string }
  team2: { name: string; code: string }
  score?: { ft: [number, number] }
  group?: string
  round?: string
}

export interface OFGroup {
  name: string
  teams: Array<{ name: string; code: string }>
  matches: OFMatch[]
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`openfootball fetch failed: ${res.status}`)
  return res.json() as Promise<T>
}

export async function getMatches(): Promise<OFMatch[]> {
  const cached = getCache<OFMatch[]>('of:matches')
  if (cached && !cached.stale) return cached.data

  const data = await fetchJSON<{ rounds: Array<{ matches: OFMatch[] }> }>(
    `${BASE}/worldcup.json`
  )
  const matches = data.rounds.flatMap(r => r.matches)
  setCache('of:matches', matches, TTL)
  return matches
}

export async function getGroups(): Promise<OFGroup[]> {
  const cached = getCache<OFGroup[]>('of:groups')
  if (cached && !cached.stale) return cached.data

  const data = await fetchJSON<{ groups: OFGroup[] }>(`${BASE}/worldcup.json`)
  setCache('of:groups', data.groups, TTL)
  return data.groups
}

export function buildMatchIndex(matches: OFMatch[]): Map<string, OFMatch> {
  const index = new Map<string, OFMatch>()
  for (const m of matches) {
    const key = matchKey(m.date, m.team1.name, m.team2.name)
    index.set(key, m)
  }
  return index
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/proxy/
git commit -m "feat: openfootball data loader with normalize + cache"
```

---

### Task 5: Proxy routes — matches + groups

**Files:**
- Create: `apps/proxy/src/routes/matches.ts`
- Create: `apps/proxy/src/routes/groups.ts`
- Create: `apps/proxy/src/index.ts`

- [ ] **Step 1: Create matches route**

Create `apps/proxy/src/routes/matches.ts`:
```typescript
import { Router } from 'express'
import { getMatches } from '../services/openfootball'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const matches = await getMatches()
    res.json({ matches, stale: false })
  } catch (err) {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

router.get('/:matchId', async (req, res) => {
  try {
    const matches = await getMatches()
    const match = matches.find(m => String(m.num) === req.params.matchId)
    if (!match) return res.status(404).json({ error: 'not_found' })
    res.json({ match, stale: false })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
```

- [ ] **Step 2: Create groups route**

Create `apps/proxy/src/routes/groups.ts`:
```typescript
import { Router } from 'express'
import { getGroups } from '../services/openfootball'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const groups = await getGroups()
    res.json({ groups, stale: false })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
```

- [ ] **Step 3: Create Express app entry**

Create `apps/proxy/src/index.ts`:
```typescript
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import matchesRouter from './routes/matches'
import groupsRouter from './routes/groups'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.WEB_URL ?? '*' }))
app.use(express.json())

const limiter = rateLimit({ windowMs: 60_000, max: 100 })
app.use(limiter)

app.use('/api/matches', matchesRouter)
app.use('/api/groups', groupsRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Proxy running on :${PORT}`))
```

- [ ] **Step 4: Start proxy + verify**

```bash
cd apps/proxy && pnpm dev
```

In another terminal:
```bash
curl http://localhost:3001/health
```

Expected: `{"ok":true}`

```bash
curl http://localhost:3001/api/groups | head -c 200
```

Expected: JSON with group data from openfootball

- [ ] **Step 5: Commit**

```bash
git add apps/proxy/src/
git commit -m "feat: Express proxy routes /api/matches and /api/groups"
```

---

### Task 6: Next.js — Poules + Calendrier pages (static, no auth)

**Files:**
- Create: `apps/web/lib/api.ts`
- Create: `apps/web/app/[locale]/layout.tsx`
- Create: `apps/web/app/[locale]/(app)/calendrier/page.tsx`
- Create: `apps/web/app/[locale]/(app)/calendrier/groups-tab.tsx`
- Create: `apps/web/components/match-card.tsx`
- Create: `apps/web/components/flag.tsx`

- [ ] **Step 1: Create API client**

Create `apps/web/lib/api.ts`:
```typescript
const PROXY = process.env.NEXT_PUBLIC_PROXY_URL ?? 'http://localhost:3001'

export interface Match {
  num: number
  date: string
  time?: string
  team1: { name: string; code: string }
  team2: { name: string; code: string }
  score?: { ft: [number, number] }
  group?: string
  status?: 'upcoming' | 'live' | 'finished'
  minute?: number
}

export interface Group {
  name: string
  teams: Array<{ name: string; code: string }>
  matches: Match[]
}

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${PROXY}/api/matches`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.matches
}

export async function fetchGroups(): Promise<Group[]> {
  const res = await fetch(`${PROXY}/api/groups`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch groups')
  const data = await res.json()
  return data.groups
}
```

- [ ] **Step 2: Create flag component**

Create `apps/web/components/flag.tsx`:
```typescript
interface FlagProps {
  code: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' }

export function Flag({ code, size = 'md' }: FlagProps) {
  return (
    <img
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      alt={code}
      className={`${sizes[size]} rounded-full object-cover border border-olive`}
    />
  )
}
```

- [ ] **Step 3: Create match-card component**

Create `apps/web/components/match-card.tsx`:
```typescript
import { Flag } from './flag'
import type { Match } from '@/lib/api'

interface MatchCardProps {
  match: Match
  userPrediction?: { home: number; away: number }
  onPress?: () => void
}

export function MatchCard({ match, userPrediction, onPress }: MatchCardProps) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  return (
    <div
      className="bg-bg-card rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-olive/30 transition-colors"
      onClick={onPress}
    >
      <div className="flex items-center justify-between text-xs text-beige uppercase tracking-widest">
        <span>{match.group ?? match.round}</span>
        <span>{match.time}</span>
        {isLive && (
          <span className="flex items-center gap-1 text-live font-display text-sm">
            <span className="w-2 h-2 rounded-full bg-live animate-live" />
            EN DIRECT {match.minute}'
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1 w-[40%]">
          <Flag code={match.team1.code} size="lg" />
          <span className="font-display text-lg text-cream">{match.team1.code}</span>
          <span className="text-xs text-beige">{match.team1.name}</span>
        </div>

        <div className="text-cream font-display text-2xl">
          {isFinished && match.score
            ? `${match.score.ft[0]} – ${match.score.ft[1]}`
            : 'VS'}
        </div>

        <div className="flex flex-col items-center gap-1 w-[40%]">
          <Flag code={match.team2.code} size="lg" />
          <span className="font-display text-lg text-cream">{match.team2.code}</span>
          <span className="text-xs text-beige">{match.team2.name}</span>
        </div>
      </div>

      {userPrediction && (
        <div className="border-t border-olive pt-2 text-center text-sm text-beige">
          Ton prono : {userPrediction.home} – {userPrediction.away}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create calendrier page**

Create `apps/web/app/[locale]/(app)/calendrier/page.tsx`:
```typescript
import { fetchMatches, fetchGroups } from '@/lib/api'
import { MatchCard } from '@/components/match-card'

export default async function CalendrierPage() {
  const [matches, groups] = await Promise.all([fetchMatches(), fetchGroups()])

  const byDate = matches.reduce<Record<string, typeof matches>>((acc, m) => {
    acc[m.date] = [...(acc[m.date] ?? []), m]
    return acc
  }, {})

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <h1 className="font-display text-3xl text-cream mb-6 uppercase">Calendrier</h1>
      {Object.entries(byDate).map(([date, dayMatches]) => (
        <section key={date} className="mb-6">
          <h2 className="text-beige text-sm uppercase tracking-widest mb-3">
            {new Date(date).toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </h2>
          <div className="flex flex-col gap-3">
            {dayMatches.map(m => (
              <MatchCard key={m.num} match={m} />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
```

- [ ] **Step 5: Start web dev server + verify**

Create `apps/web/.env.local`:
```
NEXT_PUBLIC_PROXY_URL=http://localhost:3001
```

```bash
cd apps/web && pnpm dev
```

Open `http://localhost:3000/fr/calendrier` — should show match list grouped by date with flags.

- [ ] **Step 6: Commit**

```bash
git add apps/web/
git commit -m "feat: static calendrier page — matches + flags from proxy"
```

---

## Phase 2 — Backend Proxy Complet + Fusion Live

### Task 7: worldcup2026 live service

**Files:**
- Create: `apps/proxy/src/services/worldcup-live.ts`
- Create: `apps/proxy/src/services/merger.ts`
- Create: `apps/proxy/tests/merger.test.ts`

- [ ] **Step 1: Write merger tests**

Create `apps/proxy/tests/merger.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { mergeMatchData } from '../src/services/merger'
import type { OFMatch } from '../src/services/openfootball'

const ofMatch: OFMatch = {
  num: 1,
  date: '2026-06-11',
  time: '21:00',
  team1: { name: 'Mexico', code: 'MEX' },
  team2: { name: 'South Africa', code: 'RSA' },
}

const liveMatch = {
  matchId: 'live-1',
  home: 'MEX',
  away: 'RSA',
  date: '2026-06-11',
  homeScore: 2,
  awayScore: 1,
  status: 'finished',
}

describe('mergeMatchData', () => {
  it('enriches of match with live score', () => {
    const result = mergeMatchData([ofMatch], [liveMatch])
    expect(result[0].score?.ft).toEqual([2, 1])
    expect(result[0].status).toBe('finished')
  })

  it('returns upcoming status when no live data', () => {
    const result = mergeMatchData([ofMatch], [])
    expect(result[0].status).toBe('upcoming')
  })
})
```

- [ ] **Step 2: Run test — verify FAIL**

```bash
cd apps/proxy && pnpm test
```

Expected: FAIL — "Cannot find module '../src/services/merger'"

- [ ] **Step 3: Create worldcup-live.ts**

Create `apps/proxy/src/services/worldcup-live.ts`:
```typescript
import { setCache, getCache } from '../lib/cache'

const BASE = process.env.WORLDCUP_API_URL ?? 'http://localhost:3002'
const TTL = 30_000 // 30s

export interface LiveMatch {
  matchId: string
  home: string
  away: string
  date: string
  homeScore: number
  awayScore: number
  status: 'upcoming' | 'live' | 'finished'
  minute?: number
}

export async function getLiveMatches(): Promise<{ matches: LiveMatch[]; stale: boolean }> {
  const cached = getCache<LiveMatch[]>('live:matches')
  if (cached && !cached.stale) return { matches: cached.data, stale: false }

  try {
    const res = await fetch(`${BASE}/get/games`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error('live api error')
    const raw = await res.json()
    const matches: LiveMatch[] = raw.games.map((g: Record<string, unknown>) => ({
      matchId: String(g.id),
      home: String(g.homeTeam),
      away: String(g.awayTeam),
      date: String(g.date).slice(0, 10),
      homeScore: Number(g.homeGoals ?? 0),
      awayScore: Number(g.awayGoals ?? 0),
      status: g.status === 'FINISHED' ? 'finished'
            : g.status === 'IN_PLAY' ? 'live'
            : 'upcoming',
      minute: g.minute ? Number(g.minute) : undefined,
    }))
    setCache('live:matches', matches, TTL)
    return { matches, stale: false }
  } catch {
    if (cached) return { matches: cached.data, stale: true }
    return { matches: [], stale: true }
  }
}
```

- [ ] **Step 4: Create merger.ts**

Create `apps/proxy/src/services/merger.ts`:
```typescript
import { matchKey } from '../lib/normalize'
import type { OFMatch } from './openfootball'
import type { LiveMatch } from './worldcup-live'

export interface MergedMatch extends OFMatch {
  status: 'upcoming' | 'live' | 'finished'
  liveHomeScore?: number
  liveAwayScore?: number
  minute?: number
}

export function mergeMatchData(ofMatches: OFMatch[], liveMatches: LiveMatch[]): MergedMatch[] {
  const liveIndex = new Map<string, LiveMatch>()
  for (const lm of liveMatches) {
    const key = matchKey(lm.date, lm.home, lm.away)
    liveIndex.set(key, lm)
  }

  return ofMatches.map(m => {
    const key = matchKey(m.date, m.team1.name, m.team2.name)
    const live = liveIndex.get(key)

    if (!live) return { ...m, status: 'upcoming' as const }

    return {
      ...m,
      status: live.status,
      liveHomeScore: live.homeScore,
      liveAwayScore: live.awayScore,
      minute: live.minute,
      score: live.status === 'finished'
        ? { ft: [live.homeScore, live.awayScore] as [number, number] }
        : m.score,
    }
  })
}
```

- [ ] **Step 5: Run tests — verify PASS**

```bash
cd apps/proxy && pnpm test
```

Expected: PASS — 6 tests (4 normalize + 2 merger)

- [ ] **Step 6: Update matches route to use merger**

Modify `apps/proxy/src/routes/matches.ts`:
```typescript
import { Router } from 'express'
import { getMatches } from '../services/openfootball'
import { getLiveMatches } from '../services/worldcup-live'
import { mergeMatchData } from '../services/merger'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const [ofMatches, { matches: liveMatches, stale }] = await Promise.all([
      getMatches(),
      getLiveMatches(),
    ])
    const matches = mergeMatchData(ofMatches, liveMatches)
    res.json({ matches, stale })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

router.get('/:matchId', async (req, res) => {
  try {
    const [ofMatches, { matches: liveMatches, stale }] = await Promise.all([
      getMatches(),
      getLiveMatches(),
    ])
    const merged = mergeMatchData(ofMatches, liveMatches)
    const match = merged.find(m => String(m.num) === req.params.matchId)
    if (!match) return res.status(404).json({ error: 'not_found' })
    res.json({ match, stale })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
```

- [ ] **Step 7: Commit**

```bash
git add apps/proxy/
git commit -m "feat: live merger — fuse openfootball + worldcup2026 by date+teams"
```

---

### Task 8: Docker setup for proxy + worldcup2026 API

**Files:**
- Create: `apps/proxy/Dockerfile`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create proxy Dockerfile**

Create `apps/proxy/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

- [ ] **Step 2: Add tsconfig for proxy**

Create `apps/proxy/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["tests", "node_modules"]
}
```

- [ ] **Step 3: Create docker-compose.yml**

Create `docker-compose.yml` at repo root:
```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    networks:
      - internal

  worldcup:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "npm install && npm start"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/worldcup
      - PORT=3002
    volumes:
      - ./apps/worldcup-api:/app
    ports:
      - "3002:3002"
    depends_on: [mongodb]
    networks:
      - internal

  proxy:
    build: ./apps/proxy
    ports:
      - "3001:3001"
    environment:
      - WORLDCUP_API_URL=http://worldcup:3002
      - WEB_URL=${WEB_URL:-http://localhost:3000}
    depends_on: [worldcup]
    networks:
      - internal

volumes:
  mongo_data:

networks:
  internal:
```

- [ ] **Step 4: Clone worldcup2026 API**

```bash
git clone https://github.com/rezarahiminia/worldcup2026 apps/worldcup-api
echo "apps/worldcup-api" >> .gitignore
```

- [ ] **Step 5: Test docker-compose**

```bash
docker-compose up --build
```

Expected: proxy healthy on port 3001, worldcup API on 3002, MongoDB running.

```bash
curl http://localhost:3001/health
```

Expected: `{"ok":true}`

- [ ] **Step 6: Commit**

```bash
git add apps/proxy/Dockerfile apps/proxy/tsconfig.json docker-compose.yml .gitignore
git commit -m "feat: Docker setup — proxy + worldcup2026 API + MongoDB"
```

---

## Phase 3 — PWA (Manifest + Service Worker)

### Task 9: Manifest + next-pwa config

**Files:**
- Create: `apps/web/public/manifest.json`
- Modify: `apps/web/next.config.ts`
- Create: `apps/web/i18n.ts`
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Create manifest.json**

Create `apps/web/public/manifest.json`:
```json
{
  "name": "PB Prono CDM",
  "short_name": "PB Prono",
  "description": "Pronostique la Coupe du Monde 2026 avec PB Poulet Braisé",
  "start_url": "/fr",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#3A4020",
  "background_color": "#0D100A",
  "categories": ["games", "sports"],
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

- [ ] **Step 2: Add icons placeholder**

```bash
mkdir -p apps/web/public/icons
# Place PB logo PNG files (192px, 512px, 512px maskable) from brand assets
# Files needed: icon-192.png, icon-512.png, icon-512-maskable.png
```

Note: Use the PB circle logo asset from the brand book. Resize to 192×192 and 512×512 with olive background.

- [ ] **Step 3: Configure next-pwa**

Modify `apps/web/next.config.ts`:
```typescript
import type { NextConfig } from 'next'
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/flagcdn\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'flags',
        expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
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

const nextConfig: NextConfig = {
  experimental: {},
}

export default withPWA(nextConfig)
```

- [ ] **Step 4: Setup next-intl**

Create `apps/web/i18n.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}))
```

Create `apps/web/messages/fr.json`:
```json
{
  "nav": {
    "home": "Accueil",
    "pronos": "Mes pronos",
    "classement": "Classement",
    "calendrier": "Calendrier",
    "profil": "Profil"
  },
  "home": {
    "title": "À TOI DE JOUER",
    "cta": "JE PRONOSTIQUE →",
    "my_rank": "Ma position"
  },
  "match": {
    "vs": "VS",
    "live": "EN DIRECT",
    "upcoming": "À VENIR",
    "finished": "TERMINÉ",
    "kickoff_in": "COUP D'ENVOI DANS",
    "your_prono": "TON PRONOSTIC",
    "choose_score": "Choisis le score exact",
    "validate": "VALIDER MON PRONO →",
    "closes_at": "Ferme au coup d'envoi",
    "locked": "FERMÉ"
  },
  "prono": {
    "saved": "PRONO ENREGISTRÉ !",
    "modifiable_until": "Modifiable jusqu'à",
    "next_prono": "PRONOSTIC SUIVANT →",
    "back": "RETOUR",
    "none": "AUCUN PRONOSTIC",
    "none_desc": "Tu n'as pas encore pronostiqué de match."
  },
  "classement": {
    "title": "CLASSEMENT",
    "subtitle": "TOP PRONOSTIQUEURS",
    "you_are_here": "Tu es ici"
  },
  "profil": {
    "total_pts": "Points totaux",
    "predictions": "Pronostics",
    "correct": "Bons résultats",
    "exact": "Scores exacts",
    "how_to_play": "Comment jouer ?",
    "my_pronos": "Mes pronostics",
    "special": "Pronostics spéciaux",
    "logout": "Se déconnecter"
  },
  "special": {
    "title": "PRONOSTICS SPÉCIAUX",
    "winner_label": "QUI VA GAGNER LA COUPE ?",
    "runner_up_label": "QUI SERA FINALISTE ?",
    "locked_notice": "Verrouillés le 11/06/2026 à 00:00 UTC",
    "validate": "VALIDER →"
  },
  "how_to_play": {
    "title": "COMMENT JOUER ?",
    "prono_title": "PRONOSTIQUE",
    "prono_desc": "Saisis ton score avant le coup d'envoi. Le prono se verrouille au début du match.",
    "scoring_title": "LE BARÈME",
    "group_result": "Bon résultat (groupes)",
    "group_exact": "Score exact (groupes)",
    "ko_result": "Bon résultat (KO)",
    "ko_exact": "Score exact (KO)",
    "special_title": "PRONOS SPÉCIAUX",
    "winner_pts": "Vainqueur CDM",
    "runner_up_pts": "Finaliste",
    "ranking_title": "CLASSEMENT",
    "ranking_desc": "Mis à jour après chaque match. Top 10 à la fin = surprise PB 🍗",
    "overtime_note": "En cas de prolongations, le score à 90 min fait foi pour le barème."
  },
  "auth": {
    "tagline": "PB TE RÉGALE",
    "title": "PRONOSTIQUE LA COUPE DU MONDE 2026",
    "google": "Continuer avec Google",
    "facebook": "Continuer avec Facebook",
    "free_game": "Jeu gratuit · Sans enjeu réel"
  },
  "onboarding": {
    "title": "CHOISIS TON PSEUDO",
    "placeholder": "Ex: LePronoKing",
    "cta": "C'EST PARTI →"
  },
  "offline": {
    "notice": "Données du"
  }
}
```

Create `apps/web/messages/en.json`:
```json
{
  "nav": {
    "home": "Home",
    "pronos": "My Picks",
    "classement": "Standings",
    "calendrier": "Schedule",
    "profil": "Profile"
  },
  "home": {
    "title": "YOUR TURN",
    "cta": "PLACE MY PICK →",
    "my_rank": "My rank"
  },
  "match": {
    "vs": "VS",
    "live": "LIVE",
    "upcoming": "UPCOMING",
    "finished": "FINISHED",
    "kickoff_in": "KICK-OFF IN",
    "your_prono": "YOUR PREDICTION",
    "choose_score": "Choose the exact score",
    "validate": "CONFIRM MY PICK →",
    "closes_at": "Closes at kick-off",
    "locked": "LOCKED"
  },
  "prono": {
    "saved": "PICK SAVED!",
    "modifiable_until": "Editable until",
    "next_prono": "NEXT PICK →",
    "back": "BACK",
    "none": "NO PICKS YET",
    "none_desc": "You haven't picked any match yet."
  },
  "classement": {
    "title": "STANDINGS",
    "subtitle": "TOP PICKERS",
    "you_are_here": "You are here"
  },
  "profil": {
    "total_pts": "Total points",
    "predictions": "Picks",
    "correct": "Correct results",
    "exact": "Exact scores",
    "how_to_play": "How to play?",
    "my_pronos": "My picks",
    "special": "Special picks",
    "logout": "Sign out"
  },
  "special": {
    "title": "SPECIAL PICKS",
    "winner_label": "WHO WILL WIN THE CUP?",
    "runner_up_label": "WHO WILL BE RUNNER-UP?",
    "locked_notice": "Locked on June 11, 2026 at 00:00 UTC",
    "validate": "CONFIRM →"
  },
  "how_to_play": {
    "title": "HOW TO PLAY?",
    "prono_title": "PREDICT",
    "prono_desc": "Enter your score before kick-off. Pick locks at match start.",
    "scoring_title": "SCORING",
    "group_result": "Correct result (groups)",
    "group_exact": "Exact score (groups)",
    "ko_result": "Correct result (KO)",
    "ko_exact": "Exact score (KO)",
    "special_title": "SPECIAL PICKS",
    "winner_pts": "World Cup winner",
    "runner_up_pts": "Runner-up",
    "ranking_title": "STANDINGS",
    "ranking_desc": "Updated after each match. Top 10 at the end = PB surprise 🍗",
    "overtime_note": "Extra time: 90-min score counts for scoring, not the final result."
  },
  "auth": {
    "tagline": "PB TREATS YOU",
    "title": "PREDICT THE 2026 WORLD CUP",
    "google": "Continue with Google",
    "facebook": "Continue with Facebook",
    "free_game": "Free game · No real stakes"
  },
  "onboarding": {
    "title": "CHOOSE YOUR USERNAME",
    "placeholder": "Ex: ThePickKing",
    "cta": "LET'S GO →"
  },
  "offline": {
    "notice": "Data from"
  }
}
```

- [ ] **Step 5: Create middleware for i18n**

Create `apps/web/middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

export const config = {
  matcher: ['/((?!api|_next|icons|manifest.json|sw.js|.*\\..*).*)'],
}
```

- [ ] **Step 6: Build + check Lighthouse PWA**

```bash
cd apps/web && pnpm build && pnpm start
```

Open Chrome DevTools → Lighthouse → PWA audit.  
Expected: PWA score ≥ 90, installable on mobile.

- [ ] **Step 7: Commit**

```bash
git add apps/web/
git commit -m "feat: PWA manifest, next-pwa Workbox, next-intl FR/EN"
```

---

## Phase 4 — Authentification

### Task 10: Supabase Auth + login page

**Files:**
- Create: `apps/web/lib/supabase/client.ts`
- Create: `apps/web/lib/supabase/server.ts`
- Create: `apps/web/app/[locale]/(auth)/login/page.tsx`
- Create: `apps/web/app/[locale]/onboarding/page.tsx`
- Create: `apps/web/lib/device-fp.ts`

- [ ] **Step 1: Create Supabase client**

Create `apps/web/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

Create `apps/web/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  )
}
```

- [ ] **Step 2: Add env vars**

Add to `apps/web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_PROXY_URL=http://localhost:3001
```

- [ ] **Step 3: Create device fingerprint util**

Create `apps/web/lib/device-fp.ts`:
```typescript
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server'
  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
  ].join('|')

  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = Math.imul(31, hash) + raw.charCodeAt(i) | 0
  }
  return Math.abs(hash).toString(36)
}
```

- [ ] **Step 4: Create login page**

Create `apps/web/app/[locale]/(auth)/login/page.tsx`:
```typescript
'use client'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const t = useTranslations('auth')
  const supabase = createClient()

  async function signInWith(provider: 'google' | 'facebook') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{
        backgroundImage: 'url(/images/stadium-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-bg-dark/80" />

      {/* texture poulet */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'url(/images/chicken-pattern.png)', backgroundSize: '200px' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        <img src="/icons/icon-192.png" alt="PB" className="w-16 h-16 rounded-full" />

        <div className="text-center">
          <p className="text-beige text-xs uppercase tracking-[0.3em] mb-2">{t('tagline')}</p>
          <h1 className="font-display text-4xl text-cream uppercase leading-tight">{t('title')}</h1>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => signInWith('google')}
            className="flex items-center justify-center gap-3 bg-cream text-bg-dark font-display text-lg uppercase px-6 py-4 rounded-xl hover:bg-beige transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t('google')}
          </button>

          <button
            onClick={() => signInWith('facebook')}
            className="flex items-center justify-center gap-3 bg-[#1877F2] text-white font-display text-lg uppercase px-6 py-4 rounded-xl hover:bg-[#166FE5] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {t('facebook')}
          </button>
        </div>

        <p className="text-muted text-xs">{t('free_game')}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create auth callback route**

Create `apps/web/app/auth/callback/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      // Check if user profile exists
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('provider_id', session.user.id)
        .single()

      if (!user) {
        return NextResponse.redirect(`${origin}/fr/onboarding`)
      }
      return NextResponse.redirect(`${origin}/fr`)
    }
  }

  return NextResponse.redirect(`${origin}/fr/login`)
}
```

- [ ] **Step 6: Create onboarding page**

Create `apps/web/app/[locale]/onboarding/page.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { getDeviceFingerprint } from '@/lib/device-fp'

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [pseudo, setPseudo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pseudo.length < 2) return setError('Minimum 2 caractères')
    setLoading(true)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return router.push('/fr/login')

    const provider = session.user.app_metadata.provider as 'google' | 'facebook'

    const { error: insertError } = await supabase.from('users').insert({
      provider,
      provider_id: session.user.id,
      pseudo: pseudo.trim(),
      avatar_url: session.user.user_metadata.avatar_url,
      device_fp: getDeviceFingerprint(),
    })

    if (insertError) {
      setError('Ce pseudo est peut-être déjà pris, essaies-en un autre.')
      setLoading(false)
      return
    }

    router.push('/fr')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg-dark">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="font-display text-3xl text-cream uppercase text-center">{t('title')}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={pseudo}
            onChange={e => setPseudo(e.target.value)}
            placeholder={t('placeholder')}
            maxLength={20}
            className="bg-bg-card text-cream px-4 py-3 rounded-xl border border-olive focus:border-gold outline-none font-body"
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-bg-dark font-display text-xl uppercase py-4 rounded-xl hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? '...' : t('cta')}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/
git commit -m "feat: Supabase Auth — login Google/Facebook, onboarding pseudo"
```

---

## Phase 5 — Scores Live (worldcup2026 intégré)

### Task 11: Groupes avec classement live

**Files:**
- Create: `apps/web/components/group-standings.tsx`
- Create: `apps/proxy/src/routes/groups.ts` (update)
- Create: `apps/proxy/src/services/group-standings.ts`

- [ ] **Step 1: Create group standings service in proxy**

Create `apps/proxy/src/services/group-standings.ts`:
```typescript
import { getGroups, type OFGroup } from './openfootball'
import { getLiveMatches } from './worldcup-live'
import { matchKey } from '../lib/normalize'

interface TeamStanding {
  name: string
  code: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
}

interface GroupStanding {
  name: string
  standings: TeamStanding[]
}

export async function getGroupStandings(): Promise<GroupStanding[]> {
  const [groups, { matches: liveMatches }] = await Promise.all([
    getGroups(),
    getLiveMatches(),
  ])

  const liveIndex = new Map(
    liveMatches.map(m => [matchKey(m.date, m.home, m.away), m])
  )

  return groups.map(group => {
    const standings = new Map<string, TeamStanding>()

    for (const team of group.teams) {
      standings.set(team.code, {
        name: team.name, code: team.code,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, pts: 0,
      })
    }

    for (const match of group.matches) {
      const key = matchKey(match.date, match.team1.name, match.team2.name)
      const live = liveIndex.get(key)
      const score = live?.status === 'finished'
        ? [live.homeScore, live.awayScore]
        : match.score?.ft

      if (!score) continue

      const [hg, ag] = score
      const ht = standings.get(match.team1.code)
      const at = standings.get(match.team2.code)
      if (!ht || !at) continue

      ht.played++; at.played++
      ht.gf += hg; ht.ga += ag; ht.gd = ht.gf - ht.ga
      at.gf += ag; at.ga += hg; at.gd = at.gf - at.ga

      if (hg > ag) { ht.won++; ht.pts += 3; at.lost++ }
      else if (ag > hg) { at.won++; at.pts += 3; ht.lost++ }
      else { ht.drawn++; at.drawn++; ht.pts++; at.pts++ }
    }

    const sorted = [...standings.values()].sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
    )

    return { name: group.name, standings: sorted }
  })
}
```

- [ ] **Step 2: Update groups route**

Replace content of `apps/proxy/src/routes/groups.ts`:
```typescript
import { Router } from 'express'
import { getGroupStandings } from '../services/group-standings'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const groups = await getGroupStandings()
    res.json({ groups, stale: false })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
```

- [ ] **Step 3: Create group standings component**

Create `apps/web/components/group-standings.tsx`:
```typescript
'use client'

interface TeamStanding {
  name: string; code: string; played: number
  won: number; drawn: number; lost: number
  gf: number; ga: number; gd: number; pts: number
}

interface GroupStandingsProps {
  name: string
  standings: TeamStanding[]
}

export function GroupStandings({ name, standings }: GroupStandingsProps) {
  return (
    <div className="bg-bg-card rounded-xl overflow-hidden">
      <div className="bg-olive px-4 py-2">
        <h3 className="font-display text-lg text-cream uppercase">Groupe {name}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-beige text-xs uppercase border-b border-olive">
            <th className="text-left px-4 py-2">Équipe</th>
            <th className="px-2 py-2">J</th>
            <th className="px-2 py-2">G</th>
            <th className="px-2 py-2">N</th>
            <th className="px-2 py-2">P</th>
            <th className="px-2 py-2">BP</th>
            <th className="px-2 py-2">BC</th>
            <th className="px-2 py-2">Diff</th>
            <th className="px-2 py-2 text-gold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((t, i) => (
            <tr key={t.code} className={`border-b border-olive/40 ${i < 2 ? 'text-cream' : 'text-muted'}`}>
              <td className="px-4 py-2 flex items-center gap-2">
                <img src={`https://flagcdn.com/w40/${t.code.toLowerCase()}.png`} className="w-5 h-5 rounded-full" alt={t.code} />
                {t.code}
              </td>
              <td className="text-center px-2 py-2">{t.played}</td>
              <td className="text-center px-2 py-2">{t.won}</td>
              <td className="text-center px-2 py-2">{t.drawn}</td>
              <td className="text-center px-2 py-2">{t.lost}</td>
              <td className="text-center px-2 py-2">{t.gf}</td>
              <td className="text-center px-2 py-2">{t.ga}</td>
              <td className="text-center px-2 py-2">{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
              <td className="text-center px-2 py-2 font-display text-gold">{t.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/proxy/ apps/web/
git commit -m "feat: group standings with live scores from worldcup2026"
```

---

## Phase 6 — Pronostics + Classement

### Task 12: Scoring logic

**Files:**
- Create: `apps/web/lib/scoring.ts`
- Create: `apps/web/lib/scoring.test.ts`

- [ ] **Step 1: Write scoring tests**

Create `apps/web/lib/scoring.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { calculatePoints } from './scoring'

describe('calculatePoints', () => {
  it('exact score in group stage = 7', () => {
    expect(calculatePoints({ pred: [2,1], actual: [2,1], phase: 'group' })).toBe(7)
  })
  it('correct result in group stage = 3', () => {
    expect(calculatePoints({ pred: [2,0], actual: [3,1], phase: 'group' })).toBe(3)
  })
  it('wrong result = 0', () => {
    expect(calculatePoints({ pred: [2,0], actual: [0,1], phase: 'group' })).toBe(0)
  })
  it('draw predicted and draw actual = 3', () => {
    expect(calculatePoints({ pred: [1,1], actual: [0,0], phase: 'group' })).toBe(3)
  })
  it('exact score draw in group = 7', () => {
    expect(calculatePoints({ pred: [1,1], actual: [1,1], phase: 'group' })).toBe(7)
  })
  it('correct result KO = 5', () => {
    expect(calculatePoints({ pred: [2,0], actual: [1,0], phase: 'knockout' })).toBe(5)
  })
  it('exact score KO = 12', () => {
    expect(calculatePoints({ pred: [2,1], actual: [2,1], phase: 'knockout' })).toBe(12)
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
cd apps/web && npx vitest run lib/scoring.test.ts
```

Expected: FAIL — "Cannot find module './scoring'"

- [ ] **Step 3: Implement scoring.ts**

Create `apps/web/lib/scoring.ts`:
```typescript
type Phase = 'group' | 'knockout'

interface ScoringInput {
  pred: [number, number]
  actual: [number, number]
  phase: Phase
}

function getResult(score: [number, number]): 'home' | 'draw' | 'away' {
  if (score[0] > score[1]) return 'home'
  if (score[0] < score[1]) return 'away'
  return 'draw'
}

export function calculatePoints({ pred, actual, phase }: ScoringInput): number {
  const predResult = getResult(pred)
  const actualResult = getResult(actual)

  const isExact = pred[0] === actual[0] && pred[1] === actual[1]
  const isCorrect = predResult === actualResult

  if (phase === 'group') {
    if (isExact) return 7
    if (isCorrect) return 3
    return 0
  }

  // knockout
  if (isExact) return 12
  if (isCorrect) return 5
  return 0
}

export function isKnockoutMatch(round?: string): boolean {
  if (!round) return false
  const koRounds = ['Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final', '3rd Place']
  return koRounds.some(r => round.includes(r))
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
cd apps/web && npx vitest run lib/scoring.test.ts
```

Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/scoring.ts apps/web/lib/scoring.test.ts
git commit -m "feat: scoring engine with tests — group 3/7pts, KO 5/12pts"
```

---

### Task 13: Prediction form + confirmation

**Files:**
- Create: `apps/web/components/score-input.tsx`
- Create: `apps/web/components/prediction-form.tsx`
- Create: `apps/web/components/confirmation-overlay.tsx`
- Create: `apps/web/app/[locale]/(app)/pronos/[matchId]/page.tsx`

- [ ] **Step 1: Create score-input component**

Create `apps/web/components/score-input.tsx`:
```typescript
'use client'

interface ScoreInputProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

export function ScoreInput({ value, onChange, disabled }: ScoreInputProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => onChange(Math.min(99, value + 1))}
        disabled={disabled}
        className="w-10 h-10 rounded-full bg-olive text-cream font-display text-xl disabled:opacity-40"
      >
        +
      </button>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Math.max(0, Math.min(99, Number(e.target.value))))}
        disabled={disabled}
        className="w-16 h-16 text-center text-3xl font-display text-cream bg-bg-card border-2 border-gold rounded-xl disabled:opacity-40 outline-none"
        min={0}
        max={99}
      />
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled}
        className="w-10 h-10 rounded-full bg-olive text-cream font-display text-xl disabled:opacity-40"
      >
        −
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create confirmation overlay**

Create `apps/web/components/confirmation-overlay.tsx`:
```typescript
'use client'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface ConfirmationOverlayProps {
  homeScore: number
  awayScore: number
  homeName: string
  awayName: string
  lockedUntil: string
  onNext?: () => void
  onBack: () => void
}

export function ConfirmationOverlay({
  homeScore, awayScore, homeName, awayName,
  lockedUntil, onNext, onBack
}: ConfirmationOverlayProps) {
  const t = useTranslations('prono')

  return (
    <div className="fixed inset-0 bg-bg-dark/95 z-50 flex flex-col items-center justify-center px-6 gap-8">
      <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
        <span className="text-4xl text-bg-dark">✓</span>
      </div>

      <div className="text-center">
        <h2 className="font-display text-2xl text-cream uppercase mb-2">{t('saved')}</h2>
        <p className="text-beige text-lg font-display">
          {homeName} {homeScore} – {awayScore} {awayName}
        </p>
        <p className="text-muted text-sm mt-2">
          {t('modifiable_until')} {lockedUntil}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {onNext && (
          <button
            onClick={onNext}
            className="bg-gold text-bg-dark font-display text-lg uppercase py-4 rounded-xl"
          >
            {t('next_prono')}
          </button>
        )}
        <button
          onClick={onBack}
          className="text-beige font-display text-lg uppercase py-4 border border-olive rounded-xl"
        >
          {t('back')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create match prediction page**

Create `apps/web/app/[locale]/(app)/pronos/[matchId]/page.tsx`:
```typescript
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Flag } from '@/components/flag'
import { ScoreInput } from '@/components/score-input'
import { ConfirmationOverlay } from '@/components/confirmation-overlay'
import { fetchMatches, type Match } from '@/lib/api'

export default function MatchPredictionPage() {
  const t = useTranslations('match')
  const router = useRouter()
  const { matchId } = useParams<{ matchId: string }>()

  const [match, setMatch] = useState<Match | null>(null)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [existing, setExisting] = useState<{ home: number; away: number } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchMatches().then(matches => {
      const m = matches.find(m => String(m.num) === matchId)
      if (m) setMatch(m)
    })

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: userRow } = await supabase
        .from('users').select('id').eq('provider_id', session.user.id).single()
      if (!userRow) return

      const { data: pred } = await supabase
        .from('predictions')
        .select('home_score_pred, away_score_pred')
        .eq('user_id', userRow.id)
        .eq('match_id', matchId)
        .single()

      if (pred) {
        setHomeScore(pred.home_score_pred)
        setAwayScore(pred.away_score_pred)
        setExisting({ home: pred.home_score_pred, away: pred.away_score_pred })
      }
    })
  }, [matchId])

  const isLocked = match?.status === 'live' || match?.status === 'finished'

  function getPredictedResult(): 'home' | 'draw' | 'away' {
    if (homeScore > awayScore) return 'home'
    if (homeScore < awayScore) return 'away'
    return 'draw'
  }

  async function handleSubmit() {
    if (isLocked || !match) return
    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/fr/login'); return }

    const { data: userRow } = await supabase
      .from('users').select('id').eq('provider_id', session.user.id).single()
    if (!userRow) { setSaving(false); return }

    const kickoffDate = new Date(`${match.date}T${match.time ?? '21:00'}:00Z`)

    await supabase.from('predictions').upsert({
      user_id: userRow.id,
      match_id: matchId,
      home_score_pred: homeScore,
      away_score_pred: awayScore,
      predicted_result: getPredictedResult(),
      locked_at: kickoffDate.toISOString(),
    }, { onConflict: 'user_id,match_id' })

    setSaving(false)
    setSaved(true)
  }

  if (!match) return <div className="min-h-screen bg-bg-dark" />

  const resultLabel = homeScore > awayScore
    ? `${match.team1.name} gagne`
    : homeScore < awayScore
    ? `${match.team2.name} gagne`
    : 'Match nul'

  const kickoffStr = new Date(`${match.date}T${match.time ?? '21:00'}:00Z`)
    .toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <main className="min-h-screen bg-bg-dark px-4 py-6 pb-24 max-w-lg mx-auto">
      {saved && (
        <ConfirmationOverlay
          homeScore={homeScore} awayScore={awayScore}
          homeName={match.team1.code} awayName={match.team2.code}
          lockedUntil={kickoffStr}
          onBack={() => router.push('/fr/pronos')}
        />
      )}

      <button onClick={() => router.back()} className="text-beige mb-6 flex items-center gap-2">
        ← {match.group} · {new Date(match.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </button>

      <div className="bg-bg-card rounded-xl p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2 w-[40%]">
            <Flag code={match.team1.code} size="lg" />
            <span className="font-display text-xl text-cream">{match.team1.code}</span>
            <span className="text-xs text-beige">{match.team1.name}</span>
          </div>

          {isLocked && match.score ? (
            <span className="font-display text-3xl text-cream">
              {match.score.ft[0]} – {match.score.ft[1]}
            </span>
          ) : (
            <span className="text-beige text-sm">VS</span>
          )}

          <div className="flex flex-col items-center gap-2 w-[40%]">
            <Flag code={match.team2.code} size="lg" />
            <span className="font-display text-xl text-cream">{match.team2.code}</span>
            <span className="text-xs text-beige">{match.team2.name}</span>
          </div>
        </div>

        <div className="border-t border-olive pt-4">
          <p className="text-center text-beige text-xs uppercase tracking-widest mb-4">{t('your_prono')}</p>
          <p className="text-center text-cream text-sm mb-4">{t('choose_score')}</p>

          <div className="flex items-center justify-center gap-8">
            <ScoreInput value={homeScore} onChange={setHomeScore} disabled={isLocked} />
            <span className="font-display text-2xl text-muted">–</span>
            <ScoreInput value={awayScore} onChange={setAwayScore} disabled={isLocked} />
          </div>

          {!isLocked && (
            <p className="text-center text-beige text-sm mt-4">
              Résultat prévu : <span className="text-cream font-display">{resultLabel}</span>
            </p>
          )}
        </div>

        {!isLocked && (
          <>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gold text-bg-dark font-display text-xl uppercase py-4 rounded-xl hover:brightness-110 transition disabled:opacity-50"
            >
              {saving ? '...' : existing ? 'MODIFIER MON PRONO →' : t('validate')}
            </button>
            <p className="text-center text-muted text-xs">{t('closes_at')} {kickoffStr}</p>
          </>
        )}

        {isLocked && (
          <div className="text-center py-2 border border-muted rounded-xl">
            <span className="text-muted font-display uppercase">{t('locked')}</span>
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/
git commit -m "feat: prediction form with score input and confirmation overlay"
```

---

### Task 14: Leaderboard page

**Files:**
- Create: `apps/web/components/leaderboard-table.tsx`
- Create: `apps/web/app/[locale]/(app)/classement/page.tsx`

- [ ] **Step 1: Create leaderboard table component**

Create `apps/web/components/leaderboard-table.tsx`:
```typescript
'use client'

interface LeaderboardEntry {
  id: string
  pseudo: string
  avatar_url: string | null
  total_points: number
  rank: number
  correct_count: number
  exact_count: number
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const medalColors: Record<number, string> = { 1: 'text-gold', 2: 'text-[#C0C0C0]', 3: 'text-[#CD7F32]' }

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const userEntry = entries.find(e => e.id === currentUserId)

  return (
    <div className="flex flex-col gap-1">
      {entries.map(entry => {
        const isUser = entry.id === currentUserId
        const medal = medalColors[entry.rank]

        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
              isUser ? 'bg-gold/20 border border-gold' : 'bg-bg-card'
            }`}
          >
            <span className={`font-display text-lg w-8 text-center ${medal ?? 'text-muted'}`}>
              {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `${entry.rank}.`}
            </span>

            <div className="w-8 h-8 rounded-full bg-olive overflow-hidden flex-shrink-0">
              {entry.avatar_url && (
                <img src={entry.avatar_url} alt={entry.pseudo} className="w-full h-full object-cover" />
              )}
            </div>

            <span className={`flex-1 font-display ${isUser ? 'text-gold' : 'text-cream'}`}>
              {isUser ? `${entry.pseudo} (toi)` : entry.pseudo}
            </span>

            <span className={`font-display text-xl ${isUser ? 'text-gold' : 'text-cream'}`}>
              {entry.total_points} pts
            </span>
          </div>
        )
      })}

      {userEntry && !entries.slice(0, 50).find(e => e.id === currentUserId) && (
        <>
          <div className="text-center text-muted text-xs py-2">─── Tu es ici ───</div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/20 border border-gold">
            <span className="font-display text-lg w-8 text-center text-muted">{userEntry.rank}.</span>
            <span className="flex-1 font-display text-gold">{userEntry.pseudo} (toi)</span>
            <span className="font-display text-xl text-gold">{userEntry.total_points} pts</span>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create classement page**

Create `apps/web/app/[locale]/(app)/classement/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard-table'

export const revalidate = 60

export default async function ClassementPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  const { data: entries } = await supabase
    .from('leaderboard')
    .select('id, pseudo, avatar_url, total_points, rank, correct_count, exact_count')
    .order('rank', { ascending: true })
    .limit(100)

  let currentUserId: string | undefined
  if (session) {
    const { data: userRow } = await supabase
      .from('users').select('id').eq('provider_id', session.user.id).single()
    currentUserId = userRow?.id
  }

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <p className="text-beige text-xs uppercase tracking-widest mb-1">TOP PRONOSTIQUEURS</p>
        <h1 className="font-display text-4xl text-cream uppercase">CLASSEMENT</h1>
      </div>

      {!entries?.length ? (
        <div className="bg-bg-card rounded-xl p-8 text-center">
          <span className="text-4xl">🏆</span>
          <p className="text-cream font-display text-lg mt-4">Aucun participant pour l'instant</p>
          <p className="text-muted text-sm mt-2">Sois le premier à pronostiquer !</p>
        </div>
      ) : (
        <LeaderboardTable entries={entries} currentUserId={currentUserId} />
      )}
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/
git commit -m "feat: leaderboard page with rank highlight for current user"
```

---

### Task 15: Validation automatique des pronostics (proxy)

**Files:**
- Create: `apps/proxy/src/services/validation.ts`
- Create: `apps/proxy/src/routes/admin.ts`

- [ ] **Step 1: Create validation service**

Create `apps/proxy/src/services/validation.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { getMatches } from './openfootball'
import { getLiveMatches } from './worldcup-live'
import { mergeMatchData } from './merger'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

function getPhase(round?: string): 'group' | 'knockout' {
  if (!round) return 'group'
  const koRounds = ['Round of 32', 'Round of 16', 'Quarter', 'Semi', 'Final', '3rd']
  return koRounds.some(r => round.includes(r)) ? 'knockout' : 'group'
}

function calculatePoints(
  pred: [number, number],
  actual: [number, number],
  phase: 'group' | 'knockout'
): number {
  const getResult = (s: [number, number]) => s[0] > s[1] ? 'h' : s[0] < s[1] ? 'a' : 'd'
  const isExact = pred[0] === actual[0] && pred[1] === actual[1]
  const isCorrect = getResult(pred) === getResult(actual)

  if (phase === 'group') return isExact ? 7 : isCorrect ? 3 : 0
  return isExact ? 12 : isCorrect ? 5 : 0
}

export async function validateFinishedMatches(): Promise<void> {
  const [ofMatches, { matches: liveMatches }] = await Promise.all([
    getMatches(), getLiveMatches()
  ])
  const merged = mergeMatchData(ofMatches, liveMatches)
  const finished = merged.filter(m => m.status === 'finished' && m.score)

  for (const match of finished) {
    const [hg, ag] = match.score!.ft
    const actualResult = hg > ag ? 'home' : hg < ag ? 'away' : 'draw'
    const phase = getPhase(match.round)

    // Get unvalidated predictions for this match
    const { data: preds } = await supabase
      .from('predictions')
      .select('id, user_id, home_score_pred, away_score_pred')
      .eq('match_id', String(match.num))
      .is('points_earned', null)

    if (!preds?.length) continue

    for (const pred of preds) {
      const pts = calculatePoints(
        [pred.home_score_pred, pred.away_score_pred],
        [hg, ag],
        phase
      )

      await supabase.from('predictions').update({
        actual_home_score: hg,
        actual_away_score: ag,
        actual_result: actualResult,
        points_earned: pts,
      }).eq('id', pred.id)
    }

    console.log(`Validated match ${match.num}: ${match.team1.code} ${hg}-${ag} ${match.team2.code}`)
  }
}
```

- [ ] **Step 2: Create admin route (webhook-style)**

Create `apps/proxy/src/routes/admin.ts`:
```typescript
import { Router } from 'express'
import { validateFinishedMatches } from '../services/validation'

const router = Router()

// Called by a cron or manually to trigger validation
router.post('/validate', async (req, res) => {
  const secret = req.headers['x-admin-secret']
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    await validateFinishedMatches()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
```

- [ ] **Step 3: Register admin route in index.ts**

Modify `apps/proxy/src/index.ts` — add after existing routes:
```typescript
import adminRouter from './routes/admin'
// ...
app.use('/admin', adminRouter)
```

- [ ] **Step 4: Add Railway cron for automatic validation**

Add to `apps/proxy/src/index.ts` — auto-validate every 5 minutes:
```typescript
import { validateFinishedMatches } from './services/validation'

// Auto-validate every 5 minutes during tournament
setInterval(async () => {
  try {
    await validateFinishedMatches()
  } catch (err) {
    console.error('Auto-validation error:', err)
  }
}, 5 * 60 * 1000)
```

- [ ] **Step 5: Commit**

```bash
git add apps/proxy/
git commit -m "feat: auto-validation of finished matches — points calculation"
```

---

## Phase 7 — Temps Réel

### Task 16: Polling live scores + bottom nav

**Files:**
- Create: `apps/web/components/bottom-nav.tsx`
- Create: `apps/web/components/live-badge.tsx`
- Create: `apps/web/lib/hooks/use-matches.ts`
- Create: `apps/web/app/[locale]/(app)/layout.tsx`

- [ ] **Step 1: Create live badge**

Create `apps/web/components/live-badge.tsx`:
```typescript
export function LiveBadge({ minute }: { minute?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-live/20 text-live text-xs font-display uppercase px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-live animate-live" />
      EN DIRECT{minute ? ` ${minute}'` : ''}
    </span>
  )
}
```

- [ ] **Step 2: Create use-matches hook with polling**

Create `apps/web/lib/hooks/use-matches.ts`:
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchMatches, type Match } from '@/lib/api'

export function useMatches() {
  const { data: matches = [], isLoading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    refetchInterval: (query) => {
      // Poll every 30s if any match is live, 5min otherwise
      const matches = query.state.data ?? []
      const hasLive = matches.some((m: Match) => m.status === 'live')
      return hasLive ? 30_000 : 5 * 60_000
    },
    staleTime: 0,
  })

  const liveMatches = matches.filter((m: Match) => m.status === 'live')
  const upcomingMatches = matches.filter((m: Match) => m.status === 'upcoming')
  const finishedMatches = matches.filter((m: Match) => m.status === 'finished')

  return { matches, liveMatches, upcomingMatches, finishedMatches, isLoading, error }
}
```

- [ ] **Step 3: Create bottom nav**

Create `apps/web/components/bottom-nav.tsx`:
```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

const TABS = [
  { href: '/fr', icon: '🏠', key: 'home' },
  { href: '/fr/pronos', icon: '🎯', key: 'pronos' },
  { href: '/fr/classement', icon: '🏆', key: 'classement' },
  { href: '/fr/calendrier', icon: '📅', key: 'calendrier' },
  { href: '/fr/profil', icon: '👤', key: 'profil' },
]

export function BottomNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-olive z-40">
      <div className="flex items-center justify-around max-w-lg mx-auto py-2">
        {TABS.map(tab => {
          const isActive = tab.href === '/fr'
            ? pathname === '/fr'
            : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-gold' : 'text-muted hover:text-beige'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-display uppercase">
                {t(tab.key as keyof ReturnType<typeof t>)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Create app layout with bottom nav + TanStack Query**

Create `apps/web/app/[locale]/(app)/layout.tsx`:
```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BottomNav } from '@/components/bottom-nav'

const queryClient = new QueryClient()

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-bg-dark">
        {children}
        <BottomNav />
      </div>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/
git commit -m "feat: live polling 30s + bottom nav + TanStack Query setup"
```

---

### Task 17: Supabase Realtime leaderboard

**Files:**
- Create: `apps/web/lib/hooks/use-leaderboard.ts`

- [ ] **Step 1: Create realtime leaderboard hook**

Create `apps/web/lib/hooks/use-leaderboard.ts`:
```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LeaderboardEntry {
  id: string; pseudo: string; avatar_url: string | null
  total_points: number; rank: number; correct_count: number; exact_count: number
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('leaderboard')
      .select('id, pseudo, avatar_url, total_points, rank, correct_count, exact_count')
      .order('rank', { ascending: true })
      .limit(100)
    if (data) setEntries(data)
    setLoading(false)
  }

  useEffect(() => {
    load()

    const channel = supabase
      .channel('predictions-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'predictions',
        filter: 'points_earned=neq.null',
      }, () => {
        load() // Reload leaderboard when a prediction is validated
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { entries, loading }
}
```

- [ ] **Step 2: Update classement page to use hook**

Replace `apps/web/app/[locale]/(app)/classement/page.tsx` with client version:
```typescript
'use client'
import { useLeaderboard } from '@/lib/hooks/use-leaderboard'
import { LeaderboardTable } from '@/components/leaderboard-table'

export default function ClassementPage() {
  const { entries, loading } = useLeaderboard()

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <p className="text-beige text-xs uppercase tracking-widest mb-1">TOP PRONOSTIQUEURS</p>
        <h1 className="font-display text-4xl text-cream uppercase">CLASSEMENT</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="text-muted">Chargement...</span>
        </div>
      ) : !entries.length ? (
        <div className="bg-bg-card rounded-xl p-8 text-center">
          <span className="text-4xl">🏆</span>
          <p className="text-cream font-display text-lg mt-4">Aucun participant pour l'instant</p>
          <p className="text-muted text-sm mt-2">Sois le premier à pronostiquer !</p>
        </div>
      ) : (
        <LeaderboardTable entries={entries} />
      )}
    </main>
  )
}
```

- [ ] **Step 3: Enable Realtime in Supabase dashboard**

In Supabase dashboard → Database → Replication → enable `predictions` table for Realtime.

- [ ] **Step 4: Commit**

```bash
git add apps/web/
git commit -m "feat: Supabase Realtime leaderboard — auto-updates after match validation"
```

---

## Phase 8 — Résilience + Déploiement

### Task 18: Offline indicator + error boundaries

**Files:**
- Create: `apps/web/components/offline-banner.tsx`
- Create: `apps/web/app/[locale]/(app)/error.tsx`

- [ ] **Step 1: Create offline banner**

Create `apps/web/components/offline-banner.tsx`:
```typescript
'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)
  const t = useTranslations('offline')

  useEffect(() => {
    const handleOffline = () => setOffline(true)
    const handleOnline = () => setOffline(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    setOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-beige/90 text-bg-dark text-xs font-display uppercase text-center py-2 z-50">
      ⚠ {t('notice')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
    </div>
  )
}
```

- [ ] **Step 2: Create error boundary**

Create `apps/web/app/[locale]/(app)/error.tsx`:
```typescript
'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center px-6 text-center gap-6">
      <span className="text-5xl">⚽</span>
      <h2 className="font-display text-2xl text-cream uppercase">Une erreur s'est produite</h2>
      <p className="text-muted text-sm">Vérifie ta connexion et réessaie.</p>
      <button
        onClick={reset}
        className="bg-gold text-bg-dark font-display uppercase px-6 py-3 rounded-xl"
      >
        RÉESSAYER
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/
git commit -m "feat: offline banner + error boundary"
```

---

### Task 19: Vercel + Railway deployment

**Files:**
- Create: `apps/web/vercel.json`
- Create: `.env.example`

- [ ] **Step 1: Create Vercel config**

Create `apps/web/vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": ".next"
}
```

- [ ] **Step 2: Create .env.example**

Create `.env.example` at repo root:
```
# Web app (apps/web/.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_PROXY_URL=https://proxy.railway.app

# Proxy (Railway env vars)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
WORLDCUP_API_URL=http://worldcup:3002
WEB_URL=https://pb-prono-cdm.vercel.app
ADMIN_SECRET=changeme_in_prod
PORT=3001
```

- [ ] **Step 3: Deploy web to Vercel**

```bash
cd apps/web
npx vercel --prod
```

Set env vars in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_PROXY_URL` (Railway proxy URL)

- [ ] **Step 4: Deploy proxy to Railway**

In Railway dashboard:
1. New project → Deploy from GitHub → select `pb-prono-cdm`
2. Root directory: `apps/proxy`
3. Build: `pnpm install && pnpm build`
4. Start: `node dist/index.js`
5. Add env vars from `.env.example`

- [ ] **Step 5: Configure Supabase OAuth callbacks**

In Supabase dashboard → Auth → URL Configuration:
- Site URL: `https://pb-prono-cdm.vercel.app`
- Redirect URLs: `https://pb-prono-cdm.vercel.app/auth/callback`

In Google Cloud Console → OAuth → Authorized redirect URIs:
- `https://xxxx.supabase.co/auth/v1/callback`

In Facebook Developer → OAuth → Valid OAuth Redirect URIs:
- `https://xxxx.supabase.co/auth/v1/callback`

- [ ] **Step 6: Final smoke test**

```bash
# Verify production endpoints
curl https://your-proxy.railway.app/health
curl https://your-proxy.railway.app/api/matches | head -c 200
```

Open `https://pb-prono-cdm.vercel.app` on mobile:
- [ ] Login Google works
- [ ] Onboarding pseudo saves
- [ ] Calendrier shows matches
- [ ] Prediction form saves to Supabase
- [ ] Leaderboard shows entry
- [ ] App installable (Add to Home Screen)

- [ ] **Step 7: Final commit + tag**

```bash
git add .
git commit -m "feat: production deployment config — Vercel + Railway"
git tag v1.0.0
git push origin main --tags
```

---

## Remaining Screens (implement after Phase 6 is working)

### Task 20: Accueil page (home)

Create `apps/web/app/[locale]/(app)/page.tsx` — shows next upcoming unpredicted match + user rank widget + special predictions banner (if before 11/06).

Pattern: fetch matches via `useMatches()`, filter `upcomingMatches`, find first one without user prediction, show card with countdown. Countdown component uses `setInterval(1000)` to tick down to `match.date + match.time` in UTC.

### Task 21: Pronostics list page

Create `apps/web/app/[locale]/(app)/pronos/page.tsx` — tabs "À VENIR" / "MES PRONOS". Fetch user predictions from Supabase, join with match data from proxy. Show points earned where applicable.

### Task 22: Profil page

Create `apps/web/app/[locale]/(app)/profil/page.tsx` — stats from leaderboard view filtered by current user. Language toggle: store in localStorage, reload page. Sign out via `supabase.auth.signOut()`.

### Task 23: Comment jouer page

Create `apps/web/app/[locale]/(app)/profil/comment-jouer/page.tsx` — static content from i18n strings, barème table, overtime rule.

### Task 24: Pronostics spéciaux page

Create `apps/web/app/[locale]/(app)/pronos-speciaux/page.tsx` — searchable team list (48 teams from proxy), select winner + runner-up, save to `special_predictions` table. Lock check: `new Date() > new Date('2026-06-11T00:00:00Z')`.

### Task 25: Bracket / Tableau final

Create `apps/web/components/bracket.tsx` — HTML/CSS tree layout using flexbox. Fetch knockout results from proxy `/api/matches?phase=knockout`. Slots without qualified team show "?" in `--gray-muted`.

---

## Quick Reference

### Dev commands

```bash
# Start everything
pnpm dev:proxy    # http://localhost:3001
pnpm dev:web      # http://localhost:3000

# Run all tests
pnpm test

# Docker (Railway stack)
docker-compose up --build
```

### Key env vars

| Variable | Where | Value |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | From Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | From Supabase project |
| `NEXT_PUBLIC_PROXY_URL` | Vercel + local | Railway proxy URL |
| `SUPABASE_SERVICE_KEY` | Railway proxy | From Supabase project (service role) |
| `WORLDCUP_API_URL` | Railway proxy | `http://worldcup:3002` |
| `ADMIN_SECRET` | Railway proxy | Random secret for /admin/validate |

### Scoring rules (quick ref)

| Phase | Résultat correct | Score exact |
|-------|-----------------|-------------|
| Groupes | 3 pts | 7 pts |
| KO | 5 pts | 12 pts |
| Vainqueur CDM (spécial) | — | 20 pts |
| Finaliste (spécial) | — | 10 pts |

*Note: prolongations → score à 90 min fait foi, pas le score final après TAB*
