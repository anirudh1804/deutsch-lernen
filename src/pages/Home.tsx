import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useGame } from '@/features/game';
import { useSettings } from '@/features/settings';

export function Home() {
  const { user } = useAuth();
  const { startGame } = useGame();
  const { settings } = useSettings();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const t = {
    de: {
      welcome: 'Willkommen zurück',
      subtitle: 'Übe deutsche Zahlen und Wörter mit Audio',
      startNumbers: 'Zahlen üben',
      startWords: 'Wörter üben',
      startMixed: 'Gemischt üben',
      selectMode: 'Spielmodus wählen',
      selectDifficulty: 'Schwierigkeit',
      easy: 'Leicht',
      medium: 'Mittel',
      hard: 'Schwer',
    },
    en: {
      welcome: 'Welcome back',
      subtitle: 'Practice German numbers and words with audio',
      startNumbers: 'Practice Numbers',
      startWords: 'Practice Words',
      startMixed: 'Mixed Practice',
      selectMode: 'Select Game Mode',
      selectDifficulty: 'Difficulty',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
  }[settings.language];

  const handleStart = (mode: 'numbers' | 'words' | 'mixed') => {
    startGame(mode, difficulty);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {t.welcome}{user ? `, ${user.username || user.email}` : ''}
        </h1>
        <p className="text-lg text-gray-600">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { mode: 'numbers' as const, label: t.startNumbers, icon: '🔢', color: 'blue' },
          { mode: 'words' as const, label: t.startWords, icon: '📝', color: 'green' },
          { mode: 'mixed' as const, label: t.startMixed, icon: '🎲', color: 'purple' },
        ].map(({ mode, label, icon, color }) => (
          <Link
            key={mode}
            to="/game"
            onClick={(e) => {
              e.preventDefault();
              handleStart(mode);
            }}
            className={`card-hover p-6 text-center group ${color}-50 border-${color}-100`}
          >
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {label}
            </h3>
            <p className="text-sm text-gray-500">
              {mode === 'numbers' && (settings.language === 'de' ? '0 bis 2.000.000' : '0 to 2,000,000')}
              {mode === 'words' && (settings.language === 'de' ? 'Nach Schwierigkeit' : 'By difficulty')}
              {mode === 'mixed' && (settings.language === 'de' ? 'Zahlen & Wörter' : 'Numbers & Words')}
            </p>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.selectDifficulty}</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { value: 'easy' as const, label: t.easy, active: 'bg-green-600 text-white', inactive: 'bg-green-100 text-green-800' },
            { value: 'medium' as const, label: t.medium, active: 'bg-yellow-500 text-white', inactive: 'bg-yellow-100 text-yellow-800' },
            { value: 'hard' as const, label: t.hard, active: 'bg-red-600 text-white', inactive: 'bg-red-100 text-red-800' },
          ].map(({ value, label, active, inactive }) => (
            <button
              key={value}
              onClick={() => setDifficulty(value)}
              className={`badge px-4 py-2 text-sm cursor-pointer transition-colors ${difficulty === value ? active : inactive}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}