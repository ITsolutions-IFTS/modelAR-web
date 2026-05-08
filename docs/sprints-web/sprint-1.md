# Sprint 1 — Setup del proyecto + Fundamentos documentales

**Objetivo de código:** Scaffolding del repo, sistema de diseño, routing.
**Objetivo de informe:** Marco teórico, alcance, organización, objetivos y Figura 1.

---

## Código

### ITS-C01 — Scaffold Vite + React + TypeScript | ✅ Betania

Proyecto creado desde cero en `itsolutions-next/`:

- `package.json` con React 19, TypeScript 5.6, Vite 6, three, @google/model-viewer, @zxing/browser, qrcode.react, react-router-dom 7, @fontsource-variable/figtree
- `tsconfig.app.json` con `strict: true`, paths `@/*` → `src/*`
- `vite.config.ts` con alias `@` → `src/` + allowedHosts para tunnels HTTPS

**Nota de v2:** El `.env` contiene `VITE_SKETCHFAB_API_KEY` directamente. En Stage 3 mover a variables de entorno en el servidor proxy.

---

### ITS-C02 — Sistema de diseño (styles.css + fuente) | ✅ Betania

`src/styles.css` implementa:

- Fuente: `@fontsource-variable/figtree` importada en `main.tsx`
- Tokens CSS:
  - `--font-sans: 'Figtree Variable'`
  - `--bg: #0b0f16`, `--surface: #131820`, `--surface-2: #1a2130`
  - `--accent: #9bf00b`, `--accent-fg: #0b0f16`
  - `--text`, `--text-2`, `--text-3`
  - `--r-xs` a `--r-pill`
  - `--header-h: 58px`
- Clases base: `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`
- Clases de estado: `.state-loading`, `.state-error`, `.state-empty`
- Layout: `.page`, `.container`, `.ar-layout`, `.ar-layout__viewer`, `.ar-layout__panel`
- Componentes: `.model-card`, `.catalog-grid`, `.sector-tabs`, `.sector-tab`, `.search-bar`, `.share-panel`
- Badges: `.sector-badge--ecommerce`, `.sector-badge--turismo`, `.sector-badge--educacion`

🔁 **v2 — Badges en cards:** El badge que se muestra en las tarjetas siempre usa `sector-badge--educacion` (color azul). Corregir para que use el color del sector activo o el sector inferido del modelo.

🔁 **v2 — Skeleton loading:** No hay placeholders mientras carga el grid. Agregar `.model-card--skeleton` con animación de shimmer para la primera carga y la paginación.

---

### ITS-C03 — Routing con HashRouter | ✅ Betania

`src/App.tsx`:
- `<HashRouter>` para compatibilidad con GitHub Pages / Netlify (sin servidor)
- Rutas: `/` → HomePage, `/ar/:uid` → ARPage, `/scan` → ScanPage
- Catch-all redirige a `/`

---

### ITS-C04 — AppHeader | ✅ Betania

`src/components/AppHeader.tsx`:
- Header sticky con backdrop-filter blur
- Logo "**IT**Solutions AR" con acento en `var(--accent)`
- NavLinks: Catálogo + Escanear, con estado activo visual

🔁 **v2 — Inline styles:** El AppHeader usa 100% inline styles. Extraer a clases CSS en `styles.css` (`.app-header`, `.app-header__logo`, `.app-header__nav`, `.app-header__link`, `.app-header__link--active`).

---

## Informe técnico

### ITS-001 — Introducción | ✅ Sin cambios

---

### ITS-002 — Alcance | ⏳ Betania

- [ ] Módulo 2: reemplazar descripción del catálogo hardcodeado ECO/EDU/TUR por:
  > *"Catálogo dinámico conectado a Sketchfab API v3, con búsqueda por texto libre, filtro por sector (ecommerce, turismo, educación) y categoría, y paginación con cursor."*
- [ ] Plataformas: agregar TypeScript 5.6, Sketchfab API v3, Figtree Variable; corregir Vite v8 → v6

---

### ITS-003 — Organización | ✅ Ya incluido en el documento

Eduardo Torcello figura en el documento entregado. Sin acción pendiente.

---

### ITS-004 — Reconocimiento / Competidores | ⏳ Betania

- [ ] Eliminar fila "Sketchfab AR" de la tabla de competidores
- [ ] Agregar nota: *"Sketchfab fue considerado inicialmente como competidor. En la arquitectura final es utilizado como proveedor de assets 3D mediante su API v3."*

---

### ITS-005 — Objetivos SMART | ⏳ Betania

- [ ] SMART #2: agregar evidencia de cumplimiento:
  > *"Con Sketchfab, publicar una nueva experiencia requiere solo copiar un UID — no se modifica código ni se reempaqueta nada. El tiempo de publicación es menor a 2 minutos."*

---

### ITS-006 — Stack tecnológico (tabla sección 9) | ⏳ Betania

- [ ] Catálogo: `Array en tgz` → `Sketchfab API v3 (src/services/sketchfab.ts)`
- [ ] Storage GLB: `public/models/` → `Sketchfab CDN (sin archivos locales)`
- [ ] Stage 2 propuesta catálogo: ~~poly.pizza~~ → descartado, reemplazado por Sketchfab
- [ ] Librerías locales: `@mbetania/*` → `src/lib/ar-viewer/` y `src/lib/qr-scanner/`
- [ ] Tipado: agregar TypeScript 5.6
- [ ] Fuente: agregar Figtree Variable
- [ ] Vite: `v8` → `v6`

---

### ITS-007 — Figura 1 (Casos de Uso) | ✅ Completo

**Autoría:** Micaela (elaboración del diagrama) · Betania (elaboración del código Mermaid y redacción del documento técnico)

Identifica actores (Usuario Final, Admin Contenido, Admin Técnico, Sistema Analítica) y casos de uso del sistema. El alcance del MVP no cambió — el diagrama sigue siendo válido.

---

### ITS-015 — Wireframes HomePage | ⏳ Eugenia

- [ ] Reemplazar "LINK AL DISEÑO EN FIGMA" con link real
- [ ] Verificar que los wireframes reflejen búsqueda + tabs de sector (sin tarjetas fijas)
