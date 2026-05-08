# Sprint 5 — Auth + Base de datos + Arquitectura API

**Semana:** 1-2 de Stage 3  
**Objetivo:** Sentar la base técnica — autenticación JWT, schema de DB, primeros endpoints de CRUD  
**Tech:** Node.js + Express, PostgreSQL, JWT, Bcrypt

---

## Código

### ITS-S3-API-001 — Setup del proyecto Node + Express + Sequelize

**Responsable:** Betania

```
Crear: /backend (en raíz del repo)
├── package.json
├── .env.example
├── .gitignore
├── src/
│   ├── index.ts (entry point)
│   ├── config/
│   │   ├── database.ts (setup Sequelize)
│   │   └── env.ts (variables de entorno)
│   ├── middleware/
│   │   ├── auth.ts (verificar JWT)
│   │   └── errorHandler.ts (manejo de errores global)
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── campaigns.ts
│   │   └── analytics.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── campaignsController.ts
│   │   └── analyticsController.ts
│   ├── models/
│   │   ├── Client.ts (Sequelize model)
│   │   ├── Campaign.ts (Sequelize model)
│   │   └── AnalyticsEvent.ts (Sequelize model)
│   └── types/
│       └── index.ts
├── migrations/
│   ├── 20260508-create-client.ts
│   ├── 20260508-create-campaign.ts
│   └── 20260508-create-analytics-event.ts
├── seeders/ (opcional)
│   └── 20260508-demo-data.ts
├── tests/ (opcional para Stage 3)
└── Dockerfile (deployment)
```

**Dependencies:**
```json
{
  "express": "^4.21.0",
  "sequelize": "^6.35.0",
  "sequelize-cli": "^6.6.0",
  "typescript": "^5.6.0",
  "pg": "^8.11.0",
  "pg-hstore": "^2.3.4",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.1.2",
  "dotenv": "^16.4.5",
  "cors": "^2.8.5",
  "helmet": "^7.1.0"
}
```

**Setup Sequelize:**
```bash
npm install
npm install -D sequelize-cli

# Inicializar Sequelize
npx sequelize-cli init

# Esto genera:
# - config/config.json
# - models/index.ts
# - migrations/
# - seeders/
```

**Dev dependencies:**
```json
{
  "@types/express": "^4.17.20",
  "@types/node": "^20.10.5",
  "ts-node": "^10.9.2",
  "nodemon": "^3.0.2"
}
```

**Checklist:**
- [ ] Carpeta backend creada con estructura inicial
- [ ] package.json con dependencias
- [ ] .env.example con variables necesarias
- [ ] Script `dev`: nodemon para desarrollo
- [ ] Script `build`: tsc para TypeScript
- [ ] TypeScript config (tsconfig.json)
- [ ] Git ignorar node_modules, .env

---

### ITS-S3-API-002 — Conexión a PostgreSQL + Sequelize Models

**Responsable:** Betania

**Decisión:** Usar Sequelize (ORM, más fácil de aprender que Knex)

**Configuración inicial:**
```ts
// src/config/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'itsolutions_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Cambiar a console.log en dev si quieres ver SQL
  }
);

export default sequelize;
```

**Model 1 — Client:**
```ts
// src/models/Client.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

class Client extends Model {
  declare id: string;
  declare email: string;
  declare password_hash: string;
  declare name: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Método para validar password
  validPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password_hash);
  }
}

Client.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Client',
    tableName: 'clients',
    timestamps: true,
  }
);

export default Client;
```

**Model 2 — Campaign:**
```ts
// src/models/Campaign.ts
import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import Client from './Client';

class Campaign extends Model {
  declare id: string;
  declare client_id: ForeignKey<Client['id']>;
  declare title: string;
  declare description: string;
  declare sector: 'ecommerce' | 'turismo' | 'educacion';
  declare sketchfab_uid: string;
  declare cta_url: string;
  declare qr_code: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clients', key: 'id' },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    sector: {
      type: DataTypes.ENUM('ecommerce', 'turismo', 'educacion'),
      allowNull: false,
    },
    sketchfab_uid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cta_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isUrl: true },
    },
    qr_code: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'Campaign',
    tableName: 'campaigns',
    timestamps: true,
  }
);

// Relación
Campaign.belongsTo(Client, { foreignKey: 'client_id' });
Client.hasMany(Campaign, { foreignKey: 'client_id' });

export default Campaign;
```

