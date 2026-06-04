# Sprint 6 — CampaignForm + Búsqueda Sketchfab integrada

**Semana:** 3 de Stage 3 (paralelo con Sprint 6 API)  
**Objetivo:** Crear y editar campañas, buscar modelos desde Sketchfab  
**Tech:** React 19, React Hook Form (opcional)

---

## Código

### ITS-S3-WEB-006 — CampaignForm component | ✅ Betania

**Estado: ✅ Implementado** — 2026-05-26

**Responsable:** Betania

> **Nota de implementación:** Implementado en `CampaignFormPage.tsx` (form y lógica unificados en la misma página, sin componente separado). Incluye selector de sector bloqueado por org, selector de colección existente con creación inline, búsqueda de modelos Sketchfab con grid de resultados y vista previa. Soporta modo crear y editar. `ctaUrl` es opcional.

```ts
// components/admin/CampaignForm.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SketchfabModelSelector } from './SketchfabModelSelector';

interface FormData {
  title: string;
  description: string;
  sector: 'ecommerce' | 'turismo' | 'educacion';
  sketchfab_uid: string;
  cta_url: string;
}

export function CampaignForm() {
  const { id } = useParams(); // Para editar
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    sector: 'ecommerce',
    sketchfab_uid: '',
    cta_url: '',
  });

  // Si estamos editando, cargar datos existentes
  useEffect(() => {
    if (!id) return;

    async function fetchCampaign() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/campaigns/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to load');
        const campaign = await res.json();
        setForm({
          title: campaign.title,
          description: campaign.description,
          sector: campaign.sector,
          sketchfab_uid: campaign.sketchfab_uid,
          cta_url: campaign.cta_url,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaign();
  }, [id, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const method = id ? 'PATCH' : 'POST';
      const url = id
        ? `${import.meta.env.VITE_API_BASE}/campaigns/${id}`
        : `${import.meta.env.VITE_API_BASE}/campaigns`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      const saved = await res.json();

      // Mostrar QR (o descargar)
      alert(`¡Campaña ${id ? 'editada' : 'creada'}!\nQR: ${saved.qr_code}`);

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  if (loading) return <div className="state-loading">Cargando...</div>;

  return (
    <div className="campaign-form">
      <h2>{id ? 'Editar' : 'Nueva'} campaña</h2>

      <form onSubmit={handleSubmit} className="form">
        {/* Título */}
        <div className="form-group">
          <label htmlFor="title">Título de la campaña</label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="ej. Sillón Windsor - Promo 30%"
            required
            className="form-input"
          />
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="ej. Ver en tu living cómo se vería"
            rows={4}
            className="form-input"
          />
        </div>

        {/* Sector */}
        <div className="form-group">
          <label htmlFor="sector">Sector</label>
          <select
            id="sector"
            name="sector"
            value={form.sector}
            onChange={handleChange}
            className="form-input"
          >
            <option value="ecommerce">Ecommerce</option>
            <option value="turismo">Turismo</option>
            <option value="educacion">Educación</option>
          </select>
        </div>

        {/* Selector de modelo Sketchfab */}
        <div className="form-group">
          <label>Modelo 3D (Sketchfab)</label>
          <SketchfabModelSelector
            value={form.sketchfab_uid}
            onChange={(uid) => setForm(prev => ({ ...prev, sketchfab_uid: uid }))}
            sector={form.sector}
          />
        </div>

        {/* CTA URL */}
        <div className="form-group">
          <label htmlFor="cta_url">URL de destino (CTA)</label>
          <input
            type="url"
            id="cta_url"
            name="cta_url"
            value={form.cta_url}
            onChange={handleChange}
            placeholder="https://mitienda.com/producto/sillon"
            required
            className="form-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/admin/dashboard')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Guardando...' : (id ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Estilos:**

```css
.campaign-form {
  max-width: 600px;
  margin: 0 auto;
  background: var(--surface);
  padding: 2rem;
  border-radius: var(--r-lg);
}

