import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '../types';
import {
  apiGetCampaigns,
  apiCreateCampaign,
  apiUpdateCampaign,
  apiDeleteCampaign,
} from '@/services/api';
import { useAuth } from './AuthContext';

interface CampaignsContextValue {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  addCampaign: (data: CreateCampaignInput) => Promise<Campaign>;
  updateCampaign: (id: string, data: UpdateCampaignInput) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    } else {
      setCampaigns([]);
    }
  }, [user, fetchCampaigns]);

  const addCampaign = useCallback(
    async (data: CreateCampaignInput): Promise<Campaign> => {
      const created = await apiCreateCampaign(data);
      setCampaigns((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updateCampaign = useCallback(
    async (id: string, data: UpdateCampaignInput): Promise<Campaign> => {
      const updated = await apiUpdateCampaign(id, data);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    []
  );

  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    await apiDeleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      campaigns,
      loading,
      error,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      refetch: fetchCampaigns,
    }),
    [
      campaigns,
      loading,
      error,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      fetchCampaigns,
    ]
  );

  return (
    <CampaignsContext.Provider value={value}>
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns(): CampaignsContextValue {
  const ctx = useContext(CampaignsContext);
  if (!ctx)
    throw new Error('useCampaigns must be used inside CampaignsProvider');
  return ctx;
}
