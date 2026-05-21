import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import { mockCampaigns } from '../data/mockCampaigns';
import type { Campaign } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { safeGetJson, safeSetJson } from '../utils/storage';

interface CampaignsContextValue {
  campaigns: Campaign[];
  addCampaign: (c: Campaign) => void;
  updateCampaign: (c: Campaign) => void;
  deleteCampaign: (id: string) => void;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

function loadCampaigns(): Campaign[] {
  return (
    safeGetJson<Campaign[]>(localStorage, STORAGE_KEYS.CAMPAIGNS) ??
    mockCampaigns
  );
}

function saveCampaigns(campaigns: Campaign[]) {
  safeSetJson(localStorage, STORAGE_KEYS.CAMPAIGNS, campaigns);
}

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(loadCampaigns);

  const addCampaign = useCallback((c: Campaign) => {
    setCampaigns((prev) => {
      const next = [c, ...prev];
      saveCampaigns(next);
      return next;
    });
  }, []);

  const updateCampaign = useCallback((c: Campaign) => {
    setCampaigns((prev) => {
      const next = prev.map((x) => (x.id === c.id ? c : x));
      saveCampaigns(next);
      return next;
    });
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => {
      const next = prev.filter((x) => x.id !== id);
      saveCampaigns(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ campaigns, addCampaign, updateCampaign, deleteCampaign }),
    [campaigns, addCampaign, updateCampaign, deleteCampaign]
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