.campaign-form h2 {
  margin-bottom: 2rem;
  color: var(--accent);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--r-sm);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: inherit;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
  background: rgba(159, 240, 11, 0.05);
}

.form-input textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: var(--r-sm);
}
```

**Checklist:**

- [x] CampaignFormPage renderiza en modo crear y editar
- [x] POST /api/campaigns funciona (desde `addCampaign` en CampaignsContext)
- [x] PATCH /api/campaigns/:id funciona (desde `updateCampaign`)
- [x] Validaciones: título, descripción, sector y modelo obligatorios
- [x] Error de submit mostrado al usuario
- [x] Redirige a `/admin/campanas/:id/qr` tras crear, a listado tras editar
- [x] Sector fijo por org (badge bloqueado); selector libre si org no tiene sector
- [x] Colección opcional: selector existentes + crear nueva inline

---

### ITS-S3-WEB-007 — SketchfabModelSelector component | ✅ Betania

**Estado: ✅ Implementado** — 2026-05-26

**Responsable:** Betania

> **Nota de implementación:** Integrado directamente en `CampaignFormPage` (no es un componente separado). Input de búsqueda con botón explícito (no debounce), grid de 12 resultados con thumbnails, checkmark visual en el seleccionado, vista previa lateral con nombre, autor, licencia y botón de copiar UID.

```ts
// components/admin/SketchfabModelSelector.tsx
import { useState, useRef, useCallback } from 'react';
import { searchSketchfabModels, getSketchfabModel } from '@/services/api';

interface Model {
  uid: string;
  name: string;
  thumbnails: { images: { size: number; url: string }[] }[];
  user: { username: string };
  license: string;
}

interface Props {
  value: string; // UID seleccionado
  onChange: (uid: string) => void;
  sector: string;
}

