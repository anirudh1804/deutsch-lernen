-- 003_add_profiles_email.sql
-- Add email to profiles so users can log in by username.

ALTER TABLE profiles
  ADD COLUMN email TEXT;
