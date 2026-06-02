import { describe, it, expect } from 'vitest';
import { parseScanToModelId } from '@/lib/qr-scanner/parseScanToModelId';

describe('parseScanToModelId', () => {
  it('extrae ID de hash route', () => {
    expect(parseScanToModelId('http://example.com/#/ar/abc123')).toBe('abc123');
  });

  it('extrae ID de path route', () => {
    expect(parseScanToModelId('http://example.com/ar/abc123')).toBe('abc123');
  });

  it('extrae ID de query param ?id=', () => {
    expect(parseScanToModelId('http://example.com/?id=abc123')).toBe('abc123');
  });

  it('retorna el texto tal cual si es un ID directo alfanumérico', () => {
    expect(parseScanToModelId('abc123-uid')).toBe('abc123-uid');
  });

  it('retorna null para string vacío', () => {
    expect(parseScanToModelId('')).toBeNull();
  });

  it('retorna null para texto inválido con espacios y no-URL', () => {
    expect(parseScanToModelId('esto no es un id válido')).toBeNull();
  });

  it('extrae UID de Sketchfab de la URL que genera la API', () => {
    expect(
      parseScanToModelId(
        'http://localhost:5174/#/ar/1c62d807-2fbc-4e7a-9e44-abc'
      )
    ).toBe('1c62d807-2fbc-4e7a-9e44-abc');
  });
});
