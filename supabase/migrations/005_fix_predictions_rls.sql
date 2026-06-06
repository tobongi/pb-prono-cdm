-- Fix RLS: user_id references users.id (custom UUID), not auth.uid() directly
DROP POLICY IF EXISTS "users can manage own predictions" ON public.predictions;

CREATE POLICY "users can manage own predictions"
  ON public.predictions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = predictions.user_id
        AND public.users.provider_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = predictions.user_id
        AND public.users.provider_id = auth.uid()::text
    )
  );

-- Add change_count column for the "2 changes max" feature
ALTER TABLE public.predictions
  ADD COLUMN IF NOT EXISTS change_count int NOT NULL DEFAULT 0;
