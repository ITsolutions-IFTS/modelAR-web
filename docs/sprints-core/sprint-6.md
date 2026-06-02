# Sprint 6 (core) — Organizations + hardening con code review iterado

**Repo:** `modelar-core` · **Responsable:** Betania González · **Estado global:** ✅ Implementado

> Sprint que cubre la feature de Organizations en el core y el hardening de fixes derivados de un code review interno (dos agentes en paralelo + iteración sobre comentarios). También sube la cobertura final de tests a 30 suites / 112 tests.

---

## Código

### ITS-S3-CORE-011 — Organizations: entity + repo + use cases + controller | ✅ Betania González

**Estado: ✅ Implementado**

`Organization` es el modelo de cliente del SaaS (museo, editorial, retailer, etc.). El `slug` es el identificador estable que el resto del dominio referencia (`clients.org_slug`, `collections.org_slug`, `campaigns.org_slug`); el `id` es solo clave primaria interna.

**Capa de dominio:**

- `OrganizationEntity { id, slug, name, description, sector, createdAt, updatedAt, deletedAt }`
- `IOrganizationRepository` con `findAll(page, filters?)`, `findBySlug`, `findById`, `create`, `update(slug, …)`, `softDelete(slug)`
- `CreateOrganizationData`, `UpdateOrganizationData`
- Token `ORGANIZATION_REPOSITORY: Symbol`

**Capa de aplicación (5 use cases + 12 specs):**

| Use case                        | Comportamiento                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `CreateOrganizationUseCase`     | Genera UUID, normaliza `description` ausente a `null`, propaga `ConflictError` si el `slug` existe |
| `UpdateOrganizationUseCase`     | Build de patch parcial — solo aplica campos definidos (no pisa con `undefined`)                    |
| `GetOrganizationUseCase`        | Throwea `NotFoundError` con metadata `{ slug }` si no existe                                       |
| `ListOrganizationsUseCase`      | Paginado con filtro opcional por sector                                                            |
| `SoftDeleteOrganizationUseCase` | Delegación pura — adapter throwea NotFoundError si el slug no existe                               |

**Capa de infraestructura:**

- `OrganizationModel` con `paranoid: true`, columna `sector` como ENUM
- `OrganizationSequelizeRepository` implementa el puerto; mapea `UniqueConstraintError` → `ConflictError`
- Migration `07-create-organizations.ts` con **UNIQUE PARCIAL** en `slug` (`WHERE deleted_at IS NULL`) — permite reciclar el mismo slug tras un soft delete

**Capa de presentación:**

- `OrganizationsController` bajo prefijo `/api/organizations`
- Lectura (`GET /`, `GET /:slug`) abierta a cualquier usuario autenticado
- Escritura (`POST`, `PATCH /:slug`, `DELETE /:slug`) restringida a `Role.SUPERADMIN` con `@Roles(Role.SUPERADMIN)` (sin reaplicar `@UseGuards` — el `RolesGuard` ya es global)
- DTOs: `CreateOrganizationDto` (slug con `@Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/) @Length(2,50)`, name, description, sector), `UpdateOrganizationDto` (todos opcionales, `description` admite `null` con `@ValidateIf((_o, v) => v !== null)`), `ListOrganizationsQueryDto` (page/limit + sector opcional)

**Checklist:**

- [x] Migration 07 con UNIQUE parcial
- [x] DTOs con `@Matches` para el slug y `@ValidateIf` para `description: null`
- [x] Tests unitarios (12 specs cubriendo happy path + NotFound + ConflictError)
- [x] Wireup en `app.module.ts` y exposición via gateway `modelar-api`

---

### ITS-S3-CORE-012 — Hardening: code review iterado en dos rondas | ✅ Betania González

**Estado: ✅ Implementado**

Una vez completado CORE-011, se lanzaron dos agentes de code review en paralelo (uno enfocado en dominio + persistencia, otro en API + seguridad + tests). Los comentarios se aplicaron en el mismo sprint.

**Findings y fixes aplicados:**

