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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const hydrateUser = useCallback(async (userId: string, email?: string) => {
    const profile = await getOrCreateProfile(userId, { email });
    setState(prev => ({
      ...prev,
      user: profile
        ? { ...profile, email: email || profile.email }
        : null,
    }));
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session: session ? mapSession(session) : null,
        loading: false,
      }));
      if (session?.user) {
        hydrateUser(session.user.id, session.user.email);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session: session ? mapSession(session) : null,
          loading: false,
        }));

        if (session?.user) {
          await hydrateUser(session.user.id, session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({ ...prev, user: null }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [hydrateUser]);

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
    await supabase.auth.signOut();
    setState({ user: null, session: null, loading: false, error: null });
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
  user: { id: string; email?: string };
}): Session {
  return {
    user: {
      id: session.user.id,
      email: session.user.email || '',
      preferredLanguage: 'de',
    },
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}
