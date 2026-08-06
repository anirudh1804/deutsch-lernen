import { Link } from 'react-router-dom';
import { useSettings } from '@/features/settings';

export function NotFound() {
  const { settings } = useSettings();

  const t = {
    de: {
      title: 'Seite nicht gefunden',
      message: 'Die gesuchte Seite existiert nicht.',
      backHome: 'Zur Startseite',
    },
    en: {
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist.',
      backHome: 'Back to Home',
    },
  }[settings.language];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600 mb-8">{t.message}</p>
        <Link to="/" className="btn-primary">
          {t.backHome}
        </Link>
      </div>
    </div>
  );
}