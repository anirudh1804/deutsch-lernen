import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session, AuthState, LoginCredentials, RegisterData } from './types';
import { supabase } from '@/lib/supabase/client';
import { getOrCreateProfile, updateProfile as updateProfileRow, findProfileEmailByUsername } from '@/lib/supabase/profiles';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isAnonymousUser = (u?: { app_metadata?: Record<string, unknown> | null; is_anonymous?: boolean } | null) =>
  !!u && (u.app_metadata?.is_anonymous === true || u.is_anonymous === true);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isGuest: false,
  });

  const hydrateUser = useCallback(async (userId: string, email?: string, isGuest = false) => {
    if (isGuest) {
      // Guests have no profile row; represent them with a minimal user object.
      setState(prev => ({
        ...prev,
        isGuest: true,
        user: {
          id: userId,
          email: '',
          preferredLanguage: 'de',
          isGuest: true,
        },
      }));
      return;
    }
    const profile = await getOrCreateProfile(userId, { email });
    setState(prev => ({
      ...prev,
      isGuest: false,
      user: profile
        ? { ...profile, email: email || profile.email, isGuest: false }
        : null,
    }));
  }, []);

  // Set the session state and (re)hydrate the user profile when a session exists.
  const applySession = useCallback(async (session: {
    access_token: string;
    refresh_token: string;
    user: { id: string; email?: string; app_metadata?: Record<string, unknown> | null; is_anonymous?: boolean };
  } | null) => {
    setState(prev => ({
      ...prev,
      session: session ? mapSession(session) : null,
      loading: false,
    }));
    if (session?.user) {
      const isGuest = isAnonymousUser(session.user);
      await hydrateUser(session.user.id, session.user.email, isGuest);
    }
  }, [hydrateUser]);

  // Ensure a guest session exists so logged-out visitors can use the app.
  const ensureGuestSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return;
    try {
      await supabase.auth.signInAnonymously();
    } catch (e) {
      console.warn('Anonymous sign-in failed (may be disabled on the project):', (e as Error).message);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        applySession(session);
      } else {
        // No session: sign the visitor in as an anonymous guest.
        ensureGuestSession();
      }
    });

    // Listen to auth changes (login, logout, token refresh/expiry, anonymous)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Always reflect the latest session/token state so the UI never
        // shows a stale "logged in" state.
        await applySession(session);

        if (event === 'SIGNED_OUT') {
          setState({ user: null, session: null, loading: false, error: null, isGuest: false });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [applySession, hydrateUser, ensureGuestSession]);

  const login = useCallback(async ({ identifier, password }: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Accept either an email address or a username as the identifier.
      let email = identifier;
      const looksLikeUsername = !identifier.includes('@');
      if (looksLikeUsername) {
        const resolved = await findProfileEmailByUsername(identifier);
        if (!resolved) {
          throw new Error('User not found');
        }
        email = resolved;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      const message = (error as Error).message || 'Login failed';
      setState(prev => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, []);

  const register = useCallback(async ({ email, password, username }: RegisterData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
      if (data.user) {
        await getOrCreateProfile(data.user.id, { username, email });
      }
    } catch (error) {
      const message = (error as Error).message || 'Registration failed';
      setState(prev => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    // Revoke the refresh token server-side (not just client-side) so the
    // session truly ends and old tokens can't mint new ones afterwards.
    await supabase.auth.signOut({ scope: 'global' });
    setState({ user: null, session: null, loading: false, error: null, isGuest: false });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!state.user) return;
    await updateProfileRow(state.user.id, {
      username: data.username,
      preferred_language: data.preferredLanguage,
    });
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...data } : null,
    }));
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

function mapSession(session: {
  access_token: string;
  refresh_token: string;
  user: { id: string; email?: string; app_metadata?: Record<string, unknown> | null; is_anonymous?: boolean };
}): Session {
  const isGuest = isAnonymousUser(session.user);
  return {
    user: {
      id: session.user.id,
      email: isGuest ? '' : session.user.email || '',
      preferredLanguage: 'de',
      isGuest,
    },
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}
