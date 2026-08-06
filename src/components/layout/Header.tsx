import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings';
import { LanguageToggle } from './LanguageToggle';

export function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const navLinks = [
    { path: '/', label: settings.language === 'de' ? 'Start' : 'Home' },
    { path: '/game', label: settings.language === 'de' ? 'Spielen' : 'Play' },
    { path: '/profile', label: settings.language === 'de' ? 'Profil' : 'Profile' },
    { path: '/settings', label: settings.language === 'de' ? 'Einstellungen' : 'Settings' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary-600" aria-label="Home">
            Deutsch Lernen
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user.username || user.email}
                </span>
                <button
                  onClick={logout}
                  className="btn-secondary text-sm"
                >
                  {settings.language === 'de' ? 'Abmelden' : 'Logout'}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-ghost text-sm">
                  {settings.language === 'de' ? 'Anmelden' : 'Login'}
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  {settings.language === 'de' ? 'Registrieren' : 'Register'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}