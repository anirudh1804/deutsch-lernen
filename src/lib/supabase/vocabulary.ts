import { supabase } from './client';

export interface VocabularyRow {
  id: string;
  user_id: string;
  word: string;
  translation?: string | null;
  part_of_speech?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  times_practiced: number;
  times_correct: number;
  last_practiced_at: string;
  mastered: boolean;
}

export const LEARNED_THRESHOLD = 3;

// Fetch items the user is still working toward learning (1-2 correct answers).
export async function getInProgressVocabulary(
  userId: string
): Promise<VocabularyRow[]> {
  const { data, error } = await supabase
    .from('user_vocabulary')
    .select('*')
    .eq('user_id', userId)
    .lt('times_correct', LEARNED_THRESHOLD)
    .gt('times_correct', 0);

  if (error) {
    console.error('Failed to load vocabulary:', error.message);
    return [];
  }
  return (data ?? []) as VocabularyRow[];
}

// Fetch a single item by its identity key (number value or word).
async function getVocabularyItem(
  userId: string,
  word: string
): Promise<VocabularyRow | null> {
  const { data, error } = await supabase
    .from('user_vocabulary')
    .select('*')
    .eq('user_id', userId)
    .eq('word', word)
    .maybeSingle();

  if (error || !data) return null;
  return data as VocabularyRow;
}

export interface RecordAnswerParams {
  userId: string;
  word: string;            // identity key: numeric value string or German word
  isCorrect: boolean;
  translation?: string;
  partOfSpeech?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Record an answer for a word/number and return whether this item reached "learned"
// (3 correct) and how many correct answers it had before this one.
export async function recordVocabularyAnswer(
  params: RecordAnswerParams
): Promise<{ previousCorrect: number; reachedLearned: boolean }> {
  const existing = await getVocabularyItem(params.userId, params.word);

  if (!existing) {
    if (params.isCorrect) {
      await upsertItem(params, {
        times_correct: 1,
        times_practiced: 1,
        mastered: false,
      });
      return { previousCorrect: 0, reachedLearned: false };
    }
    await upsertItem(params, { times_correct: 0, times_practiced: 1, mastered: false });
    return { previousCorrect: 0, reachedLearned: false };
  }

  const previousCorrect = existing.times_correct;
  let timesCorrect = existing.times_correct;
  let timesPracticed = existing.times_practiced;

  if (params.isCorrect) {
    timesCorrect += 1;
  }
  timesPracticed += 1;

  const reachedLearned = params.isCorrect && timesCorrect >= LEARNED_THRESHOLD;

  await upsertItem(params, {
    times_correct: timesCorrect,
    times_practiced: timesPracticed,
    mastered: reachedLearned || existing.mastered,
  });

  return { previousCorrect, reachedLearned };
}

async function upsertItem(
  params: RecordAnswerParams,
  counts: { times_correct: number; times_practiced: number; mastered: boolean }
): Promise<void> {
  const { error } = await supabase.from('user_vocabulary').upsert(
    {
      user_id: params.userId,
      word: params.word,
      translation: params.translation ?? null,
      part_of_speech: params.partOfSpeech ?? null,
      difficulty: params.difficulty,
      times_correct: counts.times_correct,
      times_practiced: counts.times_practiced,
      mastered: counts.mastered,
      last_practiced_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,word' }
  );
  if (error) {
    console.error('Failed to save vocabulary:', error.message);
  }
}
