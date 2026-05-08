# Sprint 6 — Analytics API + Búsqueda Sketchfab en Backend

**Semana:** 3 de Stage 3  
**Objetivo:** Endpoints de analytics y proxy de Sketchfab desde backend  
**Tech:** Node.js + Express

---

## Código

### ITS-S3-API-006 — Endpoints de Analytics

**Responsable:** Sin asignar

**Endpoints:**

```
GET /api/campaigns/:id/analytics
  Auth: Requerida
  Params: campaignId
  Query (opcional): ?since=2024-01-01&until=2024-01-31
  Response: {
    campaign: { id, title, sector },
    stats: {
      views: 1250,
      ar_activations: 280,
      cta_clicks: 85,
      avg_duration_sec: 165
    },
    breakdown: {
      views: { count: 1250, pct: 100 },
      ar_activations: { count: 280, pct: 22.4 },
      cta_clicks: { count: 85, pct: 30.4 }  // 30.4% de AR activations
    },
    timeline: [
      { date: "2024-01-15", views: 50, ar: 12, clicks: 3 },
      ...
    ]
  }
  Validaciones:
    - Campaña pertenece al cliente autenticado
```

```ts
// controllers/analyticsController.ts
export async function getCampaignAnalytics(req, res) {
  const { id: campaignId } = req.params;
  const { since, until } = req.query;

  try {
    // 1. Validar que la campaña pertenece al cliente
    const campaign = await db('campaigns')
      .where('id', campaignId)
      .where('client_id', req.clientId)
      .first();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // 2. Obtener eventos
    let query = db('analytics_events').where('campaign_id', campaignId);

    if (since) query = query.where('timestamp', '>=', new Date(since));
    if (until) query = query.where('timestamp', '<=', new Date(until));

    const events = await query;

    // 3. Calcular estadísticas
    const stats = {
      views: events.length,
      ar_activations: events.filter(e => e.event_type === 'ar_activation').length,
      cta_clicks: events.filter(e => e.event_type === 'cta_click').length,
    };

    const breakdown = {
      views: { 
        count: stats.views, 
        pct: 100 
      },
      ar_activations: { 
        count: stats.ar_activations, 
        pct: stats.views > 0 ? (stats.ar_activations / stats.views * 100).toFixed(1) : 0
      },
      cta_clicks: {
        count: stats.cta_clicks,
        pct: stats.ar_activations > 0 ? (stats.cta_clicks / stats.ar_activations * 100).toFixed(1) : 0
      },
    };

    // 4. Timeline (opcional: agrupar por día)
    const timeline = groupByDate(events);

    res.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        sector: campaign.sector,
      },
      stats,
      breakdown,
      timeline,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function groupByDate(events: any[]) {
  const grouped: Record<string, any> = {};
  
  events.forEach(event => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { views: 0, ar: 0, clicks: 0 };
    }
    if (event.event_type === 'view') grouped[date].views++;
    if (event.event_type === 'ar_activation') grouped[date].ar++;
    if (event.event_type === 'cta_click') grouped[date].clicks++;
  });

  return Object.entries(grouped).map(([date, data]) => ({
    date,
    ...data,
  }));
}
```

**Checklist:**
- [ ] GET /campaigns/:id/analytics funciona
- [ ] Calcula vistas, AR activations, clicks
- [ ] Breakdown en porcentaje
- [ ] Timeline por día (opcional)
- [ ] Validación: solo datos del cliente autenticado

---

### ITS-S3-API-007 — Endpoint para registrar eventos (POST /events)

**Responsable:** Sin asignar

---

## 📊 ¿QUÉ SON LOS EVENTOS?

Los eventos son registros de acciones que hace un usuario final en el viewer de AR. Son **métricas sin datos personales** que permiten al gerente ver cómo se comporta su campaña.

### Ejemplo de vida real

