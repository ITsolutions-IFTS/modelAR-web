import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Collection } from '../types';
import { MOCK_COLLECTIONS } from '../data/mockCollections';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { safeGetJson, safeSetJson } from '../utils/storage';

interface CollectionsCtx {
  collections: Collection[];
  addCollection: (c: Collection) => void;
  updateCollection: (c: Collection) => void;
  deleteCollection: (id: string) => void;
}

const Ctx = createContext<CollectionsCtx | null>(null);

function loadCollections(): Collection[] {
  return (
    safeGetJson<Collection[]>(localStorage, STORAGE_KEYS.COLLECTIONS) ??
    MOCK_COLLECTIONS
  );
}

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>(loadCollections);

  const save = useCallback((next: Collection[]) => {
    setCollections(next);
    safeSetJson(localStorage, STORAGE_KEYS.COLLECTIONS, next);
  }, []);

  const value = useMemo(
    () => ({
      collections,
      addCollection: (c: Collection) => save([...collections, c]),
      updateCollection: (c: Collection) =>
        save(collections.map((x) => (x.id === c.id ? c : x))),
      deleteCollection: (id: string) =>
        save(collections.filter((x) => x.id !== id)),
    }),
    [collections, save]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCollections() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error('useCollections must be inside CollectionsProvider');
  return ctx;
}