| Severidad | Origen                          | Issue                                                                                                         | Fix                                                                                                                                         |
| --------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Blocker   | Reviewer 1 (domain/persistence) | `slug` UNIQUE no era parcial — un slug soft-deleted bloqueaba reuso para siempre                              | Migration 07 reescrita con `addIndex({ unique: true, where: { deleted_at: null } })`. Modelo limpia el `@Unique` (la constraint vive en DB) |
| Blocker   | Reviewer 2 (API/security)       | `@UseGuards(RolesGuard)` aplicado a nivel handler ejecutaba el guard dos veces (ya es `APP_GUARD` global)     | Removidas las 3 anotaciones `@UseGuards`. Solo `@Roles(Role.SUPERADMIN)` por handler                                                        |
| Major     | Reviewer 2 (API/security)       | `UpdateOrganizationDto.description: string \| null` con `@IsString()` rechazaba `null` en runtime             | Agregado `@ValidateIf((_o, v) => v !== null)` antes de `@IsString()`                                                                        |
| Nit       | Reviewer 2 (tests)              | Spec de `CreateOrganizationUseCase` usaba `new Error('slug duplicado')` para testear propagación de conflicto | Cambiado a `new ConflictError(…)` con `rejects.toBeInstanceOf(ConflictError)`                                                               |

**Verificación post-fix:**

- `pnpm exec tsc -b` → 0 errores
- `pnpm exec jest src/application/organizations` → 12/12 verde
- Smoke test E2E via curl: POST org, PATCH con `description: null` (vuelve 200), DELETE 204, recreación del slug tras delete (verifica la UNIQUE parcial) → ✅

---

### ITS-S3-CORE-013 — Cobertura final + seeds + endpoints documentados | ✅ Betania González

**Estado: ✅ Implementado**

- Cobertura final del core: **30 suites / 112 tests** — 93% statements / 85% branches / 91% functions / 94% lines (todos por encima del threshold 80/70/75/80).
- Seeds: 3 clientes de prueba + 1 superadmin alimentan la DB tras `pnpm db:migrate && pnpm db:seed`:
  - `admin@modelar.test` (Role.SUPERADMIN, orgSlug `modelar-admin`)
  - `gerente@muebleria-pampa.test` (Role.CLIENT)
  - `curador@museo-bernal.test` (Role.CLIENT)
- 4 organizations seed coinciden con esos slugs (`modelar-admin`, `muebleria-pampa`, `museo-bernal`, `demo-org`).
- Endpoint `GET /health` expone uptime y timestamp — el gateway lo consulta para reportar el estado upstream.

**Checklist:**

- [x] Suite jest verde con cobertura por encima de thresholds
- [x] Seeds alineadas con `org_slug` real (no más mismatch con frontend hardcodeado)
- [x] `/health` reportando uptime

---

## Cómo el frontend consume todo este trabajo

Vía `modelar-api` (gateway). El web hace `fetch('/api/...')`, Vite proxya a `:3000`, el gateway reenvía a `${CORE_URL}` (`:4000` en dev) preservando los headers `Authorization`, `x-request-id`, `x-forwarded-for` y `x-real-ip`. La respuesta del core vuelve sin transformaciones.

Endpoints expuestos por el core al cierre de Sprint 6 (suman 24 rutas):

| Recurso        | Endpoints (prefijo `/api`)                            | Auth                                          |
| -------------- | ----------------------------------------------------- | --------------------------------------------- |
| Auth           | `register`, `login`, `refresh`, `logout`, `me`        | Mixto                                         |
| Campaigns      | CRUD por id + `/:id/public` + `/:id/analytics`        | Cliente dueño · `/public` sin auth            |
| Collections    | CRUD por id                                           | Multi-tenant por orgSlug                      |
| Analytics      | `POST /events`, `GET /campaigns/:id/analytics`        | Mixto (events público con rate limit)         |
| Sketchfab      | `GET /sketchfab/models`, `GET /sketchfab/models/:uid` | Auth, cache Redis + merge curated             |
| Curated Models | CRUD por id                                           | SUPERADMIN para writes                        |
| Organizations  | CRUD por slug                                         | Lectura cualquier auth · escritura SUPERADMIN |

---

## Checklist Sprint 6 (core)

- [x] Organizations: entity + repo + use cases + controller + DTOs
- [x] Migration 07 con UNIQUE parcial sobre `slug`
- [x] Code review iterado (dos agentes, dos rondas) con findings aplicados
- [x] Cobertura final 93/85/91/94 con 112 tests
- [x] Seeds coherentes con los `org_slug` que usa el frontend
- [x] 24 rutas expuestas via gateway al cierre del sprint
