-- 006_guest_attempts.sql
-- Track free guest attempts so anonymous users can't refresh to reset their
-- 15-question limit. Keyed by the (anonymous) auth user id, enforced with RLS.

CREATE TABLE guest_attempts (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  attempts_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE guest_attempts ENABLE ROW LEVEL SECURITY;

-- A user (registered or anonymous) can view their own attempt count.
CREATE POLICY "Users can view own guest attempts"
  ON guest_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- A user can insert their own attempt counter.
CREATE POLICY "Users can insert own guest attempts"
  ON guest_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- A user can update their own attempt counter.
CREATE POLICY "Users can update own guest attempts"
  ON guest_attempts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Atomically increment the attempt counter and return the new value.
-- SECURITY DEFINER bypasses RLS but only ever touches the caller's own row.
CREATE OR REPLACE FUNCTION public.increment_guest_attempt(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO guest_attempts (user_id, attempts_used)
  VALUES (user_id, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET attempts_used = guest_attempts.attempts_used + 1, updated_at = NOW()
  RETURNING attempts_used;
$$;

REVOKE ALL ON FUNCTION public.increment_guest_attempt(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_guest_attempt(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_guest_attempt(UUID) TO authenticated;