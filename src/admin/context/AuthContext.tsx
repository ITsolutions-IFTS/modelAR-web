import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { safeGetJson, safeSetJson } from '../utils/storage';
export type { UserRole } from '../types';

const CREDENTIALS: Record<string, { password: string; user: AdminUser }> = {
  'admin@santillana.com': {
    password: 'demo1234',
    user: {
      email: 'admin@santillana.com',
      name: 'Santillana Admin',
      role: 'client',
      org: 'Santillana',
    },
  },
  'admin@vegadesarrollos.com': {
    password: 'demo1234',
    user: {
      email: 'admin@vegadesarrollos.com',
      name: 'Vega Admin',
      role: 'client',
      org: 'Vega',
    },
  },
  'admin@itsolutions.com': {
    password: 'demo1234',
    user: {
      email: 'admin@itsolutions.com',
      name: 'ITSolutions Admin',
      role: 'superadmin',
      org: 'ITSolutions',
    },
  },
};

interface AuthContextValue {
  user: AdminUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() =>
    safeGetJson<AdminUser>(sessionStorage, STORAGE_KEYS.SESSION)
  );

  function login(email: string, password: string): boolean {
    const entry = CREDENTIALS[email];
    if (entry && entry.password === password) {
      setUser(entry.user);
      safeSetJson(sessionStorage, STORAGE_KEYS.SESSION, entry.user);
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
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
