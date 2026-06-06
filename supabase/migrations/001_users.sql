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

CREATE POLICY "users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = provider_id);

CREATE POLICY "users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = provider_id);

CREATE POLICY "users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = provider_id);
