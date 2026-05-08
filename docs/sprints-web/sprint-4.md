# Sprint 4 — Refactoring v2 + QA + Ensamblado y presentación

**Objetivo de código:** Segunda iteración de UI, testing en dispositivo real.
**Objetivo de informe:** Documento APA final corregido + presentación Canva + entrega.

---

## Código — Segunda iteración (v2)

> Todos estos tickets son mejoras sobre código que ya funciona. Priorizarlos según tiempo disponible.

---

### ITS-REF01 — AppHeader: extraer inline styles a CSS | 🔁 v2 — Betania

`src/components/AppHeader.tsx` usa inline styles para todo.

**Acción:**
- [ ] Agregar en `styles.css`: `.app-header`, `.app-header__logo`, `.app-header__logo-accent`, `.app-header__nav`, `.app-header__link`
- [ ] Manejar estado activo con clase CSS en lugar de función inline de `style`
- [ ] El componente resultante debe tener cero inline styles

---

### ITS-REF02 — HomePage: skeleton grid + badge de sector | 🔁 v2 — Betania

Dos mejoras independientes en `src/pages/HomePage.tsx` y `src/styles.css`.

**Skeleton loading:**
- [ ] Agregar clase `.model-card--skeleton` con animación `@keyframes shimmer` (gradiente que se mueve de izquierda a derecha)
- [ ] Mientras `loading === true`, renderizar 12 tarjetas skeleton en lugar de texto
- [ ] Las tarjetas skeleton deben tener las mismas dimensiones que las tarjetas reales (sin layout shift al cargar)

**Badge de sector:**
- [ ] En el render de cada tarjeta, derivar el sector activo desde el tab actual (`tab !== 'all'`)
- [ ] Mostrar `<span className={`sector-badge sector-badge--${tab}`}>` cuando hay filtro activo
- [ ] Reemplazar la lógica actual que siempre usa `sector-badge--educacion`

---

### ITS-REF03 — ARPage: CSS classes + status labels | 🔁 v2 — Betania

`src/pages/ARPage.tsx` usa inline styles en el panel lateral.

**CSS:**
- [ ] Extraer a `styles.css`: `.ar-panel__title`, `.ar-panel__meta`, `.ar-panel__status`, `.ar-panel__description`
- [ ] `.ar-panel__share` para la sección del QR

**Status labels:**
- [ ] Agregar en `src/lib/ar-viewer/types.ts`:
  ```ts
  export const AR_STATUS_LABELS: Record<ARTrackingStatus, string> = {
    idle:              'Iniciando...',
    initializing:      'Preparando AR...',
    'loading-model':   'Cargando modelo...',
    'model-ready':     'Modelo listo',
    'searching-surface': 'Buscando superficie...',
    'surface-detected':  'Tocá para colocar',
    'model-placed':    'Modelo colocado',
    'session-ended':   'Sesión finalizada',
    error:             'Error en AR',
  }
  ```
- [ ] Usar `AR_STATUS_LABELS[trackingStatus]` en lugar del string crudo

---

### ITS-REF04 — ScanPage: error de permisos de cámara | 🔁 v2 — Betania

`src/pages/ScanPage.tsx` no muestra errores al usuario.

**Acción:**
- [ ] Agregar estado `cameraError: string | null` en `ScanPage`
- [ ] `onError` → setear `cameraError` con mensaje legible
- [ ] Si `cameraError` contiene "Permission" o "NotAllowed", mostrar:
  > "No se pudo acceder a la cámara. Revisá los permisos en la configuración del navegador."
- [ ] En otros casos, mostrar el mensaje del error + botón "Reintentar"

---

### ITS-QA01 — Testing en dispositivo real | 🧪 Betania

AR WebXR requiere HTTPS y dispositivo físico compatible.

**Setup:**
- [ ] Levantar tunnel HTTPS: `npx cloudflared tunnel --url http://localhost:5173` o `npx localtunnel --port 5173`
- [ ] El dominio del tunnel ya está en `vite.config.ts` (`allowedHosts`)

