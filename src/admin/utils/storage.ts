export function safeGetJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function safeSetJson(
  storage: Storage,
  key: string,
  value: unknown
): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota/security errors */
  }
}
