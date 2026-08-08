import { supabase } from './client';
import { GameMode, Difficulty, GameAnswer } from '@/features/game/types';

export interface NewGameSession {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
}

export interface SessionStats {
  score: number;
  streak: number;
  maxStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  totalResponseTimeMs: number;
}

export async function createGameSession(
  userId: string,
  mode: GameMode,
  difficulty: Difficulty
): Promise<NewGameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ user_id: userId, mode, difficulty })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create game session:', error.message);
    return null;
  }

  return { id: data.id, mode, difficulty };
}

export async function completeGameSession(
  sessionId: string,
  stats: SessionStats
): Promise<void> {
  const { error } = await supabase
    .from('game_sessions')
    .update({
      score: stats.score,
      streak: stats.streak,
      max_streak: stats.maxStreak,
      total_questions: stats.totalQuestions,
      correct_answers: stats.correctAnswers,
      total_response_time_ms: stats.totalResponseTimeMs,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to complete game session:', error.message);
  }
}

export async function saveAnswer(
  sessionId: string,
  answer: GameAnswer
): Promise<void> {
  const { error } = await supabase.from('answers').insert({
    session_id: sessionId,
    question_type: answer.questionType,
    question_value: answer.questionValue,
    correct_answer: answer.correctAnswer,
    user_answer: answer.userAnswer,
    is_correct: answer.isCorrect,
    response_time_ms: answer.responseTimeMs,
    points_earned: answer.pointsEarned,
  });

  if (error) {
    console.error('Failed to save answer:', error.message);
  }
}
