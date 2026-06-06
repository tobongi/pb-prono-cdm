-- Fix RLS on special_predictions: same pattern as 005_fix_predictions_rls
-- The broken policy compared auth.uid() directly to user_id (provider UUID vs custom UUID)
DROP POLICY IF EXISTS "users can manage own special predictions" ON public.special_predictions;

CREATE POLICY "users can manage own special predictions"
  ON public.special_predictions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = special_predictions.user_id
        AND public.users.provider_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = special_predictions.user_id
        AND public.users.provider_id = auth.uid()::text
    )
  );
