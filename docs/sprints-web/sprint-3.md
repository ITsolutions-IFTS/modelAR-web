# Sprint 3 — Páginas principales + Integración y propuesta ejecutiva

**Objetivo de código:** Implementación de HomePage, ARPage y ScanPage.
**Objetivo de informe:** Secciones 5 y 6 del APA + coherencia entre diagramas.

---

## Código

### ITS-C09 — HomePage | ✅ Betania

`src/pages/HomePage.tsx`:

- Barra de búsqueda con debounce de 400ms en keyword
- Tabs de sector: Todos / Ecommerce / Turismo / Educación
- Dropdown de categoría (aparece solo cuando hay sector seleccionado)
- Llama `searchModels()` al cambiar tab, categoría o keyword; resetea cursor al cambiar filtro
- Grid de tarjetas `model-card` con thumbnail, nombre, usuario y botón "Ver en AR"
- Paginación con cursor (`loadMore()` — agrega resultados al grid existente)
- Estados: `.state-loading`, `.state-error`, `.state-empty`
- Navegación a `/ar/:uid` al hacer click en una tarjeta

🔁 **v2 — Skeleton grid:** La primera carga y cada `loadMore()` muestran solo texto "Cargando modelos...". Reemplazar por un grid de `.model-card--skeleton` con animación shimmer (mismas dimensiones que tarjetas reales, evita layout shift).

🔁 **v2 — Badge de sector en tarjetas:** El badge que se muestra en las tarjetas usa siempre `sector-badge--educacion` (azul), solo para modelos con animaciones. El badge debería:
  - Mostrar el sector activo del tab si está filtrado (ecommerce/turismo/educación)
  - Usar el color correspondiente al sector (`--sector-ecommerce`, etc.)

🔁 **v2 — Estado vacío ilustrado:** El estado sin resultados muestra solo texto. Agregar un ícono/ilustración y texto descriptivo ("No encontramos modelos. Probá con otra búsqueda.").

🔁 **v2 — Licencia en tarjeta:** Las tarjetas muestran nombre + usuario. Agregar badge de licencia (CC0, CC-BY, etc.) para facilitar el uso en producción.

---

### ITS-C10 — ARPage | ✅ Betania

`src/pages/ARPage.tsx`:

- Carga metadatos y URL de descarga en paralelo (`Promise.all`) al montar o cambiar UID
- Layout: `.ar-layout` (columna en mobile, fila en ≥768px)
  - `.ar-layout__viewer` — ocupa `flex: 1; min-height: 0` (sin vh)
  - `.ar-layout__panel` — panel scrollable con info del modelo
- Panel lateral: nombre, usuario, licencia, estado AR, descripción truncada a 200 chars, QR de compartir
- `QRCodeSVG` genera QR del hash route `#/ar/:uid`
- Botón "Copiar link" usa `navigator.clipboard.writeText`
- Estado de tracking mostrado como string crudo (ej: `searching-surface`)

🔁 **v2 — Inline styles en panel:** El panel lateral usa casi exclusivamente inline styles. Extraer a clases CSS:
  `.ar-panel__title`, `.ar-panel__meta`, `.ar-panel__status`, `.ar-panel__description`, `.ar-panel__share`

🔁 **v2 — Estado AR legible:** El `trackingStatus` se muestra en crudo. Usar un mapa de etiquetas:
  ```
  idle              → "Iniciando..."
  initializing      → "Preparando AR..."
  loading-model     → "Cargando modelo..."
  model-ready       → "Modelo listo"
  searching-surface → "Buscando superficie..."
  surface-detected  → "Superficie detectada — tocá para colocar"
  model-placed      → "Modelo colocado"
  session-ended     → "Sesión finalizada"
  error             → "Error"
  ```

🔁 **v2 — Loading skeleton ARPage:** El estado `phase === 'loading'` muestra texto plano. Agregar un placeholder que simule el layout del panel (skeleton del nombre, usuario, etc.).

---

### ITS-C11 — ScanPage | ✅ Betania

`src/pages/ScanPage.tsx`:

- Renderiza `<QRScanner>` con callbacks `onDetected` y `onError`
- `onDetected` → llama `parseScanToModelId()` → navega a `/ar/:uid`
- `onError` → `console.warn` (sin feedback visual al usuario)

🔁 **v2 — Error visible al usuario:** Los errores de cámara (permiso denegado, dispositivo sin cámara) van a `console.warn` pero no se muestran en pantalla. Agregar estado de error en `ScanPage` con mensaje explicativo y, si es permiso denegado, instrucciones para habilitarlo en el browser.

🔁 **v2 — UI mínima:** La página tiene `<h1>` y un párrafo. Agregar:
  - Indicador de estado del scanner (buscando / código detectado)
  - Botón para detener/reiniciar el scanner
  - Historial local de los últimos UID escaneados (localStorage, máx. 5)

---

## Informe técnico

### ITS-019 — Sección 5: Fases de desarrollo | ⏳ Betania

- [ ] Corregir descripción de Fase 3:
  > *"El motor AR (`src/lib/ar-viewer/`) y el escáner QR (`src/lib/qr-scanner/`) están implementados como módulos inline en el repositorio. El catálogo es dinámico: `src/services/sketchfab.ts` conecta con Sketchfab API v3 para obtener modelos en tiempo real."*

Estado real de las fases:

| Fase | Estado |
|---|---|
| 1. Análisis y requerimientos | ✅ Completado |
| 2. Diseño del sistema | ✅ Diagramas completos (correcciones pendientes en 2, 6, 7) |
| 3. Desarrollo e implementación | ✅ `itsolutions-next` con TypeScript, Sketchfab, libs inline |
| 4. Pruebas y QA | 🧪 Pendiente — probar en Android Chrome + iOS Safari |
| 5. Capacitación | ⏳ Propuesto — Stage 3 |
| 6. Manual y soporte | ⏳ Propuesto — Stage 3 |
| 7. Mantenimiento | ⏳ Propuesto — Stage 3 |

---

### ITS-020 — Sección 6: Propuesta ejecutiva | ⏳ Betania

- [ ] Reemplazar *"librerías locales"* por *"módulos inline en `src/lib/`"*
- [ ] Agregar en el diferencial: *"La integración con Sketchfab API provee acceso a más de 10 millones de modelos 3D sin costo de almacenamiento ni procesamiento."*

---

### ITS-023 — QA cruzado de coherencia entre diagramas | ⏳ Micaela

Ejecutar **después** de que Eduardo termine Figuras 2, 6 y 7:

- [ ] Figura 2 incluye `SketchfabService` y `SketchfabModel`
- [ ] Figura 3 muestra llamada a Sketchfab API, no catálogo local
- [ ] Figura 5 — estados coinciden con código en `src/lib/ar-viewer/ThreeARSurface.tsx`
- [ ] Figura 6 muestra `src/lib/ar-viewer`, `src/lib/qr-scanner` y `src/services/sketchfab.ts`
- [ ] Figura 7 incluye nodos Sketchfab API + Sketchfab CDN
- [ ] Figura 8 — pie de figura corregido
- [ ] No quedan referencias a `@mbetania/*`, `poly.pizza` ni `/public/models/` en ningún diagrama
- [ ] Los actores de Figura 1 están referenciados en Figura 3
