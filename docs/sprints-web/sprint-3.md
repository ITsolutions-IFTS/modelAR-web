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

✅ **v2 — Skeleton grid:** Resuelto en ITS-REF02 (sprint 4) — `state-loading` con clase CSS implementado. Sin layout shift.

➡️ **v2 — Badge de sector en tarjetas:** Movido a ITS-REF05 (sprint 6, backlog) — requiere filtro por sector en el catálogo antes de mostrar el badge.

➡️ **v2 — Estado vacío ilustrado:** No implementado — no hay ticket activo.

➡️ **v2 — Licencia en tarjeta:** No corresponde para la entrega académica — no hay ticket activo.

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

✅ **v2 — Inline styles en panel:** Resuelto en ITS-REF03 (sprint 4) — `ARPage.tsx` usa clases CSS: `.ar-layout`, `.ar-panel`, `.ar-panel__status`, `.ar-panel__status-value`, `.share-panel`.

✅ **v2 — Estado AR legible:** Resuelto en ITS-REF03 (sprint 4) — status labels implementados con `STATUS_LABEL` mapeado.

➡️ **v2 — Loading skeleton ARPage:** No implementado — no hay ticket activo.

---

### ITS-C11 — ScanPage | ✅ Betania

`src/pages/ScanPage.tsx`:

- Renderiza `<QRScanner>` con callbacks `onDetected` y `onError`
- `onDetected` → llama `parseScanToModelId()` → navega a `/ar/:uid`
- `onError` → `console.warn` (sin feedback visual al usuario)

✅ **v2 — Error visible al usuario:** Resuelto en ITS-REF04 (sprint 4) — `useQRScanner` captura errores y `QRScanner` muestra mensaje con instrucciones de permisos.

➡️ **v2 — UI mínima (indicador, historial):** No implementado — no hay ticket activo para la entrega.

---

## Informe técnico

### ITS-019 — Sección 5: Fases de desarrollo | ⏳ Betania

> **Actualizado para Stage 4:** Fase 3 ya no describe un monolito; el desarrollo se separó en 3 servicios durante Sprint 6.

- [ ] Reescribir descripción de Fase 3:
  > _"El sistema se implementa en tres servicios desplegados de forma independiente: `modelar-web` (Vite + React, frontend de admin + experiencia AR pública), `modelar-api` (Express, gateway HTTP fino sin estado) y `modelar-core` (NestJS, API externa con la lógica de negocio en clean architecture de 4 capas, Postgres y Redis). El frontend implementa la visualización 3D/AR (Three.js + model-viewer) y el escaneo de QR (ZXing) como parte de su propio código. El catálogo de modelos lo provee `modelar-core` consultando Sketchfab API v3 con cache Redis."_

Estado real de las fases (Stage 4):

| Fase                           | Estado                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Análisis y requerimientos   | ✅ Completado                                                                                                                        |
| 2. Diseño del sistema          | ✅ Diagramas completos (pendiente actualizarlos con `modelar-core` como nodo separado — ver ITS-023)                                 |
| 3. Desarrollo e implementación | ✅ Tres repos funcionando end-to-end: `modelar-web`, `modelar-api`, `modelar-core`                                                   |
| 4. Pruebas y QA                | 🧪 Tests unitarios verdes (web: 23/23 · core: 112/112). Pendiente: pruebas de integración documentadas y testing en dispositivo real |
| 5. Capacitación                | ⏳ Manual de Usuario en preparación (Stage 4)                                                                                        |
| 6. Manual y soporte            | ⏳ Manual Técnico en preparación (Stage 4)                                                                                           |
| 7. Mantenimiento               | ⏳ Deploy en Railway/Render del core como servicio público; gateway y frontend levantables localmente apuntando al deploy            |

---

### ITS-020 — Sección 6: Propuesta ejecutiva | ⏳ Betania

> **Actualizado para Stage 4:** el diferencial ahora incluye la arquitectura desacoplada, no solo Sketchfab.

- [ ] Sacar del texto la mención a _"librerías locales"_ — el concepto ya no aplica. La única dependencia externa de negocio del frontend es `modelar-core` (vía el gateway).
- [ ] Agregar al diferencial:
  - _"Integración con Sketchfab API v3 provee acceso a más de 10 millones de modelos 3D sin costo de almacenamiento ni procesamiento."_
  - _"Arquitectura desacoplada en tres servicios: el frontend y el gateway son repos públicos que cualquier integrador puede levantar localmente, mientras la lógica de negocio (modelar-core) corre como API externa configurable por env (`CORE_URL`). Esto habilita ampliar canales de uso (mobile, dashboards externos, integraciones B2B) sin tocar el core."_
  - _"Tests automatizados (135 tests en total) y soft delete en todas las entidades del dominio."_

---

### ITS-023 — QA cruzado de coherencia entre diagramas | ⏳ Micaela

> **Actualizado para Stage 4:** los diagramas tienen que reflejar la separación en tres servicios.

Ejecutar **después** de que Eduardo actualice las figuras 2, 3, 6 y 7 con `modelar-core` como nodo separado:

- [ ] Figura 2 (componentes) incluye los tres servicios: `modelar-web`, `modelar-api` (gateway), `modelar-core` (clean architecture con sus 4 capas), Postgres y Redis
- [ ] Figura 3 (interacción) muestra el flujo `web → gateway → core → DB`, no una llamada directa
- [ ] Figura 5 (estados AR) — siguen coincidiendo con `src/lib/ar-viewer/ThreeARSurface.tsx` (no cambió)
- [ ] Figura 6 (estructura de carpetas) muestra los tres repos por separado, no como subcarpetas del mismo proyecto
- [ ] Figura 7 (despliegue) incluye Sketchfab API + CDN + Postgres + Redis + el core en su nodo de hosting
- [ ] Figura 8 — pie de figura corregido
- [ ] No quedan referencias a `@mbetania/*`, `poly.pizza` ni `/public/models/` en ningún diagrama
- [ ] Los actores de Figura 1 están referenciados en Figura 3
- [ ] Las flechas que cruzan el límite gateway↔core están etiquetadas como `HTTP/JSON` (no como llamadas in-process)
