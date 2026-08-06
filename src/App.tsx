import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth';
import { GameProvider } from '@/features/game';
import { SettingsProvider } from '@/features/settings';
import { MainLayout } from '@/components/layout';
import { Home } from '@/pages/Home';
import { Game } from '@/pages/Game';
import { Settings } from '@/pages/Settings';
import { Profile } from '@/pages/Profile';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <GameProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<Home />} />
              <Route path="/game" element={<Game />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GameProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;