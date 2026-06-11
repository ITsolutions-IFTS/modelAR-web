import { STORAGE_KEYS } from '@/admin/constants/storageKeys';
import type {
  AdminUser,
  Campaign,
  Collection,
  CreateCampaignInput,
  Organization,
  UpdateCampaignInput,
} from '@/admin/types';
import type { Sector } from '@/admin/types';

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const TIMEOUT_MS = 10_000;

export const UNAUTHORIZED_EVENT = 'modelar:unauthorized';

// ── Token storage ──────────────────────────────────────────────────────────

function getToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function clearRefreshToken(): void {
  sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

// ── Response shapes ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ErrorBody {
  error?:
    | string
    | {
        code?: string;
        message?: string | string[];
        statusCode?: number;
      };
}

function extractErrorMessage(body: ErrorBody, status: number): string {
  const err = body.error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const msg = err.message;
    if (Array.isArray(msg)) return msg.join(' · ');
    if (typeof msg === 'string') return msg;
  }
  return `Error ${status}`;
}

// ── Core fetch ─────────────────────────────────────────────────────────────

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

  // 401: only treat as session expiry when we actually sent a token.
  // For unauthenticated calls (login with wrong password) it's a regular error.
  if (res.status === 401) {
    const body = (await res.json().catch(() => ({}))) as ErrorBody;
    if (token) {
      clearToken();
      clearRefreshToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      throw new Error('Sesión expirada. Por favor iniciá sesión nuevamente.');
    }
    throw new Error(extractErrorMessage(body, 401));
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ErrorBody;
    throw new Error(extractErrorMessage(body, res.status));
  }

  // 204 No Content (DELETE) or empty body
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  client: AdminUser;
};

export const apiLogin = (email: string, password: string) =>
  apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiMe = () => apiFetch<AdminUser>('/api/auth/me');

export const apiLogout = (refreshToken: string) =>
  apiFetch<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

// ── Campaigns ──────────────────────────────────────────────────────────────

export const apiGetCampaigns = (params?: { orgSlug?: string }) => {
  const qs = params?.orgSlug
    ? `?orgSlug=${encodeURIComponent(params.orgSlug)}`
    : '';
  return apiFetch<PaginatedResponse<Campaign>>(`/api/campaigns${qs}`);
};

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
  apiFetch<void>(`/api/campaigns/${id}`, { method: 'DELETE' });

// ── Collections ────────────────────────────────────────────────────────────

export const apiGetCollections = () =>
  apiFetch<PaginatedResponse<Collection>>('/api/collections');

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
  apiFetch<void>(`/api/collections/${id}`, { method: 'DELETE' });

// ── Organizations ──────────────────────────────────────────────────────────

export const apiGetOrganizations = () =>
  apiFetch<PaginatedResponse<Organization>>('/api/organizations');

export const apiGetOrganization = (slug: string) =>
  apiFetch<Organization>(`/api/organizations/${slug}`);

export const apiCreateOrganization = (data: {
  slug: string;
  name: string;
  description?: string;
  sector: Sector;
}) =>
  apiFetch<Organization>('/api/organizations', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiUpdateOrganization = (
  slug: string,
  data: { name?: string; description?: string | null; sector?: Sector }
) =>
  apiFetch<Organization>(`/api/organizations/${slug}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiDeleteOrganization = (slug: string) =>
  apiFetch<void>(`/api/organizations/${slug}`, { method: 'DELETE' });
