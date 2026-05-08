# Sprints Backend — ITSolutions AR

Documentación de sprints de backend (Node.js + Express + PostgreSQL) para Stage 3.

---

## Índice de Sprints

### Stage 3 — API REST (Próximo)

| Sprint | Semana | Objetivo | Tech |
|---|---|---|---|
| [Sprint 5](./sprint-5.md) | 1-2 | Setup + Auth + CRUD campaigns | Node.js + Express + PostgreSQL |
| [Sprint 6](./sprint-6.md) | 3 | Analytics + Sketchfab proxy | OpenAPI spec |
| Sprint 7 | 4 | Testing + Documentación | Postman / Manual |
| Sprint 8 | 5 | Deploy + Monitoring | Railway / Render |

---

## Arquitectura

```
Backend (Node.js + Express)
├── /api/auth → JWT tokens
├── /api/campaigns → CRUD + QR generation
├── /api/analytics → eventos de usuarios finales
└── /api/sketchfab → proxy a Sketchfab API

Database (PostgreSQL)
├── Clients (Sequelize model)
├── Campaigns (Sequelize model)
└── AnalyticsEvents (Sequelize model)

Frontend (React) → consume backend
```

---

## Stack Stage 3

```json
{
  "dependencies": {
    "express": "^4.21.0",
    "sequelize": "^6.35.0",
    "typescript": "^5.6.0",
    "pg": "^8.11.0",
    "pg-hstore": "^2.3.4",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "qrcode": "^1.5.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "sequelize-cli": "^6.6.0"
  }
}
```

---

## Setup local rápido

### 1. Clonar repo y entrar a backend
```bash
cd backend
npm install
cp .env.example .env
```

### 2. Configurar .env
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tucontraseña
DB_NAME=itsolutions_dev
JWT_SECRET=tu_jwt_secret_aleatorio_aqui
SKETCHFAB_API_KEY=tu_api_key_sketchfab
NODE_ENV=development
PORT=5000
```

### 3. Setup base de datos
```bash
# Crear DB (una sola vez)
createdb itsolutions_dev

# Ejecutar migrations Sequelize
npx sequelize-cli db:migrate

# (Opcional) Seed con datos de prueba
npx sequelize-cli db:seed:all
```

### 4. Correr servidor
```bash
npm run dev
```

Server corre en `http://localhost:5000`

---

## Cómo leer un sprint

Cada sprint tiene:

```
# Sprint X — Nombre

## Código
### ITS-S3-API-NNN — Descripción
- Qué archivo/carpeta crear
- Qué funcionalidad implementar
- Qué validaciones

## Informe / Documentación
### ITS-S3-API-DOC-NNN — Documentación a crear
- OpenAPI spec
- README
- .env.example

## Checklist de Sprint X
- [ ] Código: qué debe estar implementado
- [ ] Testing: cómo verificar
- [ ] Documentación: qué documentar
```

---

## Convenciones

| Ícono | Significado |
|---|---|
| ✅ | Completado |
| ⏳ | Pendiente de inicio |
| 🔴 | Bloqueante |
| 🧪 | Requiere testing |

---

## FAQ

### ¿Por qué PostgreSQL?
- Robusto y escalable
- Row-level security (RLS) para multi-tenant
- JSON nativo para metadatos
- Gratis en desarrollo

### ¿Por qué Knex para migrations?
- Más simple que Prisma para este alcance
- Control fino sobre la DB
- Migrations versionadas en git

### ¿JWT tiene refresh token?
No en Stage 3. Token válido 24hs. Stage 4+ si necesario.

### ¿Los QR se guardan en DB?
Sí, como Base64 o URL. El cliente puede descargar/copiar.

### ¿Qué pasa si un cliente intenta ver otras campañas?
API retorna 403 Forbidden. Validación en cada endpoint.

### ¿Cuándo se ponen límites de rate?
Stage 4+. Por ahora, acceso ilimitado para testing.

---

## Documentación

- **OpenAPI spec:** `backend/openapi.yaml`
- **README:** `backend/README.md`
- **Guía de env vars:** `.env.example`
- **Migrations:** `backend/migrations/`

---

## Deploy (Stage 3 final)

Se puede deployar a:
- **Railway** (5 min setup, recomendado)
- **Render** (similar a Railway)
- **Heroku** (free tier limitado)
- **Docker + VPS** (máximo control)

Credenciales DB y secrets en variables de entorno (nunca en código).

---

**Ver [../README.md](../README.md) para documentación general del proyecto.**
