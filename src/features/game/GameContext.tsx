import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { GameState, GameMode, Difficulty, GameQuestion, GameAnswer, GameSettings } from './types';
import { useAuth } from '@/features/auth';
import { createGameSession, completeGameSession, saveAnswer } from '@/lib/supabase/games';
import { getInProgressVocabulary, recordVocabularyAnswer, VocabularyRow } from '@/lib/supabase/vocabulary';
import { numberToGermanWords } from '@/utils/numberToGermanWords';
import { getRandomWord } from '@/data/words';

const REPEAT_REPICK_CHANCE = 0.35;
const FULL_POINTS = 10;
const REPEAT_POINTS = 1;

interface GameContextType extends GameState {
  startGame: (mode: GameMode, difficulty: Difficulty) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  nextQuestion: () => Promise<void>;
  endGame: () => Promise<void>;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DEFAULT_SETTINGS: GameSettings = {
  mode: 'numbers',
  difficulty: 'easy',
  voice: 'de-DE-Neural2-A',
  speed: 1.0,
  autoPlay: true,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const questionStartRef = useRef<number>(Date.now());
  const totalResponseRef = useRef<number>(0);
  const inProgressRef = useRef<VocabularyRow[]>([]);
  const [state, setState] = useState<GameState>({
    session: null,
    currentQuestion: null,
    answers: [],
    settings: DEFAULT_SETTINGS,
    isPlaying: false,
    isLoading: false,
    error: null,
  });

  const refreshInProgress = useCallback(async () => {
    if (!user) return;
    inProgressRef.current = await getInProgressVocabulary(user.id);
  }, [user]);

  const startGame = useCallback(async (mode: GameMode, difficulty: Difficulty) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, settings: { ...prev.settings, mode, difficulty } }));
    questionStartRef.current = Date.now();
    totalResponseRef.current = 0;
    inProgressRef.current = [];

    try {
      let dbId: string | null = null;
      if (user) {
        const created = await createGameSession(user.id, mode, difficulty);
        if (created) dbId = created.id;
        await refreshInProgress();
      }

      const newSession = {
        id: dbId || crypto.randomUUID(),
        mode,
        difficulty,
        score: 0,
        streak: 0,
        maxStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        startedAt: new Date().toISOString(),
      };
      
      setState(prev => ({ ...prev, session: newSession, answers: [], isPlaying: true, isLoading: false }));
      await generateQuestion(mode, difficulty);
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to start game' }));
    }
  }, [user, refreshInProgress]);

  const generateQuestion = async (mode: GameMode = state.settings.mode, difficulty: Difficulty = state.settings.difficulty) => {
    // Pick a number or word question based on the mode.
    let questionType: 'number' | 'word';
    if (mode === 'numbers') questionType = 'number';
    else if (mode === 'words') questionType = 'word';
    else questionType = Math.random() < 0.5 ? 'number' : 'word';

    // Occasionally re-present an item the user is still learning (1-2 correct answers).
    if (user && inProgressRef.current.length > 0 && Math.random() < REPEAT_REPICK_CHANCE) {
      const pool = inProgressRef.current.filter(v => v.difficulty === difficulty);
      if (pool.length > 0) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        setState(prev => ({ ...prev, currentQuestion: buildQuestionFromVocabulary(item) }));
        return;
      }
    }

    const question = questionType === 'number'
      ? buildNumberQuestion(difficulty)
      : buildWordQuestion(difficulty);

    setState(prev => ({ ...prev, currentQuestion: question }));
  };

  const submitAnswer = useCallback(async (answer: string) => {
    const { currentQuestion, session, settings } = state;
    if (!currentQuestion || !session) return;

    const isCorrect = currentQuestion.type === 'number'
      ? compareNumbers(answer, currentQuestion.value)
      : answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    const responseTimeMs = Date.now() - questionStartRef.current;

    let pointsEarned = 0;
    if (isCorrect) {
      if (user) {
        const res = await recordVocabularyAnswer({
          userId: user.id,
          word: currentQuestion.value,
          isCorrect: true,
          translation: currentQuestion.translation,
          partOfSpeech: currentQuestion.partOfSpeech,
          difficulty: settings.difficulty,
        });
        // 2nd and 3rd correct answers on the same item are worth only 1 point.
        pointsEarned = res.previousCorrect >= 1 ? REPEAT_POINTS : FULL_POINTS;
        await refreshInProgress();
      } else {
        pointsEarned = FULL_POINTS;
      }
    } else if (user) {
      await recordVocabularyAnswer({
        userId: user.id,
        word: currentQuestion.value,
        isCorrect: false,
        translation: currentQuestion.translation,
        partOfSpeech: currentQuestion.partOfSpeech,
        difficulty: settings.difficulty,
      });
      await refreshInProgress();
    }

    const newAnswer: GameAnswer = {
      questionId: currentQuestion.id,
      questionValue: currentQuestion.value,
      questionType: currentQuestion.type,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: answer,
      isCorrect,
      responseTimeMs,
      pointsEarned,
    };

    totalResponseRef.current += responseTimeMs;

    if (session.id) {
      saveAnswer(session.id, newAnswer);
    }

    setState(prev => ({
      ...prev,
      answers: [...prev.answers, newAnswer],
      session: prev.session ? {
        ...prev.session,
        score: prev.session.score + pointsEarned,
        streak: isCorrect ? prev.session.streak + 1 : 0,
        maxStreak: isCorrect ? Math.max(prev.session.maxStreak, prev.session.streak + 1) : prev.session.maxStreak,
        totalQuestions: prev.session.totalQuestions + 1,
        correctAnswers: prev.session.correctAnswers + (isCorrect ? 1 : 0),
      } : null,
    }));
  }, [state, user, refreshInProgress]);

  const nextQuestion = useCallback(async () => {
    questionStartRef.current = Date.now();
    await generateQuestion();
  }, []);

  const endGame = useCallback(async () => {
    const prev = state.session;
    if (prev?.id) {
      await completeGameSession(prev.id, {
        score: prev.score,
        streak: prev.streak,
        maxStreak: prev.maxStreak,
        totalQuestions: prev.totalQuestions,
        correctAnswers: prev.correctAnswers,
        totalResponseTimeMs: totalResponseRef.current,
      });
    }
    totalResponseRef.current = 0;
    inProgressRef.current = [];
    setState(prevState => ({ ...prevState, isPlaying: false, session: prev ? { ...prev, completedAt: new Date().toISOString() } : null }));
  }, [state.session]);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...settings } }));
  }, []);

  return (
    <GameContext.Provider value={{ ...state, startGame, submitAnswer, nextQuestion, endGame, updateSettings }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

// ── Question builders ──

function buildNumberQuestion(difficulty: Difficulty): GameQuestion {
  const num = randomNumberForDifficulty(difficulty);
  return {
    id: crypto.randomUUID(),
    type: 'number',
    value: num.toString(),
    correctAnswer: formatNumberForDisplay(num),
    spokenText: numberToGermanWords(num),
  };
}

function buildWordQuestion(difficulty: Difficulty): GameQuestion {
  const word = getRandomWord(difficulty);
  return {
    id: crypto.randomUUID(),
    type: 'word',
    value: word.word,
    correctAnswer: word.word,
    spokenText: word.word,
    translation: word.translation,
    partOfSpeech: word.partOfSpeech,
  };
}

// Rebuild a question from a stored vocabulary item (used for repeat-to-learn).
function buildQuestionFromVocabulary(item: VocabularyRow): GameQuestion {
  if (isNumericValue(item.word)) {
    const num = parseFloat(item.word);
    return {
      id: crypto.randomUUID(),
      type: 'number',
      value: item.word,
      correctAnswer: formatNumberForDisplay(num),
      spokenText: numberToGermanWords(num),
    };
  }
  return {
    id: crypto.randomUUID(),
    type: 'word',
    value: item.word,
    correctAnswer: item.word,
    spokenText: item.word,
    translation: item.translation ?? undefined,
    partOfSpeech: item.part_of_speech ?? undefined,
  };
}

// ── Helpers ──

// Random number generator based on difficulty.
function randomNumberForDifficulty(difficulty: Difficulty): number {
  const ranges: Record<Difficulty, number> = {
    easy: 100,
    medium: 1000,
    hard: 2000000,
  };
  const max = ranges[difficulty] ?? 100;
  const hasDecimal = difficulty === 'hard';
  const n = Math.random() * max;
  return hasDecimal ? Math.round(n * 100) / 100 : Math.round(n);
}

// Format a number for display using German decimal comma, e.g. 1234.56 -> "1234,56".
function formatNumberForDisplay(num: number): string {
  return num.toString().replace('.', ',');
}

// Compare a user's typed answer to the correct numeric value.
// Accepts both comma (German) and dot decimals, ignoring spacing.
function compareNumbers(userAnswer: string, correctValue: string): boolean {
  const parse = (s: string): number | null => {
    const normalized = s.replace(/\s/g, '').replace(',', '.');
    if (!/^-?\d*\.?\d+$/.test(normalized)) return null;
    return parseFloat(normalized);
  };
  const user = parse(userAnswer);
  const correct = parse(correctValue);
  if (user === null || correct === null) return false;
  return Math.abs(user - correct) < 1e-9;
}

// Whether a stored vocab identity key represents a number (vs a German word).
function isNumericValue(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value);
}
