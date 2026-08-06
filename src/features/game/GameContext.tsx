import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GameState, GameMode, Difficulty, GameQuestion, GameAnswer, GameSettings } from './types';

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
  const [state, setState] = useState<GameState>({
    session: null,
    currentQuestion: null,
    answers: [],
    settings: DEFAULT_SETTINGS,
    isPlaying: false,
    isLoading: false,
    error: null,
  });

  const startGame = useCallback(async (mode: GameMode, difficulty: Difficulty) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, settings: { ...prev.settings, mode, difficulty } }));
    
    try {
      // TODO: Create game session via API
      const mockSession = {
        id: crypto.randomUUID(),
        mode,
        difficulty,
        score: 0,
        streak: 0,
        maxStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        startedAt: new Date().toISOString(),
      };
      
      setState(prev => ({ ...prev, session: mockSession, isPlaying: true, isLoading: false }));
      await generateQuestion();
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to start game' }));
    }
  }, []);

  const generateQuestion = async () => {
    // TODO: Generate question based on mode/difficulty
    const mockQuestion: GameQuestion = {
      id: crypto.randomUUID(),
      type: 'number',
      value: '1234.56',
      correctAnswer: 'eintausendzweihundertvierunddreißig komma sechsundfünfzig',
    };
    
    setState(prev => ({ ...prev, currentQuestion: mockQuestion }));
  };

  const submitAnswer = useCallback(async (answer: string) => {
    const { currentQuestion, session } = state;
    if (!currentQuestion || !session) return;

    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    const responseTimeMs = Date.now() - Date.now(); // TODO: Track actual time
    const pointsEarned = isCorrect ? 10 : 0; // TODO: Calculate properly

    const newAnswer: GameAnswer = {
      questionId: currentQuestion.id,
      questionValue: currentQuestion.value,
      questionType: currentQuestion.type,
      userAnswer: answer,
      isCorrect,
      responseTimeMs,
      pointsEarned,
    };

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
  }, [state]);

  const nextQuestion = useCallback(async () => {
    await generateQuestion();
  }, []);

  const endGame = useCallback(async () => {
    // TODO: Save session to database
    setState(prev => ({ ...prev, isPlaying: false, session: prev.session ? { ...prev.session, completedAt: new Date().toISOString() } : null }));
  }, []);

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