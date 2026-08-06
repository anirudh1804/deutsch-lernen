import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { settings } = useSettings();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
    de: {
      title: 'Anmelden',
      subtitle: 'Melde dich an, um deinen Fortschritt zu speichern',
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Anmelden',
      noAccount: 'Noch kein Konto?',
      register: 'Registrieren',
      forgotPassword: 'Passwort vergessen?',
    },
    en: {
      title: 'Login',
      subtitle: 'Sign in to save your progress',
      email: 'Email',
      password: 'Password',
      submit: 'Sign In',
      noAccount: "Don't have an account?",
      register: 'Register',
      forgotPassword: 'Forgot password?',
    },
  }[settings.language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(settings.language === 'de' ? 'Anmeldung fehlgeschlagen' : 'Login failed');
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
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading 
                ? (settings.language === 'de' ? 'Anmelden...' : 'Signing in...')
                : t.submit}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t.noAccount} {' '}
              <Link to="/register" className="text-primary-600 hover:underline">
                {t.register}
              </Link>
            </p>
            <p className="mt-2">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                {t.forgotPassword}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}