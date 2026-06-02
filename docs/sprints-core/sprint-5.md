# Sprint 5 (core) — Setup + clean architecture + dominio completo

**Repo:** `modelar-core` · **Responsable:** Betania González · **Estado global:** ✅ Implementado

> Sprint que materializa el servicio externo `modelar-core` separándolo del backend in-process que vivía en `modelar-api`. Cubre el setup del proyecto NestJS, la arquitectura limpia en 4 capas y las features de dominio que el frontend consume hoy (auth, campañas, colecciones, analytics, Sketchfab y curated models). Todo el código está vivo en `master` del core.

---

## Código

### ITS-S3-CORE-001 — Setup NestJS + clean architecture (4 capas) | ✅ Betania González

**Estado: ✅ Implementado**

Scaffold del proyecto con NestJS 11 + TypeScript 5.7, organizado en 4 capas:

```
src/
├── domain/            # entidades + ports (interfaces) + enums + DomainError
├── application/       # use cases (puros, dependen solo de domain)
├── infrastructure/    # Sequelize, cache Redis, gateways HTTP, UoW
└── modules/           # presentation: controllers, DTOs, NestJS modules
```

- `domain` no importa nada de NestJS, Sequelize ni Express. Solo enums y errores tipados.
- `application` inyecta ports por `Symbol` (tokens en `domain/shared/repository.tokens.ts`); los use cases no saben qué adapter los implementa.
- `infrastructure` provee los adapters (`*SequelizeRepository`, `SketchfabHttpGateway`, `SequelizeUnitOfWork`).
- `modules` arma cada feature module bindeando puerto → adapter y registrando controller + DTOs.

**Checklist:**

- [x] `nest-cli.json`, `tsconfig.json`, `tsconfig.build.json` configurados
- [x] ESLint + Prettier
- [x] Estructura por capas con `nest-cli` resolviendo imports
- [x] DI tokens centralizados en `domain/shared/repository.tokens.ts`

---

### ITS-S3-CORE-002 — Dominio completo: entidades + ports + enums + errores | ✅ Betania González

**Estado: ✅ Implementado**

Capa de dominio sin dependencias externas:

**Entidades:**

- `ClientEntity`, `RefreshTokenEntity`, `CampaignEntity`, `CollectionEntity`, `AnalyticsEventEntity`, `CuratedModelEntity`

**Ports (interfaces de repositorio):**

- `IClientRepository`, `IRefreshTokenRepository`, `ICampaignRepository`, `ICollectionRepository`, `IAnalyticsEventRepository`, `ICuratedModelRepository`, `ISketchfabGateway`, `IUnitOfWork`

**Enums (en lugar de strings mágicos):**

- `CampaignSector`, `CampaignStatus`, `AnalyticsEventType`, `Role`, `NodeEnv`, `CacheNamespace`, `ConflictType`, `ErrorCode`

**Jerarquía de errores (`DomainError`):**

- `NotFoundError`, `ConflictError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ExternalServiceError`, `RateLimitError` — cada uno con `code: ErrorCode` y `httpStatus: HttpStatus`. El `GlobalExceptionFilter` los traduce a la shape canónica `ErrorResponseBody`.

**Checklist:**

- [x] Cero imports de NestJS / Sequelize en `domain/`
- [x] Tokens tipados con `Symbol`
- [x] `DomainError` extensible con `metadata` para contexto en logs

---

### ITS-S3-CORE-003 — Infraestructura de persistencia: Sequelize + Postgres + UoW | ✅ Betania González

**Estado: ✅ Implementado**

- Sequelize-typescript con `paranoid: true` (soft delete via columna `deleted_at`)
- Naming `underscored: true` (`org_slug`, `created_at`, …)
- Migrations en TypeScript bajo `src/infrastructure/database/migrations/01..06-*.ts`
- `SequelizeUnitOfWork` envuelve transacciones — el `RegisterUseCase` lo usa para crear `Client` + `RefreshToken` en una sola TX atómica
- FKs explícitas en migrations (`collection_id → collections.id`, etc.)
- Cache Redis (`@nestjs/cache-manager` + `cache-manager-redis-yet`) con `CacheNamespace` para aislar claves por `orgSlug`/`clientId`
- Docker Compose levanta `postgres:16-alpine` (5433) y `redis:7-alpine` (6380) sin chocar con instancias locales del host

**Checklist:**

- [x] Migrations corren con `pnpm db:migrate`
- [x] Soft delete verificado por tests
- [x] UoW expuesto via `UNIT_OF_WORK` token

---

### ITS-S3-CORE-004 — Auth: JWT access + refresh con rotación atómica | ✅ Betania González

**Estado: ✅ Implementado**

**Use cases:** `RegisterUseCase`, `LoginUseCase`, `LogoutUseCase`, `RefreshTokenUseCase`, `GetMeUseCase`, `TokenService`.

