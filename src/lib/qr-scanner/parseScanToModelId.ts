/**
 * Extrae el ID de modelo de un texto QR.
 * Acepta:
 *   - ID directo:          "ECO-001" o cualquier UID de Sketchfab
 *   - URL con hash route:  "https://.../#/ar/abc123"
 *   - URL con path:        "https://.../ar/abc123"
 *   - URL con query param: "https://...?id=abc123"
 */
export function parseScanToModelId(scan: string): string | null {
  const text = scan.trim()
  if (!text) return null

  // Hash route: #/ar/<id>
  const hashMatch = text.match(/#\/ar\/([^/?#\s]+)/)
  if (hashMatch) return hashMatch[1]

  // Path route: /ar/<id>
  const pathMatch = text.match(/\/ar\/([^/?#\s]+)/)
  if (pathMatch) return pathMatch[1]

  // Query param: ?id=<id>
  try {
    const url = new URL(text)
    const id = url.searchParams.get('id')
    if (id) return id
  } catch {
    // Not a URL — fall through
  }

  // Direct ID — any non-empty string without slashes or spaces is treated as an ID
  if (/^[a-zA-Z0-9_-]+$/.test(text)) return text

  return null
}
