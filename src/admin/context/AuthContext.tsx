import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { safeGetJson, safeSetJson } from '../utils/storage';
import {
  apiLogin,
  apiLogout,
  apiMe,
  setToken,
  clearToken,
  UNAUTHORIZED_EVENT,
} from '@/services/api';
export type { UserRole } from '../types';

interface AuthContextValue {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() =>
    safeGetJson<AdminUser>(sessionStorage, STORAGE_KEYS.SESSION)
  );

  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token && !user) {
      apiMe()
        .then(({ client }) => {
          setUser(client);
          safeSetJson(sessionStorage, STORAGE_KEYS.SESSION, client);
        })
        .catch(() => {
          clearToken();
          sessionStorage.removeItem(STORAGE_KEYS.SESSION);
        });
    }

    // Logout automático cuando cualquier llamada recibe 401
    function handleUnauthorized() {
      setUser(null);
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const { token, client } = await apiLogin(email, password);
      setToken(token);
      setUser(client);
      safeSetJson(sessionStorage, STORAGE_KEYS.SESSION, client);
      return true;
    } catch {
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiLogout();
    } catch {
      // best-effort
    } finally {
      clearToken();
      setUser(null);
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