export function SketchfabModelSelector({ value, onChange, sector }: Props) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Buscar modelos
  const handleSearch = useCallback(async (search: string) => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchSketchfabModels(search, sector);
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [sector]);

  // Debounce search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 400);
  };

  // Seleccionar modelo
  const handleSelectModel = (model: Model) => {
    setSelectedModel(model);
    onChange(model.uid);
    setResults([]);
    setKeyword('');
  };

  // Get best thumbnail
  const getBestThumbnail = (model: Model) => {
    if (!model.thumbnails || model.thumbnails.length === 0) return null;
    const images = model.thumbnails[0].images || [];
    const largest = images.sort((a, b) => b.size - a.size)[0];
    return largest?.url;
  };

  return (
    <div className="sketchfab-selector">
      {/* Input de búsqueda */}
      <input
        type="text"
        placeholder="Buscar modelo (ej. 'silla', 'pirámide')"
        value={keyword}
        onChange={handleInputChange}
        className="form-input"
      />

      {/* Modelo seleccionado */}
      {selectedModel && (
        <div className="selected-model">
          <img src={getBestThumbnail(selectedModel)} alt={selectedModel.name} />
          <div className="selected-model__info">
            <h4>{selectedModel.name}</h4>
            <p>@{selectedModel.user.username}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedModel(null);
                onChange('');
              }}
              className="btn btn-ghost btn-sm"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {results.length > 0 && !selectedModel && (
        <div className="search-results">
          {results.map((model) => (
            <button
              key={model.uid}
              type="button"
              className="model-result"
              onClick={() => handleSelectModel(model)}
            >
              <img src={getBestThumbnail(model) || '📦'} alt={model.name} />
              <div className="model-result__info">
                <p className="model-result__name">{model.name}</p>
                <p className="model-result__user">@{model.user.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && <div className="state-loading">Buscando modelos...</div>}
      {error && <div className="state-error">{error}</div>}
      {!loading && keyword && results.length === 0 && !selectedModel && (
        <div className="state-empty">No se encontraron resultados</div>
      )}
    </div>
  );
}
```

**Estilos:**

```css
.sketchfab-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selected-model {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--accent);
  border-radius: var(--r-md);
  background: rgba(159, 240, 11, 0.05);
}

.selected-model img {
  width: 80px;
  height: 80px;
  border-radius: var(--r-sm);
  object-fit: cover;
}

.selected-model__info {
  flex: 1;
}

.selected-model__info h4 {
  margin: 0;
  color: var(--accent);
}

.selected-model__info p {
  margin: 0.25rem 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--r-sm);
}

.model-result {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border: none;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.model-result:hover {
  background: rgba(159, 240, 11, 0.1);
}

.model-result img {
  width: 60px;
  height: 60px;
  border-radius: var(--r-sm);
  object-fit: cover;
}

.model-result__info {
  flex: 1;
}

.model-result__name {
  margin: 0;
  font-weight: 500;
  color: white;
}

.model-result__user {
  margin: 0.25rem 0 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}
```

**Checklist:**

- [x] Input de búsqueda con botón "Buscar" funciona
- [x] Resultados se muestran en grid (hasta 12 modelos)
- [x] Seleccionar modelo actualiza el formulario (uid)
- [x] Modelo seleccionado muestra preview con thumbnail, autor y licencia
- [x] Buscar de nuevo reemplaza la selección
- [x] Error de búsqueda mostrado al usuario

---

### ITS-S3-WEB-008 — CampaignFormPage (routing) | ✅ Betania

**Estado: ✅ Implementado** — 2026-05-26

**Responsable:** Betania

```ts
// pages/admin/CampaignFormPage.tsx
import { CampaignForm } from '@/components/admin/CampaignForm';

export function CampaignFormPage() {
  return (
    <div className="page">
      <CampaignForm />
    </div>
  );
}
```

**Checklist:**

- [x] Página se renderiza
- [x] Ruta `/admin/campanas/nueva` funciona (crear)
- [x] Ruta `/admin/campanas/:id/editar` funciona (editar, pre-carga datos via `location.state`)
- [x] Ruta `/admin/campanas/:id/qr` muestra QR generado con `qrValue` de la API

---

### ITS-S3-WEB-011 — Fix del contrato con modelar-core (auth + paginación + errores) | ✅ Betania

**Estado: ✅ Implementado** — 2026-06-01

**Responsable:** Betania

Una vez integrado el frontend contra `modelar-api` (gateway) y `modelar-core` (servicio externo de lógica de negocio), aparecieron discrepancias entre lo que el frontend asumía y lo que el core devuelve. Se corrigieron en `src/services/api.ts`, `src/admin/context/AuthContext.tsx`, `CampaignsContext.tsx` y `CollectionsContext.tsx`.

**Bugs detectados y corregidos:**

| #   | Síntoma                                                                | Causa                                                                                                | Fix                                                                    |
| --- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Login "exitoso" pero 401 en todas las llamadas siguientes              | `LoginResponse = { token, client }` pero la API retorna `{ accessToken, refreshToken, client }`      | Tipo actualizado; `AuthContext` guarda `accessToken` y `refreshToken`  |
| 2   | `apiMe()` rompía silenciosamente al volver a la app                    | Esperaba `{ client }` pero la API devuelve `AdminUser` directo                                       | Tipo cambiado a `AdminUser`                                            |
| 3   | `setCampaigns is not a function`-like errors                           | `apiGetCampaigns/Collections` declaraban `T[]` pero el core devuelve `{ data, pagination }`          | Tipo `PaginatedResponse<T>` introducido; contexts destructuran `.data` |
| 4   | Errores mostrados como `[object Object]`                               | `apiFetch` parseaba `body.error` como string, pero es objeto `{ code, message: string \| string[] }` | Parser `extractErrorMessage` que soporta ambas formas                  |
| 5   | `DELETE` rompía con `Unexpected end of JSON input`                     | `apiFetch` siempre intentaba `res.json()`, fallaba en `204 No Content`                               | Branch para `204` que devuelve `undefined`                             |
| 6   | Login con password mala desencadenaba "Sesión expirada" + logout falso | `apiFetch` despachaba `UNAUTHORIZED_EVENT` ante cualquier 401, incluso login sin token previo        | Solo dispara el evento si había token en sessionStorage                |
| 7   | `apiLogout` retornaba 400                                              | No enviaba el `refreshToken` que el core requiere                                                    | Firma cambiada a `apiLogout(refreshToken)`                             |

**Tests actualizados en `src/test/api.test.ts`:** ahora cubren 401-con-token vs 401-sin-token, error con `message: string`, error con `message: string[]`, error con `error: string` (fallback). 23/23 verdes.

**Checklist:**

- [x] `LoginResponse` refleja la forma real de `POST /api/auth/login`
- [x] `apiFetch` maneja 204 sin parsear body
- [x] Errores formato `{ error: { code, message } }` parsean correctamente
- [x] 401 sin token previo NO dispara logout
- [x] `apiLogout` envía `refreshToken` desde sessionStorage
- [x] `tsc -b` sin errores (incluye agregar `@types/node` para `vite.config.ts`)
- [x] Suite de tests pasa (23/23)

---

### ITS-S3-WEB-012 — ConfirmDialog modal accesible (reemplaza `window.confirm`) | ✅ Betania

**Estado: ✅ Implementado** — 2026-06-01

**Responsable:** Betania

El requisito de la consigna pide "Solicitar confirmación antes de realizar eliminaciones". El uso actual de `window.confirm()` en `CampaignsPage` no es estilable ni accesible, y en `CollectionsPage` la eliminación se hacía **sin ninguna confirmación**. Se construyó un componente modal reutilizable con API promise-based.

**Componente:** `src/components/ConfirmDialog/ConfirmDialog.tsx`

- `ConfirmProvider` se monta en `App.tsx` envolviendo el árbol.
- Hook `useConfirm()` devuelve una función `(opts) => Promise<boolean>`.
- Modal con: focus inicial en el botón confirmar, Escape cierra como cancel, click en backdrop cierra como cancel, `aria-modal` + `role="dialog"`.
- Dos variantes: `danger` (rojo) y `neutral` (azul).

**Uso típico:**

```tsx
const confirm = useConfirm();

const ok = await confirm({
  title: 'Eliminar campaña',
  message: `Vas a eliminar "${campaign.title}". Esta acción no se puede deshacer.`,
  confirmLabel: 'Eliminar',
  variant: 'danger',
});
if (ok) await deleteCampaign(campaign.id);
```

**Aplicado en:**

- `CampaignsPage` — reemplazó `window.confirm(...)`
- `CollectionsPage` — agregó confirmación (antes borraba directo). El mensaje detecta si la colección tiene campañas asociadas y advierte que quedarán huérfanas.

**Checklist:**

- [x] `ConfirmProvider` montado en `App.tsx`
- [x] Hook `useConfirm()` con tipos exportados
- [x] Soporta tecla Escape y click en backdrop
- [x] Focus inicial en botón confirmar
- [x] Reemplazado `window.confirm` en CampaignsPage
- [x] Agregada confirmación en CollectionsPage (con detección de campañas asociadas)

---

### ITS-S3-WEB-013 — Integración con endpoint de Organizations (eliminar hardcodeo) | ✅ Betania

**Estado: ✅ Implementado** — 2026-06-01

**Responsable:** Betania

Hasta este sprint las organizaciones vivían en `src/admin/constants/orgs.ts` con 4 entradas hardcodeadas (santillana, vega, garbarino, museo-mar), inconsistentes con los `org_slug` reales de la base (`modelar-admin`, `muebleria-pampa`, `museo-bernal`, `demo-org`). El core ahora expone CRUD de Organizations vía `/api/organizations` (servicio externo, ver sección **modelar-core**), así que el frontend lo consume.

**Cambios:**

- **`src/admin/types.ts`** — agregado `Organization { id, slug, name, description: string | null, sector }`.
- **`src/admin/constants/sectorUi.ts`** — nuevo mapping `Record<Sector, { color, collectionLabel, collectionLabelPlural, ctaLabel }>`. Estos campos son **decisiones de UI**, no parte del dominio; se derivan del `sector` que sí viene del API.
- **`src/admin/context/OrganizationsContext.tsx`** — nuevo context que carga via `apiGetOrganizations()` al montar (cuando hay user) y expone `organizations`, `loading`, `error`, `refetch`, `addOrganization`.
- **`src/admin/hooks/useOrgResources.ts`** — reescrito: ahora combina `Organization` (API) + `SectorUi` (mapping) → `EnrichedOrg` que conserva la misma forma que el viejo `Org`.
- **`src/admin/pages/OrganizationsPage.tsx`** — consume el context; agregado form `NewOrgForm` (slug kebab-case validado client-side, name, description, sector) visible para superadmin con botón **"Nueva organización"** en el header.
- **`src/admin/components/AdminLayout.tsx`** — `OrgSearch` y `CollectionsSidebar` migrados a `useOrganizations()`.
- **`src/admin/pages/OrganizationsPage.css`** — clases color por sector (`.org-ecommerce`, `.org-museo`, …) en lugar de por slug.
- **Eliminado:** `src/admin/constants/orgs.ts`.

**API client agregado a `src/services/api.ts`:**

```ts
apiGetOrganizations()           // GET    — paginado
apiGetOrganization(slug)        // GET    — by slug
apiCreateOrganization(data)     // POST   — SUPERADMIN
apiUpdateOrganization(slug, …)  // PATCH  — SUPERADMIN
apiDeleteOrganization(slug)     // DELETE — SUPERADMIN
```

**Bug colateral resuelto en este ticket:** en `CollectionsPage` aparecían **dos botones "Nueva categoría"** cuando la lista estaba vacía + usuario superadmin. Se eliminó el botón duplicado del bloque empty-state; queda solo el del header.

**Checklist:**

- [x] `Organization` agregado a `types.ts`
- [x] `SECTOR_UI` mapping creado y aplicado en consumidores
- [x] `OrganizationsContext` carga al login
- [x] Form de creación visible solo para superadmin
- [x] `constants/orgs.ts` eliminado
- [x] CSS por sector en lugar de por slug
- [x] Botón duplicado en CollectionsPage eliminado
- [x] `tsc -b` sin errores; 23/23 tests pasan

---

### ITS-S3-WEB-010 — Suite de tests unitarios (vitest) | ✅ Betania

**Estado: ✅ Implementado** — 2026-05-26

**Responsable:** Betania

Configuración de vitest con jsdom. 20 tests en 4 archivos:

| Archivo                      | Tests | Qué cubre                                                                            |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------ |
| `parseScanToModelId.test.ts` | 7     | Extracción de UID desde hash route, path, query param, ID directo, strings inválidos |
| `campaignStats.test.ts`      | 3     | Suma de métricas, campos undefined como 0, lista vacía                               |
| `storage.test.ts`            | 5     | `safeGetJson`/`safeSetJson` con FakeStorage                                          |
| `api.test.ts`                | 5     | Token storage, 401 auto-logout event, error body, header Authorization               |

**Checklist:**

- [x] vitest + @testing-library/react + jsdom instalados
- [x] `vite.config.ts` con `test.environment: 'jsdom'` y setupFiles
- [x] Script `pnpm test` configurado
- [x] 20/20 tests pasan

---

## Informe

### ITS-S3-WEB-DOC-002 — Guía de uso del admin panel

**Archivo:** `docs/GUIA-ADMIN.md`

```markdown
# Guía de uso — Admin Panel ITSolutions AR

## Crear una campaña

### Paso 1: Ir a dashboard

1. Login en admin.itsolutions.com
2. Click en "+ Nueva campaña"

### Paso 2: Completar formulario

- **Título:** Nombre descriptivo (ej. "Sillón Windsor - Promo 30%")
- **Descripción:** Texto corto que ve el usuario final (ej. "Ver en tu living...")
- **Sector:** Elegir entre Ecommerce, Turismo, Educación
- **Modelo 3D:** Buscar en Sketchfab por palabra clave
- **URL destino:** Link a tu tienda/página (ej. muebleria.com/producto/sillon)

### Paso 3: Guardar

Click en "Crear" o "Actualizar"

Sistema genera automáticamente:

- QR único
- Link compartible: itsolutions.com/experience/ABC123

### Paso 4: Usar el QR

- Descargá el QR
- Ponelo en tu catálogo (impreso o digital)
- Clientes finales lo escanean para ver en AR

## Ver analytics

1. Dashboard → tabla de campañas
2. Click en ojo (👁️) para ver detalles
3. Ves:
   - Vistas totales
   - Activaciones AR
   - Clicks en CTA
   - Tasa de conversión

## Editar campaña

1. Dashboard → tabla
2. Click en lápiz (✏️)
3. Cambiar datos que quieras
4. Guardar

## Eliminar campaña

1. Dashboard → tabla
2. Click en basura (🗑️)
3. Confirmar
4. Datos borrados (incluye analytics)
```

**Checklist:**

- [ ] Guía creada
- [ ] Pasos claros
- [ ] Screenshots útiles (opcional)

---

## Checklist de Sprint 6 Web

### Código

- [x] CampaignFormPage renderiza (crear y editar)
- [x] POST /api/campaigns funciona
- [x] PATCH /api/campaigns/:id funciona
- [x] Búsqueda Sketchfab integrada con grid de resultados
- [x] Modelo seleccionado muestra preview con autor y licencia
- [x] Validaciones en form (título, sector, modelo obligatorios)
- [x] Error handling en submit y búsqueda
- [x] Routing correcto para crear/editar/qr
- [x] Tests unitarios (20 tests, vitest)

### Testing

- [x] Crear campaña → QR generado (URL correcta `/#/ar/{uid}`)
- [x] Editar campaña → datos pre-cargados
- [x] Buscar modelo → resultados aparecen
- [x] Seleccionar modelo → preview muestra
- [x] Form valida campos requeridos

### Integración API

- [x] POST /api/campaigns desde frontend funciona
- [x] GET /api/sketchfab/search desde frontend funciona (via proxy)
- [x] Token se envía en headers (Bearer JWT)
- [x] Contrato real con `modelar-core` corregido (WEB-011): paginación, 204, error shapes
- [x] CRUD de Organizations consumido desde la API (WEB-013), sin hardcodeo en frontend
- [x] `accessToken` y `refreshToken` persistidos en sessionStorage

### UX

- [x] `ConfirmDialog` reemplaza `window.confirm` (WEB-012)
- [x] Eliminación de Collections pide confirmación (advierte sobre campañas asociadas)
- [x] Eliminación de Campaigns pide confirmación con el título

---

### ITS-REF05 — HomePage: filtro por sector + badge | ⏳ Backlog

**Derivado de:** ITS-REF02 (badge de sector nunca implementado en catálogo público)

**Contexto:**
El campo `sector` ya existe en `CampaignEntity` (core) y en el tipo `Campaign` del web. El contexto `CampaignsContext` trae los sectores en cada campaña. Los estilos `.sector-badge` y `.sector-badge--{sector}` ya existen en `styles.css`.

**Lo que falta:**

En `src/pages/HomePage.tsx`:

- [ ] Derivar los sectores únicos desde `campaigns`: `[...new Set(campaigns.map(c => c.sector))]`
- [ ] Agregar estado `tab: 'all' | CampaignSector` (default `'all'`)
- [ ] Renderizar tabs de filtro encima del grid: uno por sector presente + "Todos"
- [ ] Filtrar `uids` por sector antes de llamar a Sketchfab (o filtrar `filtered` por sector si ya los tiene cargados)
- [ ] En cada tarjeta, cuando `tab !== 'all'`, mostrar `<span className={`sector-badge sector-badge--${tab}`}>{tab}</span>`

**Sectores disponibles** (`CampaignSector` en core):
`ecommerce` · `turismo` · `educacion` · `inmobiliario` · `museo`

**Archivos a tocar:**

- `src/pages/HomePage.tsx`
- `src/styles.css` (solo si falta algún sector en las clases existentes)

---

### ITS-REF07 — Toast de feedback post-acción | ⏳ Backlog

**Contexto:**
Al crear, editar o eliminar campañas y colecciones no hay feedback visual más allá del cambio en la lista. El enunciado pide mensajes claros al usuario tras cada operación. Un sistema de toast liviano cubre esto sin librerías externas.

**Lo que falta:**

`src/components/Toast/Toast.tsx` — nuevo componente:

- [ ] `ToastProvider` con contexto y `useToast()` hook que expone `showToast(message, variant)`
- [ ] `variant`: `'success' | 'error'`
- [ ] El toast se auto-descarta a los 3 segundos
- [ ] Máximo un toast visible a la vez (el nuevo reemplaza al anterior)
- [ ] Posición: esquina inferior derecha

`src/components/Toast/Toast.css`:

- [ ] Animación de entrada (slide-up) y salida (fade-out)
- [ ] Variante success: acento verde (`--color-accent`)
- [ ] Variante error: rojo

`src/App.tsx`:

- [ ] Envolver la app con `<ToastProvider>`

**Dónde llamar a `showToast`:**

| Acción                    | Mensaje                          |
| ------------------------- | -------------------------------- |
| Campaña creada            | "Campaña creada correctamente"   |
| Campaña actualizada       | "Campaña actualizada"            |
| Campaña eliminada         | "Campaña eliminada"              |
| Colección creada          | "Colección creada correctamente" |
| Colección actualizada     | "Colección actualizada"          |
| Colección eliminada       | "Colección eliminada"            |
| Error en cualquier acción | mensaje del error recibido       |

**Archivos a tocar:**

- `src/components/Toast/Toast.tsx` (nuevo)
- `src/components/Toast/Toast.css` (nuevo)
- `src/components/Toast/index.ts` (nuevo)
- `src/App.tsx`
- `src/admin/pages/CampaignsPage.tsx`
- `src/admin/pages/CollectionsPage.tsx`
- `src/admin/pages/CampaignFormPage.tsx`

---

### ITS-REF06 — HomePage: skeleton grid animado | ⏳ Backlog

**Derivado de:** ITS-REF02 (skeleton pendiente — actualmente solo muestra texto "Cargando modelos...")

**Contexto:**
`HomePage.tsx` tiene `loading === true` mientras se resuelven los `Promise.all` de Sketchfab. Hoy muestra `<div className="state-loading">Cargando modelos...</div>`. El objetivo es reemplazarlo por tarjetas skeleton con animación shimmer que mantengan el mismo layout que las tarjetas reales (sin layout shift al cargar).

**Lo que falta:**

En `src/styles.css`:

- [ ] Agregar `@keyframes shimmer` con gradiente animado de izquierda a derecha:
  ```css
  @keyframes shimmer {
    from {
      background-position: -200% 0;
    }
    to {
      background-position: 200% 0;
    }
  }
  ```
- [ ] Agregar `.model-card--skeleton` que use el keyframe:
  ```css
  .model-card--skeleton .model-card__thumb,
  .model-card--skeleton .model-card__name,
  .model-card--skeleton .model-card__meta {
    background: linear-gradient(
      90deg,
      var(--color-surface) 25%,
      var(--color-border) 50%,
      var(--color-surface) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 4px;
    color: transparent;
  }
  ```

En `src/pages/HomePage.tsx`:

- [ ] Mientras `loading === true`, renderizar 6 tarjetas skeleton en lugar de `state-loading`:
  ```tsx
  {
    loading &&
      Array.from({ length: 6 }).map((_, i) => (
        <article key={i} className="model-card model-card--skeleton">
          <div className="model-card__thumb" />
          <div className="model-card__body">
            <p className="model-card__name">...</p>
            <p className="model-card__meta">...</p>
          </div>
        </article>
      ));
  }
  ```
- [ ] Eliminar el `{loading && <div className="state-loading">...}` actual

**Archivos a tocar:**

- `src/pages/HomePage.tsx`
- `src/styles.css`

---

### ITS-REF08 — Submit button: estado loading en formularios | ⏳ Backlog

**Contexto:**
`CampaignFormPage.tsx` no deshabilita el botón de submit mientras se procesa la request. El usuario puede hacer doble click y generar requests duplicadas, y no hay feedback de que algo está pasando.

**Lo que falta:**

En `src/admin/pages/CampaignFormPage.tsx`:

- [ ] Agregar estado `submitting: boolean` (default `false`)
- [ ] Al iniciar el submit: `setSubmitting(true)`, al finalizar (finally): `setSubmitting(false)`
- [ ] El botón de submit debe tener `disabled={submitting}` y mostrar `"Guardando..."` mientras `submitting === true`

**Archivos a tocar:**

- `src/admin/pages/CampaignFormPage.tsx`

---

### ITS-REF09 — MetricsPage: animación de entrada en barras | ⏳ Backlog

**Contexto:**
`DynamicBar` aplica el ancho vía CSS custom property `--bar-width` pero no tiene transición — las barras aparecen en su valor final instantáneamente. Una animación de entrada mejora la percepción de la página en la presentación.

**Lo que falta:**

En `MetricsPage.css` (o donde se definen `.mtr-top-bar`, `.mtr-subject-bar`, `.mtr-funnel-bar`):

- [ ] Agregar `transition: width 0.6s ease-out` (o `height` para barras verticales) a todas las clases que usen `DynamicBar`
- [ ] Verificar que el valor inicial sea `width: 0%` para que la transición arranque desde cero al montar

**Archivos a tocar:**

- `src/admin/pages/MetricsPage.css`

---

### ITS-REF10 — MetricsPage: count-up animado en KPIs | ⏳ Backlog

**Contexto:**
Los números grandes de vistas, activaciones AR, clicks al CTA y tasa AR aparecen estáticos al cargar. Un count-up desde 0 hasta el valor final al montar la página le da vida a la sección de métricas.

**Lo que falta:**

`src/admin/hooks/useCountUp.ts` — nuevo hook:

- [ ] `useCountUp(target: number, duration = 800): number` — retorna el valor animado actual
- [ ] Usa `requestAnimationFrame` internamente, sin dependencias externas
- [ ] Si `target === 0`, retorna 0 directamente sin animar

En `src/admin/pages/MetricsPage.tsx`:

- [ ] Crear un sub-componente `KpiValue({ value, formatter })` que use `useCountUp(value)` internamente
- [ ] Reemplazar los cuatro `{formatNumber(totals.x)}` de `.mtr-kpi-value` por `<KpiValue>`
- [ ] La tasa AR (`toFixed(1)%`) también anima, formateando el número durante la animación

**Archivos a tocar:**

- `src/admin/hooks/useCountUp.ts` (nuevo)
- `src/admin/pages/MetricsPage.tsx`

---
