import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from './types';

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

  useEffect(() => {
    // Initialize auth state from Supabase
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement Supabase login
      console.log('Login:', credentials);
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Login failed' }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement Supabase register
      console.log('Register:', data);
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Registration failed' }));
      throw error;
    }
  };

  const logout = async () => {
    // TODO: Implement Supabase logout
    setState({ user: null, session: null, loading: false, error: null });
  };

  const updateProfile = async (data: Partial<User>) => {
    // TODO: Implement profile update
    console.log('Update profile:', data);
  };

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