# Sprint 6 — CampaignForm + Búsqueda Sketchfab integrada

**Semana:** 3 de Stage 3 (paralelo con Sprint 6 API)  
**Objetivo:** Crear y editar campañas, buscar modelos desde Sketchfab  
**Tech:** React 19, React Hook Form (opcional)

---

## Código

### ITS-S3-WEB-006 — CampaignForm component

**Responsable:** Betania

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
- [ ] CampaignForm renderiza
- [ ] POST /campaigns funciona
- [ ] PATCH /campaigns/:id funciona
- [ ] Validaciones básicas (campos requeridos)
- [ ] Mensajes de error al usuario
- [ ] Redirige a dashboard después de guardar

---

### ITS-S3-WEB-007 — SketchfabModelSelector component

**Responsable:** Sin asignar

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
- [ ] Input de búsqueda funciona
- [ ] Búsqueda con debounce (400ms)
- [ ] Resultados se muestran
- [ ] Seleccionar modelo actualiza el form
- [ ] Modelo seleccionado muestra preview
- [ ] Botón "Cambiar" permite seleccionar otro

---

### ITS-S3-WEB-008 — CampaignFormPage (routing)

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
- [ ] Página se renderiza
- [ ] Rutas `/admin/campaigns/new` y `/admin/campaigns/:id/edit` funcionan

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
- [ ] CampaignForm renderiza
- [ ] POST /campaigns funciona (crear)
- [ ] PATCH /campaigns/:id funciona (editar)
- [ ] SketchfabModelSelector busca modelos
- [ ] Modelo seleccionado muestra preview
- [ ] Validaciones en form
- [ ] Error handling
- [ ] CampaignFormPage routing

### Testing
- [ ] Crear campaña → QR generado
- [ ] Editar campaña → datos cargan
- [ ] Buscar modelo → resultados aparecen
- [ ] Seleccionar modelo → preview muestra
- [ ] Form valida campos requeridos

### Integración API
- [ ] POST /campaigns desde frontend funciona
- [ ] GET /sketchfab/search desde frontend funciona
- [ ] Token se envía en headers

---
