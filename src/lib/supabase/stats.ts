import { supabase } from './client';

export interface ProfileStats {
  totalGames: number;
  totalScore: number;
  bestStreak: number;
  accuracy: number;
  avgResponseSec: number;
  wordsLearned: number;
  wordsPracticing: number;
  mastered: number;
  history: HistoryRow[];
}

export interface HistoryRow {
  id: string;
  mode: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
}

export const EMPTY_STATS: ProfileStats = {
  totalGames: 0,
  totalScore: 0,
  bestStreak: 0,
  accuracy: 0,
  avgResponseSec: 0,
  wordsLearned: 0,
  wordsPracticing: 0,
  mastered: 0,
  history: [],
};

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [sessionsRes, vocabRes, historyRes] = await Promise.all([
    supabase
      .from('game_sessions')
      .select('score, max_streak, total_questions, correct_answers, total_response_time_ms')
      .eq('user_id', userId),
    supabase
      .from('user_vocabulary')
      .select('mastered, times_practiced, times_correct')
      .eq('user_id', userId),
    supabase
      .from('game_sessions')
      .select('id, mode, difficulty, score, total_questions, correct_answers, started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(20),
  ]);

  const sessions = sessionsRes.data ?? [];
  const vocab = vocabRes.data ?? [];
  const historyData = historyRes.data ?? [];

  const totalGames = sessions.length;
  const totalScore = sessions.reduce((a, s) => a + (s.score ?? 0), 0);
  const bestStreak = sessions.reduce((a, s) => Math.max(a, s.max_streak ?? 0), 0);
  const totalQuestions = sessions.reduce((a, s) => a + (s.total_questions ?? 0), 0);
  const totalCorrect = sessions.reduce((a, s) => a + (s.correct_answers ?? 0), 0);
  const totalTimeMs = sessions.reduce((a, s) => a + (s.total_response_time_ms ?? 0), 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgResponseSec = totalGames > 0 ? Number((totalTimeMs / 1000 / totalGames).toFixed(1)) : 0;

  const wordsLearned = vocab.filter(v => (v.times_correct ?? 0) >= 3).length;
  const mastered = vocab.filter(v => v.mastered).length;
  const wordsPracticing = vocab.filter(v => (v.times_correct ?? 0) >= 1 && (v.times_correct ?? 0) < 3).length;

  const history: HistoryRow[] = historyData.map(h => ({
    id: h.id,
    mode: h.mode,
    difficulty: h.difficulty,
    score: h.score ?? 0,
    totalQuestions: h.total_questions ?? 0,
    correctAnswers: h.correct_answers ?? 0,
    startedAt: h.started_at,
  }));

  return {
    totalGames,
    totalScore,
    bestStreak,
    accuracy,
    avgResponseSec,
    wordsLearned,
    wordsPracticing,
    mastered,
    history,
  };
}
