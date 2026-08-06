export interface User {
  id: string;
  email: string;
  username?: string;
  preferredLanguage: 'de' | 'en';
  created_at?: string;
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
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}