interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'admin' | 'editor' | 'viewer';
  accessToken: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
} 