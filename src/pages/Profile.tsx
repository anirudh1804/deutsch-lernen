import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings';
import { getProfileStats, ProfileStats, EMPTY_STATS } from '@/lib/supabase';

export function Profile() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [stats, setStats] = useState<ProfileStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getProfileStats(user.id).then((result) => {
      if (!cancelled) {
        setStats(result);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const t = {
    de: {
      profile: 'Profil',
      stats: 'Statistiken',
      totalGames: 'Spiele insgesamt',
      totalScore: 'Gesamtpunktzahl',
      bestStreak: 'Beste Serie',
      accuracy: 'Genauigkeit',
      avgResponse: 'Ø Antwortzeit',
      vocabulary: 'Wortschatz',
      wordsLearned: 'Gelernt',
      wordsPracticing: 'Im Training',
      mastered: 'Beherrscht',
      history: 'Spielverlauf',
      date: 'Datum',
      mode: 'Modus',
      difficulty: 'Schwierigkeit',
      score: 'Punkte',
      questions: 'Fragen',
      correct: 'Richtig',
      noHistory: 'Noch keine Spiele gespielt',
      loading: 'Lade Statistiken...',
    },
    en: {
      profile: 'Profile',
      stats: 'Statistics',
      totalGames: 'Total Games',
      totalScore: 'Total Score',
      bestStreak: 'Best Streak',
      accuracy: 'Accuracy',
      avgResponse: 'Avg Response',
      vocabulary: 'Vocabulary',
      wordsLearned: 'Learned',
      wordsPracticing: 'Practicing',
      mastered: 'Mastered',
      history: 'Game History',
      date: 'Date',
      mode: 'Mode',
      difficulty: 'Difficulty',
      score: 'Score',
      questions: 'Questions',
      correct: 'Correct',
      noHistory: 'No games played yet',
      loading: 'Loading statistics...',
    },
  }[settings.language];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t.profile}</h1>
        <div className="text-sm text-gray-500">
          {settings.language === 'de' ? 'Mitglied seit' : 'Member since'} {' '}
          {user?.created_at ? new Date(user.created_at).toLocaleDateString(settings.language) : '—'}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: t.totalGames, value: stats.totalGames },
              { label: t.totalScore, value: stats.totalScore.toLocaleString() },
              { label: t.bestStreak, value: stats.bestStreak },
              { label: t.accuracy, value: `${stats.accuracy}%` },
              { label: t.avgResponse, value: `${stats.avgResponseSec}s` },
            ].map((stat) => (
              <div key={stat.label} className="card p-4 text-center">
                <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Vocabulary */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.vocabulary}</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.wordsLearned}</p>
                <p className="text-sm text-gray-500">{t.wordsLearned}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.wordsPracticing}</p>
                <p className="text-sm text-gray-500">{t.wordsPracticing}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.mastered}</p>
                <p className="text-sm text-gray-500">{t.mastered}</p>
              </div>
            </div>
          </div>

          {/* Game History */}
          <div className="card">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t.history}</h2>
            </div>
            {stats.history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t.noHistory}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-sm text-gray-500">
                      <th className="p-4">{t.date}</th>
                      <th className="p-4">{t.mode}</th>
                      <th className="p-4">{t.difficulty}</th>
                      <th className="p-4">{t.score}</th>
                      <th className="p-4">{t.questions}</th>
                      <th className="p-4">{t.correct}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.history.map((game) => (
                      <tr key={game.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-900">
                          {new Date(game.startedAt).toLocaleDateString(settings.language)}
                        </td>
                        <td className="p-4 text-sm text-gray-600 capitalize">{game.mode}</td>
                        <td className="p-4 text-sm text-gray-600 capitalize">{game.difficulty}</td>
                        <td className="p-4 text-sm font-medium text-gray-900">{game.score}</td>
                        <td className="p-4 text-sm text-gray-600">{game.totalQuestions}</td>
                        <td className="p-4 text-sm text-green-600">{game.correctAnswers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
