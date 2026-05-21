import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { safeGetJson, safeSetJson } from '../utils/storage';

export interface ActiveOrg {
  slug: string;
  name: string;
}

interface ActiveOrgContextValue {
  activeOrg: ActiveOrg | null;
  setActiveOrg: (org: ActiveOrg | null) => void;
}

const ActiveOrgContext = createContext<ActiveOrgContextValue | null>(null);

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/ /g, '-');
}

function initActiveOrg(): ActiveOrg | null {
  const stored = safeGetJson<ActiveOrg>(
    sessionStorage,
    STORAGE_KEYS.ACTIVE_ORG
  );
  if (stored) return stored;

  const user = safeGetJson<{ role: string; org: string }>(
    sessionStorage,
    STORAGE_KEYS.SESSION
  );
  if (user?.role === 'client' && user?.org) {
    const org: ActiveOrg = { slug: nameToSlug(user.org), name: user.org };
    safeSetJson(sessionStorage, STORAGE_KEYS.ACTIVE_ORG, org);
    return org;
  }
  return null;
}

export function ActiveOrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeOrg, setActiveOrgState] = useState<ActiveOrg | null>(
    initActiveOrg
  );

  useEffect(() => {
    if (!user) {
      setActiveOrgState(null);
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_ORG);
    } else if (user.role === 'client' && !activeOrg) {
      const org: ActiveOrg = { slug: nameToSlug(user.org), name: user.org };
      setActiveOrgState(org);
      safeSetJson(sessionStorage, STORAGE_KEYS.ACTIVE_ORG, org);
    }
  }, [user]); // activeOrg omitted intentionally — only react to user changes

  function setActiveOrg(org: ActiveOrg | null) {
    setActiveOrgState(org);
    if (org) safeSetJson(sessionStorage, STORAGE_KEYS.ACTIVE_ORG, org);
    else sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_ORG);
  }

  return (
    <ActiveOrgContext.Provider value={{ activeOrg, setActiveOrg }}>
      {children}
    </ActiveOrgContext.Provider>
  );
}

export function useActiveOrg(): ActiveOrgContextValue {
  const ctx = useContext(ActiveOrgContext);
  if (!ctx)
    throw new Error('useActiveOrg must be used inside ActiveOrgProvider');
  return ctx;
}
