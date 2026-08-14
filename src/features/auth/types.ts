export interface User {
  id: string;
  email: string;
  username?: string;
  preferredLanguage: 'de' | 'en';
  created_at?: string;
  isGuest?: boolean;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isGuest: boolean;
}

export interface LoginCredentials {
  identifier: string; // email OR username
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}