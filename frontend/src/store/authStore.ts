import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface Organization {
  id: string;
  name: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string, organization?: Organization) => void;
  setOrganization: (organization: Organization) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken, organization) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        set({ user, accessToken, refreshToken, organization: organization || null });
      },
      setOrganization: (organization) => {
        set({ organization });
      },
      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, organization: null, accessToken: null, refreshToken: null });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
