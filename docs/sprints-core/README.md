# Sprints — `modelar-core`

Tickets que describen la implementación de `modelar-core` (servicio externo en NestJS) consumido por el gateway `modelar-api` y, a través de él, por el frontend `modelar-web`.

**Repositorio:** `git@github.com:Mbetania/modelar-core.git` (privado).

**Responsable único:** Betania González.

**Estado:** todos los tickets de esta carpeta están **✅ Implementados** y vivos en `master` del core. La cobertura corresponde al hash del `Initial commit: modelar-core NestJS service` y a los commits incrementales hechos en Sprint 6 (Organizations).

## Por qué un sprint propio

`modelar-core` arrancó como una refactorización del backend in-process que vivía dentro de `modelar-api` durante sprints 1-5. En Sprint 6 esa refactorización se completó y dio origen a un servicio separado con su propio repo, su propio deploy y su propio modelo de datos. Documentar el trabajo del core acá (en lugar de re-asignarlo a sprints API antiguos) permite:

- mantener el registro histórico de `sprints-api/` intacto (ahí se ve cómo era la primera implementación),
- ver claramente qué decisiones de diseño se tomaron al separar la lógica (clean architecture, ports & adapters, soft delete, paginación canónica, cache Redis),
- y dejar `modelar-api` solo con tickets de gateway/proxy, que es lo que realmente quedó en ese repo.

## Estructura

| Archivo              | Contenido                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`DER.md`](./DER.md) | **Diagrama Entidad-Relación + descripción de tablas y campos.** Fuente de verdad para la sección "Base de Datos" del Manual Técnico |
| `sprint-5.md`        | Setup + clean architecture + Auth + Campaigns + Collections + Analytics + Sketchfab + Curated Models + tests base                   |
| `sprint-6.md`        | Organizations CRUD + hardening con code review iterado + cobertura final                                                            |

## Stack

- **NestJS 11** + TypeScript 5.7
- **Sequelize + sequelize-typescript** con `paranoid: true` (soft delete) y migrations bajo `src/infrastructure/database/migrations`
- **PostgreSQL 16** (puerto 5433 en dev — convención del repo)
- **Redis 7** (puerto 6380) para cache de Sketchfab y rate limiting
- **`@nestjs/jwt` + `bcryptjs`** para JWT access (15m) + refresh (7d) con rotación atómica
- **`class-validator` + `class-transformer`** en la capa de presentation
- **Jest 30 + ts-jest 29** — 30 suites, 112 tests, cobertura 93% / 85% / 91% / 94% (statements / branches / functions / lines)

## Cómo se accede al core desde afuera

Todos los recursos se exponen vía HTTP bajo prefijo `/api`. El gateway `modelar-api` los proxya 1:1 sin transformación de payload.

El frontend NUNCA llama directo al core: siempre pasa por `modelar-api` (que reenvía `Authorization`, `x-request-id`, `x-forwarded-for`, `x-real-ip` y devuelve la respuesta del core tal cual).
