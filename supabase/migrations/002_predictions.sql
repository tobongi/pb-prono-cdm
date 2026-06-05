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

CREATE INDEX ON public.predictions(user_id);
CREATE INDEX ON public.predictions(match_id);
