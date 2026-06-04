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

**Providers globales de estado** (montados en `App.tsx`, wrappean toda la app):

- `AuthProvider` — sesión de usuario admin (login / logout / persistencia)
- `ActiveOrgProvider` — organización activa del usuario logueado
- `CampaignsProvider` — lista de campañas filtrada por org activa
- `CollectionsProvider` — colecciones de la org activa

**Guards de acceso:**

- `<ProtectedRoute />` — redirige a `/admin/login` si no hay sesión activa
- `<OrgGuard />` — valida que el usuario tenga org asignada antes de acceder al panel

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

✅ **v2 — Skeleton loading:** Resuelto en ITS-REF02 (sprint 4) — `state-loading` implementado con clase CSS. Sin layout shift.

➡️ **v2 — Badges en cards:** Requiere tabs de sector en el catálogo. Movido a ITS-REF05 (sprint 6, backlog) — las clases CSS ya existen, falta la lógica de filtro y el render del badge en cada tarjeta.

---

### ITS-C03 — Routing con HashRouter | ✅ Betania

`src/App.tsx`:

- `<HashRouter>` para compatibilidad con GitHub Pages / Netlify (sin servidor)
- **Rutas públicas:** `/` → LandingPage, `/catalogo` → HomePage, `/ar/:uid` → ARPage, `/scan` → ScanPage
- **Rutas admin** (bajo `/admin/*`, protegidas por `<ProtectedRoute />`):
  - `/admin/login` → LoginPage
  - `/admin/dashboard` → DashboardPage
  - `/admin/campanas` → CampaignsPage
  - `/admin/campanas/:id/qr` → CampaignQRPage
  - `/admin/colecciones` → CollectionsPage
  - `/admin/metricas` → MetricsPage
- Catch-all redirige a `/`

**Visibilidad del AppHeader:** no se renderiza en `/` (LandingPage tiene su propio header) ni en rutas `/admin/*`.

---

### ITS-C04 — AppHeader | ✅ Betania

`src/components/AppHeader.tsx`:

- Header sticky con backdrop-filter blur
- Logo "**IT**Solutions AR" con acento en `var(--accent)`
- NavLinks: Catálogo + Escanear, con estado activo visual

✅ **v2 — Inline styles:** Resuelto en ITS-REF01 (sprint 4) — AppHeader usa clases BEM, sin inline styles.

---

## Informe técnico

### ITS-001 — Introducción | ✅ Sin cambios

---

### ITS-002 — Alcance | ⏳ Betania

- [ ] Módulo 2: reemplazar descripción del catálogo hardcodeado ECO/EDU/TUR por:
  > _"Catálogo dinámico conectado a Sketchfab API v3, con búsqueda por texto libre, filtro por sector (ecommerce, turismo, educación) y categoría, y paginación con cursor."_
- [ ] Plataformas: agregar TypeScript 5.6, Sketchfab API v3, Figtree Variable; corregir Vite v8 → v6

---

### ITS-003 — Organización | ✅ Ya incluido en el documento

Eduardo Torcello figura en el documento entregado. Sin acción pendiente.

---

### ITS-004 — Reconocimiento / Competidores | ⏳ Betania

- [ ] Eliminar fila "Sketchfab AR" de la tabla de competidores
- [ ] Agregar nota: _"Sketchfab fue considerado inicialmente como competidor. En la arquitectura final es utilizado como proveedor de assets 3D mediante su API v3."_

---

### ITS-005 — Objetivos SMART | ⏳ Betania

- [ ] SMART #2: agregar evidencia de cumplimiento:
  > _"Con Sketchfab, publicar una nueva experiencia requiere solo copiar un UID — no se modifica código ni se reempaqueta nada. El tiempo de publicación es menor a 2 minutos."_

---

### ITS-006 — Stack tecnológico (tabla sección 9) | ⏳ Betania

> **Actualizado para Stage 4:** la tabla del documento debe reflejar la separación en 3 servicios (web + gateway + core) introducida en Sprint 6, no la versión monolítica anterior.

**Tabla final a incluir en la sección 9 del documento APA:**

| Capa                         | Tecnología                              | Versión     | Rol                                                                      |
| ---------------------------- | --------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| **Frontend** (`modelar-web`) | React + TypeScript                      | 19 + 5.6    | UI, routing, contexts, AR viewer y QR scanner                            |
|                              | Vite                                    | 6           | Dev server y build                                                       |
|                              | Figtree Variable                        | —           | Tipografía                                                               |
|                              | `three` + `@google/model-viewer`        | 0.182 + 4.2 | Renderizado 3D y AR (WebXR + fallback iOS QuickLook)                     |
|                              | `@zxing/browser`                        | 0.1         | Escaneo de QR                                                            |
|                              | Vitest + jsdom                          | 4.1         | Tests unitarios                                                          |
| **Gateway** (`modelar-api`)  | Express + TypeScript                    | 4.21 + 5.6  | Proxy HTTP sin estado al core, forward de headers de auth y tracing      |
|                              | helmet, cors, dotenv                    | —           | Hardening básico y configuración por env                                 |
| **Core** (`modelar-core`)    | NestJS + TypeScript                     | 11 + 5.7    | Lógica de negocio, autenticación, rate limiting, exception filter global |
|                              | Sequelize + sequelize-typescript        | 6.37 + 2.1  | ORM con soft delete (paranoid) y migrations                              |
|                              | PostgreSQL                              | 16          | Base de datos                                                            |
|                              | Redis                                   | 7           | Cache de Sketchfab + storage de rate limiter                             |
|                              | `@nestjs/jwt` + `bcryptjs`              | 11 + 2.4    | JWT access/refresh con rotación atómica                                  |
|                              | `class-validator` + `class-transformer` | 0.14 + 0.5  | Validación de DTOs en la capa de presentation                            |
|                              | Jest + ts-jest                          | 30 + 29     | Tests unitarios (112 tests, cobertura 93%/85%/91%/94%)                   |
| **Infraestructura**          | Docker Compose                          | —           | Levanta Postgres (5433) y Redis (6380) en dev                            |
|                              | Sketchfab API v3                        | —           | Catálogo de modelos 3D (10M+ assets sin storage propio)                  |

**Items a corregir en el documento APA:**

- [ ] Catálogo: `Array en tgz` → `Sketchfab API v3 (consumido por modelar-core con cache Redis)`
- [ ] Storage GLB: `public/models/` → `Sketchfab CDN (sin archivos locales)`
- [ ] Stage 2 propuesta catálogo: ~~poly.pizza~~ → descartado, reemplazado por Sketchfab
- [ ] Sacar cualquier referencia a `@mbetania/*` y "librerías locales": no existen. La única dependencia externa de negocio es `modelar-core`
- [ ] Aclarar la separación en 3 capas (no es un monolito): web (Vite) + gateway (Express) + core (NestJS, API externa)
- [ ] Mencionar que `modelar-core` es repo privado del owner; `modelar-api` y `modelar-web` son los públicos

---

### ITS-007 — Figura 1 (Casos de Uso) | ✅ Completo

**Autoría:** Micaela (elaboración del diagrama) · Betania (elaboración del código Mermaid y redacción del documento técnico)

Identifica actores (Usuario Final, Admin Contenido, Admin Técnico, Sistema Analítica) y casos de uso del sistema. El alcance del MVP no cambió — el diagrama sigue siendo válido.

---

### ITS-015 — Wireframes HomePage | ⏳ Eugenia

- [ ] Reemplazar "LINK AL DISEÑO EN FIGMA" con link real
- [ ] Verificar que los wireframes reflejen búsqueda + tabs de sector (sin tarjetas fijas)