**Rutas (controller `AuthController`):**

```
POST /api/auth/register   — alta de cliente (público)
POST /api/auth/login      — emite access + refresh
POST /api/auth/refresh    — rota el refresh atomicamente (revokeIfActive)
POST /api/auth/logout     — revoca el refresh
GET  /api/auth/me         — usuario actual (requiere access)
```

- `bcryptjs` para hash de password.
- Access JWT vida 15m, refresh 7d. Secrets via env.
- **Rotación atómica:** `IRefreshTokenRepository.revokeIfActive` ejecuta `UPDATE … WHERE revoked_at IS NULL` para evitar race condition cuando dos refreshes llegan en paralelo.
- `JwtStrategy` + `RefreshStrategy` (Passport) populan `req.user` con `AuthenticatedUser`.
- `GlobalExceptionFilter` mapea `UnauthorizedError` → 401 con shape canónica.

**Tests:** specs unitarios para los 6 use cases + TokenService.

---

### ITS-S3-CORE-005 — Campaigns: CRUD + soft delete + multi-tenant | ✅ Betania González

**Estado: ✅ Implementado**

**Use cases:** `CreateCampaignUseCase`, `UpdateCampaignUseCase`, `SoftDeleteCampaignUseCase`, `GetCampaignUseCase`, `GetPublicCampaignUseCase`, `ListCampaignsUseCase`.

**Rutas (controller `CampaignsController`, todos bajo `JwtAuthGuard` global salvo `/:id/public`):**

```
GET    /api/campaigns                — paginado, filtrado por clientId del JWT
POST   /api/campaigns                — create
GET    /api/campaigns/:id            — detail por id propio
PATCH  /api/campaigns/:id            — update
DELETE /api/campaigns/:id            — soft delete (204)
GET    /api/campaigns/:id/public     — vista pública para el viewer (sin auth)
GET    /api/campaigns/:id/analytics  — métricas agregadas
```

- **Cross-tenant 404 intencional:** `GetCampaignUseCase` devuelve `NotFoundError` si el `clientId` no coincide — no leakea existencia entre tenants.
- **`qrValue` autogenerado:** el use case `CreateCampaign` arma `{FRONTEND_URL}/#/ar/{sketchfabUid}` y lo persiste, así el front no tiene que reconstruir URLs.
- DTOs validados con `class-validator` (`@IsEnum(CampaignSector)`, `@Length`, `@MaxLength`).

**Tests:** specs para los 6 use cases.

---

### ITS-S3-CORE-006 — Collections: CRUD multi-tenant por orgSlug | ✅ Betania González

**Estado: ✅ Implementado**

**Use cases:** `CreateCollectionUseCase`, `UpdateCollectionUseCase`, `SoftDeleteCollectionUseCase`, `GetCollectionUseCase`, `ListCollectionsUseCase`.

**Diferencia con Campaigns:** las colecciones son compartidas por toda la organización (filtran por `orgSlug`, no por `clientId`). El adapter valida pertenencia y throwea `NotFoundError` cross-tenant.

**Tests:** specs para los 5 use cases.

---

### ITS-S3-CORE-007 — Analytics: TrackEvent público + GetAnalytics + BatchBuffer | ✅ Betania González

**Estado: ✅ Implementado**

**Use cases:** `TrackEventUseCase`, `GetCampaignAnalyticsUseCase`, `BatchBufferService`.

**Rutas:**

```
POST /api/events                          — público, rate-limited por IP (Throttler + Redis)
GET  /api/campaigns/:id/analytics         — auth, stats agregadas del cliente
```

- `BatchBufferService` acumula eventos en memoria y hace `bulkCreate` cuando llega a 100 eventos o pasan 5 segundos — reduce I/O bajo carga.
- `POST /events` es público por diseño (lo dispara el AR viewer cuando el visitante final escanea un QR); el rate limiting se aplica por `x-forwarded-for` para no penalizar visitantes detrás de un mismo NAT.

---

### ITS-S3-CORE-008 — Sketchfab gateway + cache Redis + merge con curated | ✅ Betania González

**Estado: ✅ Implementado**

**Use cases:** `SearchModelsUseCase`, `GetModelUseCase`.

**Rutas:**

```
GET /api/sketchfab/models           — search con query params, paginado
GET /api/sketchfab/models/:uid      — detalle de un modelo por UID
```

- `SketchfabHttpGateway` (adapter del puerto `ISketchfabGateway`) llama a la API de Sketchfab v3.
- Cache Redis con TTL configurable (`SKETCHFAB_CACHE_TTL`) — primera consulta golpea Sketchfab, siguientes salen del cache.
- **Merge de curated models:** los resultados del SUPERADMIN (`CuratedModelEntity`) se inyectan al principio de la lista, deduplicados por `Set<sketchfab_uid>`. Permite destacar modelos sin tocar el ranking de Sketchfab.

