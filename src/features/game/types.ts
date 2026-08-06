export type GameMode = 'numbers' | 'words' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'number' | 'word';

export interface GameQuestion {
  id: string;
  type: QuestionType;
  value: string;           // e.g., "1234.56" or "Haus"
  correctAnswer: string;   // e.g., "eintausendzweihundert... komma sechsundfünfzig"
  audioUrl?: string;
}

export interface GameAnswer {
  questionId: string;
  questionValue: string;   // e.g., "1234.56" or "Haus"
  questionType: QuestionType;
  userAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsEarned: number;
}

export interface GameSession {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  score: number;
  streak: number;
  maxStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  completedAt?: string;
}

export interface GameSettings {
  mode: GameMode;
  difficulty: Difficulty;
  voice: string;
  speed: number;
  autoPlay: boolean;
}

export interface GameState {
  session: GameSession | null;
  currentQuestion: GameQuestion | null;
  answers: GameAnswer[];
  settings: GameSettings;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}