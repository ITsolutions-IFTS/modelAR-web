// Identificador de sesión efímero para dedupe de eventos server-side.
// sessionStorage: vive por pestaña/sesión, se borra al cerrar. No es PII.

const SESSION_KEY = 'modelar:analytics:sessionId';

export function getAnalyticsSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