---

### ITS-S3-CORE-009 — Curated Models: CRUD para SUPERADMIN | ✅ Betania González

**Estado: ✅ Implementado**

**Use cases:** `CreateCuratedModelUseCase`, `UpdateCuratedModelUseCase`, `DeleteCuratedModelUseCase`, `ListCuratedModelsUseCase`.

**Rutas:**

```
GET    /api/curated-models       — listado (auth, no se restringe a SUPERADMIN para lectura)
POST   /api/curated-models       — SUPERADMIN
PATCH  /api/curated-models/:id   — SUPERADMIN
DELETE /api/curated-models/:id   — SUPERADMIN
```

- `RolesGuard` global lee `@Roles(Role.SUPERADMIN)` (no se reaplica con `@UseGuards`).
- Pueden asociarse a un `sector` específico o ser globales (sector `null`).

---

### ITS-S3-CORE-010 — Suite de tests unitarios (Jest) | ✅ Betania González

**Estado: ✅ Implementado** — 25 suites · 100 tests · cobertura 93/85/91/94 al cierre de Sprint 5.

- Factories con `@faker-js/faker` para todas las entidades en `test/factories/*.factory.ts`
- Mock repositories tipados (`jest.Mocked<I…Repository>`) en `test/helpers/mock-repositories.ts`
- Specs por use case siguiendo el patrón AAA
- Thresholds en `jest.config.js`: 80/70/75/80 (statements/branches/functions/lines). Se superan en todos los ejes.

**Pruebas representativas que documentar en el Manual Técnico:**

| Spec                             | Qué prueba                                                 | Resultado esperado                                   |
| -------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `register.use-case.spec.ts`      | Crea client + refresh token en una sola transacción        | Si falla cualquiera de los dos, ambos rollbackean    |
| `refresh-token.use-case.spec.ts` | `revokeIfActive` ejecuta `UPDATE WHERE revoked_at IS NULL` | Refresh paralelo no duplica access tokens            |
| `search-models.use-case.spec.ts` | Inyecta curated models al inicio                           | Deduplicación por UID; orden estable                 |
| `get-campaign.use-case.spec.ts`  | Cross-tenant lookup                                        | `NotFoundError` si `clientId` no matchea             |
| `track-event.use-case.spec.ts`   | Buffer recibe el evento                                    | `bulkCreate` se dispara al llegar a 100 o pasados 5s |

---

## Componentes transversales

### Global Exception Filter

`DomainExceptionFilter` traduce cualquier `DomainError` a `ErrorResponseBody` canónico:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "...",
    "statusCode": 409,
    "timestamp": "...",
    "path": "...",
    "requestId": "...",
    "details": { … }
  }
}
```

El gateway no lo toca — devuelve la respuesta tal cual y el frontend la consume directo.

### Guards globales (orden en `AppModule`)

1. `JwtAuthGuard` — popula `req.user`, cortocircuita si `@Public()`.
2. `RolesGuard` — chequea `req.user.role` contra `@Roles(...)`.
3. `ThrottlerGuard` — rate limit al final, así 401/403 no consumen cupo.

### Interceptors

- `RequestIdInterceptor` — garantiza `x-request-id` en cada request (lo genera si el gateway no lo reenvió).
- `LoggingInterceptor` — loggea con `pino` el método, path, status, duración y `requestId` para trazabilidad cross-service.

---

## Configuración

`.env` mínimo del core:

```bash
NODE_ENV=development
PORT=4000

DB_HOST=localhost
DB_PORT=5433
DB_NAME=modelar_db
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6380

JWT_ACCESS_SECRET=<entropy>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<entropy>
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGINS=http://localhost:3000,http://localhost:5174
FRONTEND_URL=http://localhost:5174

RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

SKETCHFAB_API_KEY=
SKETCHFAB_CACHE_TTL=3600
```

`docker compose up -d postgres redis` antes de arrancar.

---

## Checklist Sprint 5 (core)

- [x] Scaffold NestJS + clean architecture
- [x] 6 entidades + 8 ports + enums + DomainError hierarchy
- [x] Sequelize + migrations + UnitOfWork
- [x] Auth completa (register/login/logout/refresh/me) con rotación atómica
- [x] Campaigns CRUD + qrValue auto + cross-tenant 404
- [x] Collections CRUD multi-tenant por orgSlug
- [x] Analytics (track público + get + BatchBuffer)
- [x] Sketchfab proxy con cache + merge curated
- [x] Curated Models CRUD para SUPERADMIN
- [x] Suite jest: 25/100 al cierre, cobertura por encima de threshold
- [x] Docker Compose con Postgres + Redis en puertos no conflictivos
