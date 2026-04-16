import { create } from 'zustand';
import type { AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, token: string) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setToken: (accessToken) => set({ accessToken }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAccessToken = () => useAuthStore((s) => s.accessToken);

export const useHasPermission = (method: string, apiPath: string): boolean => {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  if (user.role.name === 'SUPER_ADMIN') return true;
  return user.permissions.some(
    (p) => p.method === method && p.apiPath === apiPath,
  );
};
