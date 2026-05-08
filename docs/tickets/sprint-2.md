# Sprint 2 — Librerías, servicio Sketchfab + Diagramas UML

**Objetivo de código:** Tipos TypeScript, servicio Sketchfab, librería ar-viewer (inline), librería qr-scanner (inline).
**Objetivo de informe:** 8 diagramas UML + wireframes + guía de estilos Figma.

---

## Código

### ITS-C05 — Tipos TypeScript para Sketchfab | ✅ Betania

`src/types/sketchfab.ts`:

- `SketchfabModel` — uid, name, description, thumbnails, user, license, animationCount
- `SketchfabSearchResult` — results, next (cursor para paginación)
- `SketchfabDownload` — glb URL temporal (no-store cache)
- `SketchfabSearchParams` — keyword, categories, cursor, count
- `ITSector` — `'ecommerce' | 'turismo' | 'educacion'`
- `SECTOR_META` — label, color, categories (array con slug y label Sketchfab)
- Helpers: `sectorCategories(sector)`, `getBestThumbnail(model)`

---

### ITS-C06 — Servicio Sketchfab | ✅ Betania

`src/services/sketchfab.ts`:

- `searchModels(params)` — llama a `/v3/models` con keyword, categories, cursor, count=24
- `getModel(uid)` — llama a `/v3/models/:uid`
- `getDownloadUrl(uid)` — llama a `/v3/models/:uid/download`, cache `no-store` (URLs temporales)
- Proxy-ready: si `VITE_API_BASE_URL` está definido, llama al backend propio sin auth header; si no, usa `VITE_SKETCHFAB_API_KEY` directamente
- Fix aplicado: `categories` se concatena manualmente al query string (no con URLSearchParams) para evitar encode de comas → `%2C` que Sketchfab v3 rechaza con 400

---

### ITS-C07 — Librería ar-viewer (código inline) | ✅ Betania

`src/lib/ar-viewer/`:

- `types.ts` — `ARTrackingStatus` (idle → initializing → loading-model → model-ready → searching-surface → surface-detected → model-placed → session-ended → error)
- `model-viewer.d.ts` — declaración de tipos para `<model-viewer>` de Google
- `ARViewer.tsx` — detecta WebXR en `useEffect`; renderiza `<model-viewer>` por defecto; toggle a `<ThreeARSurface>` si WebXR disponible; callbacks estabilizados en refs
- `ThreeARSurface.tsx` — WebXR hit-testing con Three.js:
  - Canvas ocupa `host.clientWidth/clientHeight` (nunca vh)
  - Resize: actualiza `camera.aspect` y `renderer.setSize` dinámicamente
  - Reticle (anillo) aparece al detectar superficie horizontal
  - `placeModel()` clona template, posiciona desde matriz del reticle
  - Gestos: pinch → escala, drag → traslación, 2 dedos → rotación (enfoque "from-start" sin acumulación de float)
  - Cleanup completo al desmontar (disposa geometrías, materiales, texturas, canvas)
- `styles.css` — estilos del viewer y controles AR
- `index.ts` — re-exporta `ARViewer`, `ARTrackingStatus`

🔁 **v2 — Estado de tracking en el viewer:** Los estados de `ARTrackingStatus` son strings técnicos en inglés. Agregar un mapa `STATUS_LABELS` en `types.ts` para mostrar texto amigable en la UI.

🔁 **v2 — Error recovery:** Si la sesión WebXR falla, el usuario ve el estado "error" pero no tiene forma de reintentar sin recargar la página. Agregar botón de reintento que desmonte y remonte el componente.

---

### ITS-C08 — Librería qr-scanner (código inline) | ✅ Betania

`src/lib/qr-scanner/`:

- `useQRScanner.ts` — usa `BrowserQRCodeReader` de `@zxing/browser`; inicia stream de cámara; retorna `{ status, lastResult, stop }`; limpieza en unmount
- `QRScanner.tsx` — renderiza `<video>` + overlay de encuadre; llama `useQRScanner`; propaga `onDetected` / `onError`
- `parseScanToModelId.ts` — acepta: hash route `#/ar/<uid>`, path `/ar/<uid>`, query `?id=<uid>`, string alfanumérico directo
- `styles.css` — overlay del scanner y animación de línea de escaneo
- `index.ts` — re-exporta `QRScanner`, `useQRScanner`, `parseScanToModelId`

🔁 **v2 — Permiso denegado:** Si el usuario deniega el permiso de cámara, `useQRScanner` propaga el error pero `QRScanner` no muestra un mensaje explicativo. Agregar estado `'permission-denied'` con instrucciones para el usuario.

---

## Informe técnico

### ITS-008 — Figura 2 (Clases) | ✅ Versión original completa · 🔴 Requiere actualización — Eduardo

**Autoría:** Eduardo (revisión de la lógica de diseño y elaboración del diagrama) · Betania (redacción del documento técnico, fundamentación conceptual y notas de implementación)

**Contexto:** El diagrama original modela la arquitectura con `@mbetania/*` tgz. Desde la migración a `itsolutions-next`, las clases del catálogo cambiaron completamente.

**Actualización pendiente:**
- [ ] Reemplazar `ArCatalog` → `SketchfabService` (métodos: `searchModels`, `getModel`, `getDownloadUrl`)
- [ ] Reemplazar `CatalogItem` (id ECO-xxx) → `SketchfabModel` (uid, name, thumbnails, user, license)
- [ ] Mantener sin cambios: `ARViewer`, `ThreeARSurface`, `QRScanner`, `ARPage`, `HomePage`, `ScanPage`
- [ ] Actualizar código Mermaid → screenshot → reemplazar Figura 2 en el informe

