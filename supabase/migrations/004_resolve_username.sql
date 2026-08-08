-- 004_resolve_username.sql
-- Allow unauthenticated username->email lookup for username-based login.
-- SECURITY DEFINER runs with elevated privileges (bypasses RLS) but only
-- returns a single email for an exact username match, so no other data is exposed.

CREATE OR REPLACE FUNCTION public.resolve_username_email(username_arg TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM profiles
  WHERE LOWER(username) = LOWER(username_arg)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_username_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_username_email(TEXT) TO anon;