**Casos a probar:**
- [ ] Android Chrome — flujo completo: buscar modelo → ver en 3D → activar AR → colocar en superficie
- [ ] Android Chrome — pinch para escalar el modelo colocado
- [ ] Android Chrome — QR scanner → navegar a ARPage → AR
- [ ] iOS Safari — fallback a `<model-viewer>` con QuickLook (WebXR no disponible en iOS)
- [ ] Dispositivo sin cámara — ScanPage muestra error correcto
- [ ] URL directa `#/ar/<uid>` — carga sin pasar por HomePage

---

### ITS-QA02 — Verificar cleanup de Three.js al navegar | 🧪 Betania

Probar que no haya memory leaks al navegar entre páginas.

- [ ] Abrir ARPage con un modelo → volver a HomePage → abrir ARPage con otro modelo → verificar en DevTools Memory que no quedan contextos WebGL huérfanos
- [ ] Verificar en consola que no aparecen warnings de Three.js sobre texturas o geometrías no dispuestas

---

## Informe técnico

### ITS-021 — Ensamblado final del documento APA | ⏳ Betania

Hacer **después** de que Eduardo, Micaela y Eugenia terminen sus correcciones (Figuras 2, 3, 6, 7, 8 y Figma).

**Checklist de correcciones (Betania):**
- [ ] Módulo 2 — catálogo dinámico Sketchfab (ITS-002)
- [ ] Plataformas: TypeScript 5.6, Vite 6, Sketchfab API, Figtree (ITS-002)
- [ ] Competencia: sacar Sketchfab como competidor (ITS-004)
- [ ] SMART #2: agregar evidencia de cumplimiento (ITS-005)
- [ ] Stack tecnológico tabla (ITS-006)
- [ ] Fase 3: corregir descripción de librerías (ITS-019)
- [ ] Propuesta ejecutiva: "módulos inline" (ITS-020)
- [ ] Figura 2: imagen actualizada (Eduardo — ITS-008)
- [ ] Figura 3: imagen actualizada (Micaela — ITS-009)
- [ ] Figura 6: imagen actualizada (Eduardo — ITS-012)
- [ ] Figura 7: imagen actualizada (Eduardo — ITS-013)
- [ ] Figura 8: pie de figura corregido (Micaela — ITS-014)
- [ ] Wireframes: links de Figma reales (Eugenia — ITS-015, ITS-016)
- [ ] Bibliografía: sacar A-Frame y AR.js, agregar Sketchfab docs
- [ ] CV de Eduardo adjuntado al documento

**Bibliografía final correcta:**
1. Sommerville, I. (2011). *Ingeniería de software* (9.ª ed.). Pearson Educación.
2. Three.js Authors. (2024). *Three.js documentation*. https://threejs.org/docs/
3. Google. (2024). *Model Viewer documentation*. https://modelviewer.dev/docs/
4. Pressman, R. S., & Maxim, B. R. (2021). *Ingeniería del software: un enfoque práctico* (8.ª ed.). McGraw-Hill.
5. W3C. (2023). *WebXR Device API specification*. https://www.w3.org/TR/webxr/
6. Sketchfab. (2024). *Sketchfab API v3 documentation*. https://docs.sketchfab.com/data-api/v3/
7. Vite. (2024). *Vite guide*. https://vitejs.dev/guide/
8. GitHub. (2024). *GitHub Pages documentation*. https://docs.github.com/pages

---

### ITS-022 — Presentación Canva | ⏳ Betania + María

**Colores Canva:** `#0b0f16` fondo · `#9bf00b` acento · `#131820` surface
**Fuente:** Figtree (disponible en Canva)

- [ ] Slide 4 — Demo: captura de `itsolutions-next` con búsqueda Sketchfab activa
- [ ] Slide 5 — Arquitectura: usar Figura 6 actualizada (con `src/lib/` y Sketchfab)
- [ ] Slide 7 — Catálogo: mostrar búsqueda dinámica con tabs de sector
- [ ] Slide 8 — Stack: tabla actualizada (TypeScript 5.6, Sketchfab API v3, Figtree)
- [ ] Slide 10 — Despliegue: Figura 7 actualizada con nodos Sketchfab API + CDN
