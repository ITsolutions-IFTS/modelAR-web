import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Organization, Sector } from '../types';
import { apiCreateOrganization, apiGetOrganizations } from '@/services/api';
import { useAuth } from './AuthContext';

export interface CreateOrganizationInput {
  slug: string;
  name: string;
  description?: string;
  sector: Sector;
}

interface OrganizationsContextValue {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addOrganization: (data: CreateOrganizationInput) => Promise<Organization>;
}

const OrganizationsContext = createContext<OrganizationsContextValue | null>(
  null
);

export function OrganizationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiGetOrganizations();
      setOrganizations(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
    else setOrganizations([]);
  }, [user, load]);

  const addOrganization = useCallback(
    async (data: CreateOrganizationInput): Promise<Organization> => {
      const created = await apiCreateOrganization(data);
      setOrganizations((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const value = useMemo(
    () => ({
      organizations,
      loading,
      error,
      refetch: load,
      addOrganization,
    }),
    [organizations, loading, error, load, addOrganization]
  );

  return (
    <OrganizationsContext.Provider value={value}>
      {children}
    </OrganizationsContext.Provider>
  );
}

export function useOrganizations(): OrganizationsContextValue {
  const ctx = useContext(OrganizationsContext);
  if (!ctx)
    throw new Error(
      'useOrganizations must be used inside OrganizationsProvider'
    );
  return ctx;
}