**Model 3 — AnalyticsEvent:**
```ts
// src/models/AnalyticsEvent.ts
import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import Campaign from './Campaign';

class AnalyticsEvent extends Model {
  declare id: string;
  declare campaign_id: ForeignKey<Campaign['id']>;
  declare event_type: 'view' | 'ar_activation' | 'cta_click';
  declare timestamp: Date;
  declare user_agent?: string;
}

AnalyticsEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'campaigns', key: 'id' },
      onDelete: 'CASCADE',
    },
    event_type: {
      type: DataTypes.ENUM('view', 'ar_activation', 'cta_click'),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    user_agent: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'AnalyticsEvent',
    tableName: 'analytics_events',
    timestamps: false, // Los eventos no tienen updatedAt
  }
);

// Relación
AnalyticsEvent.belongsTo(Campaign, { foreignKey: 'campaign_id' });
Campaign.hasMany(AnalyticsEvent, { foreignKey: 'campaign_id' });

export default AnalyticsEvent;
```

**Checklist:**
- [ ] PostgreSQL corriendo localmente
- [ ] .env con credenciales DB
- [ ] Sequelize instalado
- [ ] 3 models creados (Client, Campaign, AnalyticsEvent)
- [ ] `npm run db:sync` o migrations ejecutadas
- [ ] Tablas creadas en DB
- [ ] Relaciones definidas

---

### ITS-S3-API-003 — Autenticación JWT

**Responsable:** Betania

**Endpoints:**
```
POST /api/auth/register
  Body: { email, password, name }
  Response: { token, client: { id, email, name } }
  Validaciones:
    - Email válido
    - Password mínimo 8 caracteres
    - Email único

POST /api/auth/login
  Body: { email, password }
  Response: { token, client: { id, email, name } }
  Validaciones:
    - Email existe
    - Password coincide

POST /api/auth/logout
  Body: {}
  Response: { success: true }
  Nota: En frontend, solo borra el token

GET /api/auth/me
  Header: Authorization: Bearer {token}
  Response: { client: { id, email, name } }
  Nota: Verifica que el token es válido
```

**Middleware de auth:**
```ts
// middleware/auth.ts
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.clientId = payload.clientId; // Inyectar en req para usar después
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

**Seguridad:**
- [ ] Passwords hasheados con bcrypt (10 rounds)
- [ ] JWT token con expiry (ej. 24 horas)
- [ ] Refresh token opcional (Stage 4)
- [ ] HTTPS en producción (obligatorio)
- [ ] Helmet para headers de seguridad
- [ ] CORS configurado (solo itsolutions.com)

**Checklist:**
- [ ] POST /auth/register funciona
- [ ] POST /auth/login funciona
- [ ] JWT generado y verificado
- [ ] Middleware auth protege endpoints privados
- [ ] POST /auth/logout (solo limpia frontend)
- [ ] GET /auth/me devuelve cliente autenticado
- [ ] Errores manejan casos edge (email ya existe, etc)

---

### ITS-S3-API-004 — Endpoints CRUD de Campaigns (sin lógica de Sketchfab)

**Responsable:** Sin asignar

**Endpoints:**
```
GET /api/campaigns
  Auth: Requerida
  Response: [ { id, title, sector, sketchfab_uid, qr_code, created_at } ]
  Nota: Solo campañas del cliente autenticado
  
POST /api/campaigns
  Auth: Requerida
  Body: { title, description, sector, sketchfab_uid, cta_url }
  Response: { id, title, ... }
  Validaciones:
    - title no vacío
    - sector es válido
    - sketchfab_uid no vacío
    - cta_url es URL válida
    
GET /api/campaigns/:id
  Auth: Requerida
  Response: { id, title, description, sector, sketchfab_uid, cta_url, qr_code, created_at }
  Validaciones:
    - La campaña pertenece al cliente autenticado
    
PATCH /api/campaigns/:id
  Auth: Requerida
  Body: { title?, description?, sector?, cta_url? }
  Response: { id, title, ... (actualizado) }
  Validaciones:
    - Pertenece al cliente
    - Campos válidos

DELETE /api/campaigns/:id
  Auth: Requerida
  Response: { success: true }
  Nota: Elimina cascada (analytics_events también se borran)
  Validaciones:
    - Pertenece al cliente