---

### ITS-009 — Figura 3 (Secuencia) | ✅ Mermaid completo, pendiente screenshot · ⚠️ Requiere corrección menor — Micaela

**Autoría:** Micaela (revisión de la lógica de diseño y elaboración del diagrama) · Betania (elaboración del código Mermaid y redacción del documento técnico)

**Contexto:** El flujo general QR scan → AR es correcto. Solo el paso de consulta al catálogo cambió con la migración.

**Actualización pendiente:**
- [ ] Reemplazar `ArCatalog.getById(id)` → `SketchfabService.getModel(uid)` + `getDownloadUrl(uid)`
- [ ] Tomar screenshot → reemplazar Figura 3 en el informe

---

### ITS-010 — Figura 4 (Actividad) | ✅ Completo — sin cambios para v2

**Autoría:** Micaela (revisión de la lógica de diseño y elaboración del diagrama) · Betania (elaboración del código Mermaid y redacción del documento técnico)

El flujo de trabajo del usuario (abrir app → buscar/escanear → ver en 3D → AR) no cambió con la migración.

---

### ITS-011 — Figura 5 (Estado) | ✅ Completo — sin cambios para v2

**Autoría:** Eduardo (revisión de la lógica de diseño y elaboración del diagrama) · Betania (redacción del documento técnico, fundamentación conceptual y notas de implementación)

Modela el ciclo de vida de una sesión AR en `ThreeARSurface`. Los estados y transiciones coinciden con la implementación actual en `src/lib/ar-viewer/ThreeARSurface.tsx`.

---

### ITS-012 — Figura 6 (Componentes) | ✅ Versión original completa · 🔴 Requiere actualización — Eduardo

**Autoría:** Eduardo (revisión de la lógica de diseño y elaboración del diagrama) · Betania (redacción del documento técnico, fundamentación conceptual y notas de implementación)

**Contexto:** El diagrama original muestra `baseMVP` + tres tgz `@mbetania/*`. La arquitectura actual es completamente distinta.

**Actualización pendiente:**
- [ ] Actualizar código Mermaid con la nueva estructura:

```
itsolutions-next/
├── src/pages/          → HomePage, ARPage, ScanPage
├── src/components/     → AppHeader
├── src/lib/ar-viewer/  → ARViewer, ThreeARSurface   [antes @mbetania/ar-viewer tgz]
├── src/lib/qr-scanner/ → QRScanner, useQRScanner    [antes @mbetania/qr-scanner tgz]
├── src/services/       → sketchfab.ts               [antes @mbetania/ar-catalog tgz]
└── src/types/          → sketchfab.ts

npm: three, @google/model-viewer, @zxing/browser, qrcode.react, react-router-dom
Servicio externo: Sketchfab API v3
```

- [ ] Screenshot → reemplazar Figura 6 en el informe

---

### ITS-013 — Figura 7 (Despliegue) | ✅ Versión original completa · ⚠️ Requiere ampliación — Eduardo

**Autoría:** Eduardo (revisión de la lógica de diseño y elaboración del diagrama) · Betania (redacción del documento técnico, fundamentación conceptual y notas de implementación)

**Contexto:** El diagrama actual muestra correctamente el flujo Dev → build → hosting → browser. Le faltan los nodos de Sketchfab que se agregaron con la migración.

**Actualización pendiente:**
- [ ] Agregar nodo `Sketchfab API v3` — el browser lo consulta para metadatos y URLs de descarga
- [ ] Agregar nodo `Sketchfab CDN` — el browser descarga los binarios GLB directamente desde ahí
- [ ] Screenshot → reemplazar Figura 7 en el informe

---

### ITS-014 — Figura 8 (ER) | ✅ Mermaid completo, pendiente screenshot · ⚠️ Pie de figura desactualizado — Micaela

**Autoría:** Micaela (revisión de la lógica de diseño y elaboración del diagrama) · Betania (elaboración del código Mermaid y redacción del documento técnico)

**Contexto:** El modelo entidad-relación conceptual para Stage 3 sigue siendo válido. Solo el pie de figura referencia tecnología descartada.

**Actualización pendiente:**
- [ ] Corregir pie de figura — reemplazar la referencia a `@mbetania/ar-catalog` por:
  > *"En la arquitectura actual, los datos de modelos se obtienen en tiempo real de Sketchfab API v3. Este diagrama modela la estructura de persistencia propuesta para Stage 3, cuando el sistema cuente con backend propio."*
- [ ] Tomar screenshot → reemplazar Figura 8 en el informe

---

### ITS-016 — Wireframes ScanPage y ARPage | ⏳ Eugenia

- [ ] Reemplazar "LINK AL PROTOTIPO" con link real de Figma
- [ ] Verificar que ARPage refleje el panel lateral actual (info + QR, sin selector ECO-xxx)

---

### ITS-017 — Guía de estilos | ✅ Tokens implementados en código · ⏳ Documentar en Figma — Eugenia

Tokens implementados en `src/styles.css`. Pendiente documentarlos en Figma:

- [ ] Fuente: Figtree Variable
- [ ] `--bg: #0b0f16`, `--surface: #131820`, `--accent: #9bf00b`
- [ ] Radios: `--r-xs` a `--r-pill`
- [ ] Colores de sector: ecommerce `#9bf00b`, turismo `#fb923c`, educación `#60a5fa`

---

### ITS-018 — Prototipo interactivo Figma | ⏳ Eugenia

- [ ] Flujo: HomePage → buscar modelo → click card → ARPage → toggle AR
- [ ] Flujo: HomePage → Escanear → ScanPage → escanear QR → ARPage
