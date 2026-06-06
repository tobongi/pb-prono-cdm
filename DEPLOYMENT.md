# Deployment Guide

## Prerequisites

- Supabase project (supabase.com)
- Railway account (railway.app)
- Vercel account (vercel.com)
- GitHub repo connected to both Railway and Vercel

## 1. Supabase Setup

1. Create a new Supabase project
2. Run migrations from `apps/web/supabase/migrations/` in the SQL editor
3. Enable Realtime on the `predictions` table:
   ```sql
   alter publication supabase_realtime add table predictions;
   ```
4. Configure Auth providers:
   - Enable Google OAuth (Settings → Auth → Providers)
   - Enable Facebook OAuth
   - Set redirect URL to `https://your-domain.vercel.app/auth/callback`

## 2. Railway Deploy (Proxy)

1. Create a new Railway project
2. Add a MongoDB plugin (MongoDB 7)
3. Deploy the worldcup2026 API service (Docker image from the compose file)
4. Connect `apps/proxy/` as a Railway service
5. Set environment variables (see `apps/proxy/.env.example`)
6. Railway auto-detects the Dockerfile and builds

The proxy will be available at `https://your-project.up.railway.app`

## 3. Vercel Deploy (Web)

1. Import the GitHub repo in Vercel
2. Set root directory to `apps/web`
3. Set environment variables (see `apps/web/.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `PROXY_URL` (Railway URL from step 2)
   - `SUPABASE_SERVICE_KEY`
4. Deploy

## 4. Supabase OAuth Redirect URLs

After Vercel deploy, add the production URL to Supabase Auth:
- Go to Supabase → Authentication → URL Configuration
- Add `https://your-vercel-domain.vercel.app/auth/callback` to allowed redirect URLs

## 5. Admin Validation Trigger

To trigger match validation manually (until a cron is set up):
```bash
curl -X POST https://your-railway-url.up.railway.app/api/admin/validate \
  -H "x-admin-key: your-admin-secret-key"
```

## Environment Variables Summary

| Variable | Service | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Supabase anon key (public) |
| `PROXY_URL` | Vercel | Railway proxy URL |
| `SUPABASE_SERVICE_KEY` | Vercel + Railway | Supabase service role key |
| `SUPABASE_URL` | Railway | Supabase project URL |
| `ADMIN_SECRET_KEY` | Railway | Admin endpoint protection |
| `MONGO_URL` | Railway | MongoDB connection string |
| `WORLDCUP_API_URL` | Railway | Internal worldcup API URL |
