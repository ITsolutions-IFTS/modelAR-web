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

describe('apiFetch — 401 con token (sesión expirada)', () => {
  it('despacha UNAUTHORIZED_EVENT, limpia token y lanza "Sesión expirada"', async () => {
    setToken('expired-token');
    mockFetch(401, {
      error: { code: 'UNAUTHORIZED', message: 'Token expired' },
    });
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    await expect(apiGetCampaigns()).rejects.toThrow('Sesión expirada');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();

    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });
});

describe('apiFetch — 401 sin token (credenciales inválidas)', () => {
  it('NO despacha evento y propaga el mensaje del backend', async () => {
    mockFetch(401, {
      error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' },
    });
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    await expect(apiGetCampaigns()).rejects.toThrow('Invalid credentials');
    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });
});

describe('apiFetch — error con shape canónica del backend', () => {
  it('extrae error.message string', async () => {
    mockFetch(400, {
      error: { code: 'BAD_REQUEST', message: 'title is required' },
    });
    await expect(apiGetCampaigns()).rejects.toThrow('title is required');
  });

  it('une error.message[] de validación', async () => {
    mockFetch(400, {
      error: {
        code: 'BAD_REQUEST',
        message: ['title is required', 'sector must be valid'],
      },
    });
    await expect(apiGetCampaigns()).rejects.toThrow(
      'title is required · sector must be valid'
    );
  });

  it('soporta error como string plano (fallback)', async () => {
    mockFetch(400, { error: 'something failed' });
    await expect(apiGetCampaigns()).rejects.toThrow('something failed');
  });
});

describe('apiFetch — Bearer token', () => {
  it('incluye Authorization header cuando hay token', async () => {
    const spy = mockFetch(200, { data: [], pagination: {} });
    setToken('mytoken');

    await apiGetCampaigns();

    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer mytoken'
    );
  });

  it('omite Authorization header sin token', async () => {
    const spy = mockFetch(200, { data: [], pagination: {} });

    await apiGetCampaigns();

    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(
      (init.headers as Record<string, string>)['Authorization']
    ).toBeUndefined();
  });
});
