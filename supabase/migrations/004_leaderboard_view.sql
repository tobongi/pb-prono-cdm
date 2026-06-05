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
