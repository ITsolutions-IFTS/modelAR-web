import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Collection } from '../types';
import {
  apiGetCollections,
  apiCreateCollection,
  apiUpdateCollection,
  apiDeleteCollection,
} from '@/services/api';
import { useAuth } from './AuthContext';

interface CollectionsCtx {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  addCollection: (data: {
    name: string;
    description?: string;
  }) => Promise<Collection>;
  updateCollection: (
    id: string,
    data: { name?: string; description?: string }
  ) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const Ctx = createContext<CollectionsCtx | null>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetCollections();
      setCollections(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const addCollection = useCallback(
    async (data: {
      name: string;
      description?: string;
    }): Promise<Collection> => {
      const created = await apiCreateCollection(data);
      setCollections((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const updateCollection = useCallback(
    async (
      id: string,
      data: { name?: string; description?: string }
    ): Promise<Collection> => {
      const updated = await apiUpdateCollection(id, data);
      setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    []
  );

  const deleteCollection = useCallback(async (id: string): Promise<void> => {
    await apiDeleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      collections,
      loading,
      error,
      addCollection,
      updateCollection,
      deleteCollection,
      refetch: loadCollections,
    }),
    [
      collections,
      loading,
      error,
      addCollection,
      updateCollection,
      deleteCollection,
      loadCollections,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCollections() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error('useCollections must be inside CollectionsProvider');
  return ctx;
}
