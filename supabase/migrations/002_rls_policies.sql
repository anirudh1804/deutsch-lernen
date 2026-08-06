-- 002_rls_policies.sql
-- Row Level Security policies for German Learning App

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;

-- ====================
-- PROFILES POLICIES
-- ====================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ====================
-- GAME SESSIONS POLICIES
-- ====================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ====================
-- ANSWERS POLICIES
-- ====================

-- Users can view answers from their own sessions
CREATE POLICY "Users can view own answers"
  ON answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      WHERE id = answers.session_id
      AND user_id = auth.uid()
    )
  );

-- Users can insert answers to their own sessions
CREATE POLICY "Users can insert answers to own sessions"
  ON answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_sessions
      WHERE id = answers.session_id
      AND user_id = auth.uid()
    )
  );

-- ====================
-- USER VOCABULARY POLICIES
-- ====================

-- Users can view their own vocabulary
CREATE POLICY "Users can view own vocabulary"
  ON user_vocabulary FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own vocabulary
CREATE POLICY "Users can insert own vocabulary"
  ON user_vocabulary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own vocabulary
CREATE POLICY "Users can update own vocabulary"
  ON user_vocabulary FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own vocabulary
CREATE POLICY "Users can delete own vocabulary"
  ON user_vocabulary FOR DELETE
  USING (auth.uid() = user_id);