```

**Estructura de controller (ejemplo):**
```ts
// controllers/campaignsController.ts
export async function getCampaigns(req, res) {
  try {
    const campaigns = await db('campaigns')
      .where('client_id', req.clientId)
      .orderBy('created_at', 'desc');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

**Checklist:**
- [ ] GET /campaigns devuelve solo mis campañas
- [ ] POST /campaigns crea nueva
- [ ] GET /campaigns/:id valida pertenencia
- [ ] PATCH /campaigns/:id edita
- [ ] DELETE /campaigns/:id elimina
- [ ] Error handling: 401 si no auth, 403 si no es mi campaña, 400 si dato inválido

---

### ITS-S3-API-005 — Generación de QR automático

**Responsable:** Sin asignar

**Librería:** `qrcode` npm

```ts
import QRCode from 'qrcode';

export async function generateQRCode(campaignId: string) {
  const link = `https://itsolutions.com/experience/${campaignId}`;
  const qrDataURL = await QRCode.toDataURL(link);
  return qrDataURL; // Base64 PNG
}
```

**Integración en POST /campaigns:**
```ts
export async function createCampaign(req, res) {
  const { title, description, sector, sketchfab_uid, cta_url } = req.body;
  
  // 1. Validar datos
  if (!title || !sector) return res.status(400).json({ error: 'Invalid data' });
  
  // 2. Insertar en DB
  const [campaign] = await db('campaigns')
    .insert({
      client_id: req.clientId,
      title,
      description,
      sector,
      sketchfab_uid,
      cta_url,
    })
    .returning('*');
  
  // 3. Generar QR
  const qrCode = await generateQRCode(campaign.id);
  
  // 4. Actualizar campaign con QR
  await db('campaigns').where('id', campaign.id).update({ qr_code: qrCode });
  
  res.json({ ...campaign, qr_code: qrCode });
}
```

**Checklist:**
- [ ] Librería qrcode instalada
- [ ] QR generado automáticamente al crear campaña
- [ ] QR apunta a: itsolutions.com/experience/{id}
- [ ] QR puede descargarse (endpoint para descargar imagen)
- [ ] QR funciona al escanear (test manual)

---

## Informe / Documentación

### ITS-S3-DOC-001 — README backend

**Archivo:** `backend/README.md`

```markdown
# ITSolutions AR — Backend API

## Setup

### Requisitos
- Node.js 18+
- PostgreSQL 12+
- npm 9+

### Instalación
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Editar .env con credenciales DB
npm run migrate:latest
npm run dev
\`\`\`

### Variables de entorno
\`\`\`
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tupassword
DB_NAME=itsolutions_dev
JWT_SECRET=tu_jwt_secret_aleatorio
NODE_ENV=development
\`\`\`

## Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Campaigns
- GET /api/campaigns (auth requerida)
- POST /api/campaigns (auth requerida)
- GET /api/campaigns/:id (auth requerida)
- PATCH /api/campaigns/:id (auth requerida)
- DELETE /api/campaigns/:id (auth requerida)

### Analytics (Sprint 6)
- GET /api/campaigns/:id/analytics
- POST /api/events

## Desarrollo

\`\`\`bash
npm run dev          # Inicia servidor con hot-reload
npm run migrate:latest  # Ejecuta migrations
npm run build        # Compila TypeScript
\`\`\`
```

**Checklist:**
- [ ] README creado y completo
- [ ] Instrucciones de setup claras
- [ ] Variables de entorno documentadas
- [ ] Endpoints listados

---

## Checklist de Sprint 5

### Código
- [ ] Proyecto Node + Express configurado
- [ ] PostgreSQL conectado
- [ ] 3 tablas creadas (clients, campaigns, analytics_events)
- [ ] Auth funciona (register, login, JWT)
- [ ] CRUD campaigns funciona
- [ ] QR generado automáticamente
- [ ] Error handling en todos los endpoints
- [ ] CORS configurado
- [ ] Helmet headers

### Testing local
- [ ] Registrar cliente: POST /auth/register
- [ ] Login: POST /auth/login
- [ ] Crear campaña: POST /campaigns (con token)
- [ ] Listar mis campañas: GET /campaigns
- [ ] Editar campaña: PATCH /campaigns/:id
- [ ] Eliminar campaña: DELETE /campaigns/:id
- [ ] Verificar QR generado
- [ ] Verificar datos en DB

### Documentación
- [ ] README backend
- [ ] .env.example completado
- [ ] Comentarios en código clave

### Deploy (opcional, puede ser Sprint 8)
- [ ] Dockerfile creado
- [ ] Testear en Railway/Render
- [ ] Variables de entorno en producción

---
