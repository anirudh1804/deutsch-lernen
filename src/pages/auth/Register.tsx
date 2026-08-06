import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { settings } = useSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
    de: {
      title: 'Registrieren',
      subtitle: 'Erstelle ein Konto, um deinen Fortschritt zu speichern',
      username: 'Benutzername',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      submit: 'Registrieren',
      hasAccount: 'Schon ein Konto?',
      login: 'Anmelden',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      usernameTaken: 'Benutzername bereits vergeben',
    },
    en: {
      title: 'Register',
      subtitle: 'Create an account to save your progress',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submit: 'Register',
      hasAccount: 'Already have an account?',
      login: 'Login',
      passwordMismatch: 'Passwords do not match',
      usernameTaken: 'Username already taken',
    },
  }[settings.language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(settings.language === 'de' ? 'Passwort muss mindestens 8 Zeichen haben' : 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register({ email, password, username });
      navigate('/');
    } catch (err) {
      setError(t.usernameTaken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">
            Deutsch Lernen
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="label">{t.username}</label>
              <input
                id="username"
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                minLength={3}
                maxLength={20}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">{t.email}</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">{t.password}</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">{t.confirmPassword}</label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading 
                ? (settings.language === 'de' ? 'Registrieren...' : 'Registering...')
                : t.submit}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t.hasAccount} {' '}
              <Link to="/login" className="text-primary-600 hover:underline">
                {t.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}