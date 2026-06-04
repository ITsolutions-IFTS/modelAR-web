# Sprint 4 — Refactoring v2 + QA + Ensamblado y presentación

**Objetivo de código:** Segunda iteración de UI, testing en dispositivo real.
**Objetivo de informe:** Documento APA final corregido + presentación Canva + entrega.

---

## Código — Segunda iteración (v2)

> Todos estos tickets son mejoras sobre código que ya funciona. Priorizarlos según tiempo disponible.

---

### ITS-REF01 — AppHeader: extraer inline styles a CSS | ✅ Resuelto — Micaela

**Estado: ✅ Implementado** — verificado 2026-06-03

`AppHeader.tsx` no tiene inline styles. Usa clases BEM: `.app-header`, `.app-header__logo`, `.app-header__logo-accent`, `.app-header__nav`, `.app-header__link`, `.app-header__link--active`. Estado activo manejado con clase CSS.

---

### ITS-REF02 — HomePage: skeleton grid + badge de sector | ✅ Parcial — Eugenia

**Estado: ✅ Skeleton implementado** — verificado 2026-06-03

**Skeleton loading:** ✅ Resuelto — `state-loading` con clase CSS implementado. No hay layout shift.

**Badge de sector:** ➡️ Movido a ITS-REF05 — el catálogo público no tiene tabs de sector todavía; se requiere un ticket separado que incluya filtro + badge.

---

### ITS-REF03 — ARPage: CSS classes + status labels | ✅ Resuelto — Betania

**Estado: ✅ Implementado** — verificado 2026-06-03

`ARPage.tsx` no tiene inline styles. Clases CSS: `.ar-layout`, `.ar-panel`, `.ar-panel__status`, `.ar-panel__status-value`, `.share-panel`. Status labels implementados y usando clases CSS para color.

---

### ITS-REF04 — ScanPage: error de permisos de cámara | ✅ Resuelto — Betania

**Estado: ✅ Implementado** — verificado 2026-06-03

`useQRScanner.ts` captura errores de cámara y setea status `'error'`. `QRScanner.tsx` muestra "No se pudo acceder a la cámara — revisá los permisos" con `STATUS_LABEL` mapeado.

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

### ITS-QA02 — Verificar cleanup de Three.js al navegar | 📦 Backlog — Betania

> **Movido a backlog (2026-06-02):** verificación de performance/memoria, no bloqueante para la entrega final académica. Se retoma post-entrega si aparecen reportes de degradación en uso prolongado.

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

1. Sommerville, I. (2011). _Ingeniería de software_ (9.ª ed.). Pearson Educación.
2. Three.js Authors. (2024). _Three.js documentation_. https://threejs.org/docs/
3. Google. (2024). _Model Viewer documentation_. https://modelviewer.dev/docs/
4. Pressman, R. S., & Maxim, B. R. (2021). _Ingeniería del software: un enfoque práctico_ (8.ª ed.). McGraw-Hill.
5. W3C. (2023). _WebXR Device API specification_. https://www.w3.org/TR/webxr/
6. Sketchfab. (2024). _Sketchfab API v3 documentation_. https://docs.sketchfab.com/data-api/v3/
7. Vite. (2024). _Vite guide_. https://vitejs.dev/guide/
8. GitHub. (2024). _GitHub Pages documentation_. https://docs.github.com/pages

---

### ITS-022 — Presentación Canva | ⏳ Betania + María

**Colores Canva:** `#0b0f16` fondo · `#9bf00b` acento · `#131820` surface
**Fuente:** Figtree (disponible en Canva)

- [ ] Slide 4 — Demo: captura de `itsolutions-next` con búsqueda Sketchfab activa
- [ ] Slide 5 — Arquitectura: usar Figura 6 actualizada (con `src/lib/` y Sketchfab)
- [ ] Slide 7 — Catálogo: mostrar búsqueda dinámica con tabs de sector
- [ ] Slide 8 — Stack: tabla actualizada (TypeScript 5.6, Sketchfab API v3, Figtree)
- [ ] Slide 10 — Despliegue: Figura 7 actualizada con nodos Sketchfab API + CDN
