import { useGame } from '@/features/game';
import { useSettings } from '@/features/settings';

export function Game() {
  const { 
    session, 
    currentQuestion, 
    answers, 
    isPlaying, 
    isLoading,
    submitAnswer,
    nextQuestion,
    endGame,
    startGame,
  } = useGame();
  const { settings } = useSettings();

  const t = {
    de: {
      score: 'Punkte',
      streak: 'Serie',
      question: 'Frage',
      yourAnswer: 'Deine Antwort',
      submit: 'Prüfen',
      next: 'Weiter',
      endGame: 'Beenden',
      correct: 'Richtig!',
      incorrect: 'Falsch',
      correctAnswer: 'Richtige Antwort',
      gameOver: 'Spiel beendet',
      finalScore: 'Endstand',
      playAgain: 'Erneut spielen',
    },
    en: {
      score: 'Score',
      streak: 'Streak',
      question: 'Question',
      yourAnswer: 'Your Answer',
      submit: 'Check',
      next: 'Next',
      endGame: 'End Game',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      correctAnswer: 'Correct Answer',
      gameOver: 'Game Over',
      finalScore: 'Final Score',
      playAgain: 'Play Again',
    },
  }[settings.language];

  if (!isPlaying || isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">{settings.language === 'de' ? 'Lade Spiel...' : 'Loading game...'}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{settings.language === 'de' ? 'Kein aktives Spiel' : 'No active game'}</h2>
        <p className="text-gray-600 mb-6">{settings.language === 'de' ? 'Wähle einen Modus auf der Startseite' : 'Select a mode on the home page'}</p>
        <button 
          onClick={() => startGame('numbers', 'easy')}
          className="btn-primary"
        >
          {settings.language === 'de' ? 'Zahlen starten' : 'Start Numbers'}
        </button>
      </div>
    );
  }

  const lastAnswer = answers[answers.length - 1];
  const showFeedback = !!lastAnswer;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const answer = formData.get('answer') as string;
    if (answer.trim()) {
      submitAnswer(answer.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-6">
          <div>
            <p className="text-sm text-gray-500">{t.score}</p>
            <p className="text-2xl font-bold text-gray-900">{session.score}</p>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <p className="text-sm text-gray-500">{t.streak}</p>
            <p className="text-2xl font-bold text-orange-600">{session.streak}</p>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <p className="text-sm text-gray-500">{t.question}</p>
            <p className="text-2xl font-bold text-gray-900">{session.totalQuestions + 1}</p>
          </div>
        </div>
        <button onClick={endGame} className="btn-ghost text-sm">
          {t.endGame}
        </button>
      </div>

      {/* Question Card */}
      <div className="card p-8 text-center">
        {currentQuestion && (
          <>
            <div className="mb-6">
              <span className="badge-info mb-2">
                {currentQuestion.type === 'number' 
                  ? (settings.language === 'de' ? 'Zahl' : 'Number') 
                  : (settings.language === 'de' ? 'Wort' : 'Word')}
              </span>
              <p className="text-4xl md:text-5xl font-mono font-bold text-gray-900 mb-4">
                {currentQuestion.value}
              </p>
              <div className="flex justify-center">
                <audio controls className="w-full max-w-xs">
                  <source src={currentQuestion.audioUrl || ''} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <label htmlFor="answer" className="label text-left">
                {t.yourAnswer}
              </label>
              <input
                id="answer"
                name="answer"
                type="text"
                className="input text-center text-lg font-mono mb-4"
                autoComplete="off"
                autoFocus
                placeholder={settings.language === 'de' ? 'Tippe die Antwort ein...' : 'Type your answer...'}
                disabled={showFeedback}
              />
              
              {showFeedback ? (
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg ${lastAnswer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`font-semibold ${lastAnswer.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {lastAnswer.isCorrect ? t.correct : t.incorrect}
                    </p>
                    {!lastAnswer.isCorrect && (
                      <p className="text-sm text-gray-600 mt-1">
                        {t.correctAnswer}: <span className="font-mono">{currentQuestion.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="btn-primary w-full"
                  >
                    {t.next}
                  </button>
                </div>
              ) : (
                <button type="submit" className="btn-primary w-full">
                  {t.submit}
                </button>
              )}
            </form>
          </>
        )}
      </div>

      {/* Answer History */}
      {answers.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {settings.language === 'de' ? 'Antworten' : 'Answers'}
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {answers.slice().reverse().map((answer) => (
                <div key={answer.questionId} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-mono text-gray-900">{answer.questionValue}</p>
                    <p className="text-sm text-gray-500">{answer.userAnswer}</p>
                  </div>
                  <span className={`badge ${answer.isCorrect ? 'badge-success' : 'badge-error'}`}>
                    {answer.isCorrect 
                      ? (settings.language === 'de' ? 'Richtig' : 'Correct') 
                      : (settings.language === 'de' ? 'Falsch' : 'Incorrect')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}