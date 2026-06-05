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

CREATE POLICY "leaderboard can read all special points"
  ON public.special_predictions FOR SELECT
  USING (true);