```
USUARIO FINAL SCANNEA QR EN UNA TIENDA
│
├─ 14:30:00 → Abre itsolutions.com/experience/ABC123
│             Genera EVENTO 1: "view" (vio el modelo)
│
├─ 14:30:15 → Toca el modelo para activar AR
│             Genera EVENTO 2: "ar_activation" (activó AR)
│
├─ 14:30:45 → Manipula el modelo 3 min en AR
│             (sin evento, solo interacción interna)
│
└─ 14:34:00 → Toca botón "Ver en tienda"
              Genera EVENTO 3: "cta_click" (hizo conversión)
              → Redirige a muebleria.com/producto/sillon

RESULTADO EN BD:
┌─────────────────────────────────────────┐
│ analytics_events                         │
├─────────────────────────────────────────┤
│ id | campaign_id | event_type | time    │
├─────────────────────────────────────────┤
│ 1  | ABC123      | view       | 14:30:00│
│ 2  | ABC123      | ar_activation| 14:30:15│
│ 3  | ABC123      | cta_click  | 14:34:00│
└─────────────────────────────────────────┘

GERENTE VE EN DASHBOARD:
┌──────────────────────────────────┐
│ Analytics: "Sillón Windsor"      │
├──────────────────────────────────┤
│ Vistas: 1.250                    │
│ AR activaciones: 280 (22%)       │
│ Clicks CTA: 85 (30% de AR)       │
│ Tasa de conversión: 24% (85/1250)│
└──────────────────────────────────┘
```

---

## 💻 IMPLEMENTACIÓN

**Endpoint:**

```
POST /api/events
  Auth: NO requerida (es público, usado desde viewer)
  Body: {
    campaign_id: "uuid",
    event_type: "view" | "ar_activation" | "cta_click"
  }
  Response: { success: true }
```

