export type GameMode = 'numbers' | 'words' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'number' | 'word';

export interface GameQuestion {
  id: string;
  type: QuestionType;
  value: string;           // e.g., "1234.56" or "Haus" (canonical form / vocab identity key)
  correctAnswer: string;   // what the user must type; for numbers e.g. "1234,56", for words the word
  spokenText: string;      // the text the TTS reads aloud; for numbers the German spelling
  translation?: string;    // English translation (words mode)
  partOfSpeech?: string;   // e.g. "noun" (words mode)
  audioUrl?: string;
}

export interface GameAnswer {
  questionId: string;
  questionValue: string;   // e.g., "1234.56" or "Haus"
  questionType: QuestionType;
  correctAnswer: string;   // e.g., "eintausendzweihundert..."
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