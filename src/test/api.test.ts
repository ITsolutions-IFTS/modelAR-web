import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UNAUTHORIZED_EVENT,
  setToken,
  clearToken,
  apiGetCampaigns,
} from '@/services/api';
import { STORAGE_KEYS } from '@/admin/constants/storageKeys';

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  clearToken();
});

describe('setToken / clearToken', () => {
  it('guarda y elimina el token de sessionStorage', () => {
    setToken('tok123');
    expect(sessionStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('tok123');
    clearToken();
    expect(sessionStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
  });
});

describe('apiFetch — respuesta 401', () => {
  it('despacha evento UNAUTHORIZED_EVENT y lanza error', async () => {
    mockFetch(401, {});
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    await expect(apiGetCampaigns()).rejects.toThrow('Sesión expirada');
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });
});

describe('apiFetch — respuesta de error genérico', () => {
  it('lanza el mensaje de error del body', async () => {
    mockFetch(400, { error: 'title is required' });

    await expect(apiGetCampaigns()).rejects.toThrow('title is required');
  });
});

describe('apiFetch — adjunta Bearer token si existe', () => {
  it('incluye Authorization header cuando hay token', async () => {
    const spy = mockFetch(200, []);
    setToken('mytoken');

    await apiGetCampaigns();

    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer mytoken'
    );
  });

  it('omite Authorization header sin token', async () => {
    const spy = mockFetch(200, []);

    await apiGetCampaigns();

    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(
      (init.headers as Record<string, string>)['Authorization']
    ).toBeUndefined();
  });
});
