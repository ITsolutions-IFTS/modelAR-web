import { describe, it, expect, beforeEach } from 'vitest';
import { safeGetJson, safeSetJson } from '@/admin/utils/storage';

class FakeStorage implements Storage {
  private data: Record<string, string> = {};
  get length() {
    return Object.keys(this.data).length;
  }
  key(n: number) {
    return Object.keys(this.data)[n] ?? null;
  }
  getItem(k: string) {
    return this.data[k] ?? null;
  }
  setItem(k: string, v: string) {
    this.data[k] = v;
  }
  removeItem(k: string) {
    delete this.data[k];
  }
  clear() {
    this.data = {};
  }
}

let storage: FakeStorage;
beforeEach(() => {
  storage = new FakeStorage();
});

describe('safeGetJson', () => {
  it('retorna null para clave inexistente', () => {
    expect(safeGetJson(storage, 'missing')).toBeNull();
  });

  it('parsea JSON correctamente', () => {
    storage.setItem('key', JSON.stringify({ a: 1 }));
    expect(safeGetJson(storage, 'key')).toEqual({ a: 1 });
  });

  it('retorna null si el JSON es inválido', () => {
    storage.setItem('key', 'not-json{');
    expect(safeGetJson(storage, 'key')).toBeNull();
  });
});

describe('safeSetJson', () => {
  it('serializa y guarda el valor', () => {
    safeSetJson(storage, 'key', { x: 42 });
    expect(storage.getItem('key')).toBe('{"x":42}');
  });

  it('no lanza si el storage falla', () => {
    const broken = new FakeStorage();
    broken.setItem = () => {
      throw new Error('quota');
    };
    expect(() => safeSetJson(broken, 'key', {})).not.toThrow();
  });
});
