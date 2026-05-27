import { STORAGE_KEYS } from '@/admin/constants/storageKeys';
import type {
  AdminUser,
  Campaign,
  Collection,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '@/admin/types';

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const TIMEOUT_MS = 10_000;

export const UNAUTHORIZED_EVENT = 'modelar:unauthorized';

function getToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new Error('Sesión expirada. Por favor iniciá sesión nuevamente.');
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export type LoginResponse = { token: string; client: AdminUser };

export const apiLogin = (email: string, password: string) =>
  apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiMe = () => apiFetch<{ client: AdminUser }>('/api/auth/me');

export const apiLogout = () =>
  apiFetch<{ success: boolean }>('/api/auth/logout', { method: 'POST' });

// ── Campaigns ───────────────────────────────────────────────────────────────

export const apiGetCampaigns = () => apiFetch<Campaign[]>('/api/campaigns');

export const apiGetCampaign = (id: string) =>
  apiFetch<Campaign>(`/api/campaigns/${id}`);

export const apiCreateCampaign = (data: CreateCampaignInput) =>
  apiFetch<Campaign>('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiUpdateCampaign = (id: string, data: UpdateCampaignInput) =>
  apiFetch<Campaign>(`/api/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiDeleteCampaign = (id: string) =>
  apiFetch<{ success: boolean }>(`/api/campaigns/${id}`, { method: 'DELETE' });

// ── Collections ─────────────────────────────────────────────────────────────

export const apiGetCollections = () =>
  apiFetch<Collection[]>('/api/collections');

export const apiCreateCollection = (data: {
  name: string;
  description?: string;
}) =>
  apiFetch<Collection>('/api/collections', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiUpdateCollection = (
  id: string,
  data: { name?: string; description?: string }
) =>
  apiFetch<Collection>(`/api/collections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiDeleteCollection = (id: string) =>
  apiFetch<{ success: boolean }>(`/api/collections/${id}`, {
    method: 'DELETE',
  });