**Implementación backend:**
```ts
// controllers/eventsController.ts
import { Request, Response } from 'express';
import { AnalyticsEvent, Campaign } from '../models';

export async function trackEvent(req: Request, res: Response) {
  try {
    const { campaign_id, event_type } = req.body;

    // Validación 1: campos requeridos
    if (!campaign_id || !event_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: campaign_id, event_type' 
      });
    }

    // Validación 2: event_type válido
    const validTypes = ['view', 'ar_activation', 'cta_click'];
    if (!validTypes.includes(event_type)) {
      return res.status(400).json({ 
        error: `Invalid event_type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validación 3: campaña existe
    const campaign = await Campaign.findByPk(campaign_id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Crear evento
    const event = await AnalyticsEvent.create({
      campaign_id,
      event_type,
      timestamp: new Date(),
      user_agent: req.headers['user-agent'], // (opcional) para detectar mobile/desktop
    });

    res.json({ 
      success: true,
      event: {
        id: event.id,
        campaign_id: event.campaign_id,
        event_type: event.event_type,
        timestamp: event.timestamp,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
```

```ts
// routes/events.ts
import express from 'express';
import { trackEvent } from '../controllers/eventsController';

const router = express.Router();

// POST /api/events - Registrar evento (público, sin auth)
router.post('/events', trackEvent);

export default router;
```

---

## 📱 CÓMO SE USA DESDE EL FRONTEND

**En la página /experience/:campaignId:**

```tsx
// pages/ARPage.tsx (el viewer público)
import { useEffect } from 'react';

export function ARPage() {
  const { campaignId } = useParams();

  // EVENTO 1: Usuario abrió la página
  useEffect(() => {
    trackEvent(campaignId, 'view');
  }, [campaignId]);

  // EVENTO 2: Usuario activó AR
  function handleARActivation() {
    trackEvent(campaignId, 'ar_activation');
    // ... mostrar modelo en AR
  }

  // EVENTO 3: Usuario hizo click en CTA
  function handleCTAClick(url: string) {
    trackEvent(campaignId, 'cta_click');
    window.location.href = url; // Redirigir a tienda
  }

  return (
    <div>
      {/* Modelo 3D */}
      <div onTouchStart={handleARActivation}>
        {/* ... */}
      </div>
      
      {/* Botón CTA */}
      <button onClick={() => handleCTAClick(ctaUrl)}>
        Ver en tienda
      </button>
    </div>
  );
}

// Función auxiliar para registrar eventos
async function trackEvent(campaignId: string, eventType: 'view' | 'ar_activation' | 'cta_click') {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        event_type: eventType,
      }),
    });

    if (!res.ok) {
      console.error('Failed to track event:', await res.json());
      return;
    }

    console.log(`Event tracked: ${eventType}`);
  } catch (err) {
    console.error('Event tracking failed:', err);
    // Silenciamos el error para no interrumpir la UX
  }
}
```

---

## 📊 CÓMO EL GERENTE VE ESTOS EVENTOS

**En el dashboard admin:**

```tsx
// pages/admin/AnalyticsPage.tsx
export function AnalyticsPage() {
  const { campaignId } = useParams();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Obtener analytics de esta campaña
    fetch(`${API_BASE}/campaigns/${campaignId}/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAnalytics(data));
  }, [campaignId]);

  return (
    <div className="analytics-page">
      <h2>{analytics?.campaign.title}</h2>
      
      <div className="stats">
        <div className="stat">
          <p className="stat__label">Vistas</p>
          <p className="stat__value">{analytics?.stats.views}</p>
        </div>
        
        <div className="stat">
          <p className="stat__label">AR Activaciones</p>
          <p className="stat__value">{analytics?.stats.ar_activations}</p>
          <p className="stat__pct">{analytics?.breakdown.ar_activations.pct}%</p>
        </div>
        
        <div className="stat">
          <p className="stat__label">Conversiones (CTA clicks)</p>
          <p className="stat__value">{analytics?.stats.cta_clicks}</p>
          <p className="stat__pct">{analytics?.breakdown.cta_clicks.pct}%</p>
        </div>
      </div>

      <div className="timeline">
        <h3>Actividad por día</h3>
        {analytics?.timeline.map(day => (
          <div key={day.date}>
            <p>{day.date}: {day.views} vistas, {day.ar} AR, {day.clicks} conversiones</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST DE EVENTOS

**Para que funcione bien:**
- [ ] POST /events sin auth funciona
- [ ] Valida campaign_id existe
- [ ] Valida event_type es válido
- [ ] Inserta en tabla analytics_events
- [ ] Frontend registra 'view' al abrir /experience/:id
- [ ] Frontend registra 'ar_activation' al activar AR
- [ ] Frontend registra 'cta_click' al hacer click en CTA
- [ ] GET /campaigns/:id/analytics agrega correctamente los eventos
- [ ] El gerente ve las métricas en dashboard

**Checklist:**
- [ ] POST /events funciona
- [ ] Registra eventos sin autenticación
- [ ] Valida campaign_id existe
- [ ] Valida event_type válido

---

### ITS-S3-API-008 — Proxy de Sketchfab desde backend

**Responsable:** Betania

**Motivos:**
- Evitar exponer API key de Sketchfab en frontend
- Caching opcional
- Control de rate limiting

**Endpoints:**

```
GET /api/sketchfab/search?keyword=chair&sector=ecommerce&cursor=...
  Auth: NO requerida (para demo pública)
  Response: { results: [...], next: "cursor" }

GET /api/sketchfab/models/:uid
  Auth: NO requerida
  Response: { uid, name, thumbnails, user, license, ... }
```

```ts
// services/sketchfabService.ts
import fetch from 'node-fetch';

const SKETCHFAB_API = 'https://api.sketchfab.com/v3';
const API_KEY = process.env.SKETCHFAB_API_KEY;

export async function searchModels(keyword?: string, categories?: string[], cursor?: string) {
  const params = new URLSearchParams();
  
  if (keyword) params.append('q', keyword);
  if (categories?.length) params.append('categories', categories.join(','));
  if (cursor) params.append('cursor', cursor);
  params.append('count', '24');

  const url = `${SKETCHFAB_API}/models?${params}`;
  
  const res = await fetch(url, {
    headers: { 'Authorization': `Token ${API_KEY}` },
  });

  if (!res.ok) throw new Error(`Sketchfab API error: ${res.status}`);
  
  return res.json();
}

export async function getModel(uid: string) {
  const res = await fetch(`${SKETCHFAB_API}/models/${uid}`, {
    headers: { 'Authorization': `Token ${API_KEY}` },
  });

  if (!res.ok) throw new Error(`Sketchfab API error: ${res.status}`);
  
  return res.json();
}
```

```ts
// routes/sketchfab.ts
router.get('/sketchfab/search', async (req, res) => {
  const { keyword, sector, cursor } = req.query;

  try {
    // Opcional: mapear sector a categorías Sketchfab
    const categories = sector
      ? SECTOR_META[sector as string].categories.map(c => c.slug)
      : undefined;

    const result = await searchModels(
      keyword as string,
      categories,
      cursor as string
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sketchfab/models/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const model = await getModel(uid);
    res.json(model);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
```

**En frontend (actualizar):**
```ts
// services/api.ts (NEW)
const API_BASE = import.meta.env.VITE_API_BASE;

export async function searchSketchfabModels(keyword?: string, sector?: string, cursor?: string) {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (sector) params.append('sector', sector);
  if (cursor) params.append('cursor', cursor);

  const res = await fetch(`${API_BASE}/sketchfab/search?${params}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getSketchfabModel(uid: string) {
  const res = await fetch(`${API_BASE}/sketchfab/models/${uid}`);
  if (!res.ok) throw new Error('Model not found');
  return res.json();
}
```

**Checklist:**
- [ ] GET /sketchfab/search funciona
- [ ] GET /sketchfab/models/:uid funciona
- [ ] API key no está expuesta en frontend
- [ ] Rate limiting considerado (opcional)
- [ ] Frontend consumelibía desde API, no directo a Sketchfab

---

## Informe

### ITS-S3-API-DOC-002 — OpenAPI spec

**Archivo:** `backend/openapi.yaml`

```yaml
openapi: 3.0.0
info:
  title: ITSolutions AR API
  version: 1.0.0
  description: Backend API para plataforma de realidad aumentada

servers:
  - url: http://localhost:5000/api
    description: Development
  - url: https://api.itsolutions.com/api
    description: Production

paths:
  /auth/login:
    post:
      summary: Login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  client:
                    type: object

  /campaigns:
    get:
      summary: List my campaigns
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of campaigns
    post:
      summary: Create campaign
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - title
                - sector
                - sketchfab_uid
                - cta_url
              properties:
                title:
                  type: string
                description:
                  type: string
                sector:
                  type: string
                  enum: ['ecommerce', 'turismo', 'educacion']
                sketchfab_uid:
                  type: string
                cta_url:
                  type: string
      responses:
        '201':
          description: Campaign created

  /campaigns/{id}/analytics:
    get:
      summary: Get campaign analytics
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Analytics data

  /events:
    post:
      summary: Register event (public)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - campaign_id
                - event_type
              properties:
                campaign_id:
                  type: string
                event_type:
                  type: string
                  enum: ['view', 'ar_activation', 'cta_click']
      responses:
        '200':
          description: Event recorded

securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```

**Checklist:**
- [ ] OpenAPI spec creado
- [ ] Todos los endpoints documentados
- [ ] Ejemplos de request/response

---

## Checklist de Sprint 6 API

- [ ] GET /campaigns/:id/analytics funciona
- [ ] Calcula stats y breakdown
- [ ] POST /events funciona (public)
- [ ] GET /sketchfab/search funciona
- [ ] GET /sketchfab/models/:uid funciona
- [ ] API key no expuesta
- [ ] OpenAPI spec actualizada

---
