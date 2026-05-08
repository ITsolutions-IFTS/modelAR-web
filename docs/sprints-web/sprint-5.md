# Sprint 5 — Admin Panel Setup + Login + Dashboard

**Semana:** 1-2 de Stage 3 (paralelo con Sprint 5 API)  
**Objetivo:** Crear estructura del admin panel, autenticación frontend, dashboard básico  
**Tech:** React 19, TypeScript, React Router v7, Zustand (state management)

---

## Código

### ITS-S3-WEB-001 — Estructura de carpetas admin panel

**Responsable:** Betania

```
src/
├── pages/
│   ├── HomePage.tsx (existente, Stage 2)
│   ├── ARPage.tsx (existente, Stage 2)
│   ├── ScanPage.tsx (existente, Stage 2)
│   ├── admin/
│   │   ├── AdminLayout.tsx (layout general)
│   │   ├── LoginPage.tsx (NUEVO)
│   │   ├── DashboardPage.tsx (NUEVO)
│   │   ├── CampaignFormPage.tsx (NUEVO)
│   │   └── AnalyticsPage.tsx (NUEVO)
│   └── NotFoundPage.tsx
├── components/
│   ├── AppHeader.tsx (existente)
│   ├── admin/
│   │   ├── AdminHeader.tsx (NUEVO)
│   │   ├── CampaignTable.tsx (NUEVO)
│   │   ├── CampaignForm.tsx (NUEVO)
│   │   └── AnalyticsCard.tsx (NUEVO)
│   └── ...
├── services/
│   ├── sketchfab.ts (existente)
│   └── api.ts (NUEVO) ← API calls a backend
├── store/
│   └── authStore.ts (NUEVO) ← Zustand para auth
├── types/
│   ├── sketchfab.ts (existente)
│   └── api.ts (NUEVO) ← Types de respuestas backend
└── App.tsx (actualizar rutas)
```

**Rutas:**
```ts
// App.tsx
const routes = [
  // Público
  { path: '/', element: <HomePage /> },
  { path: '/ar/:uid', element: <ARPage /> },
  { path: '/experience/:campaignId', element: <ARPage /> }, // NEW: campaign public
  { path: '/scan', element: <ScanPage /> },
  
  // Admin (requiere auth)
  { path: '/admin/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'campaigns/new', element: <CampaignFormPage /> },
      { path: 'campaigns/:id/edit', element: <CampaignFormPage /> },
      { path: 'campaigns/:id/analytics', element: <AnalyticsPage /> },
    ],
  },
];
```

**Checklist:**
- [ ] Carpeta admin/ creada
- [ ] Componentes admin inicializados (vacíos)
- [ ] Rutas configuradas
- [ ] Router actualizado

---

### ITS-S3-WEB-002 — Estado de autenticación (Context API)

**Responsable:** Betania

```ts
// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Client {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  client: Client | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restaurar sesión al montar
  useEffect(() => {
    if (token) {
      restoreSession();
    }
  }, []);

  async function login(email: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Login failed');

      const { token: newToken, client: newClient } = await res.json();
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setClient(newClient);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(email: string, password: string, name: string) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) throw new Error('Register failed');

      const { token: newToken, client: newClient } = await res.json();
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setClient(newClient);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function restoreSession() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Session expired');

      const { client: sessionClient } = await res.json();
      setClient(sessionClient);
    } catch (err) {
      setToken(null);
      setClient(null);
      localStorage.removeItem('token');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setClient(null);
  }

  return (
    <AuthContext.Provider value={{ client, token, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
```

**Integración en main.tsx:**
```tsx
// main.tsx
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

**Uso en componentes:**
```tsx
// pages/admin/LoginPage.tsx
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login, isLoading, error } = useAuth();
  // ... componente
}

// components/admin/AdminHeader.tsx
export function AdminHeader() {
  const { client, logout } = useAuth();
  // ... componente
}
```

**Checklist:**
- [ ] AuthContext creado
- [ ] AuthProvider envuelve <App />
- [ ] useAuth hook funciona
- [ ] Token guardado en localStorage
- [ ] restoreSession en useEffect
- [ ] Métodos login, register, logout funcionales
- [ ] Todos los componentes admin usan useAuth()

---

### ITS-S3-WEB-003 — LoginPage

**Responsable:** Betania

```ts
// pages/admin/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      // Error ya está en context
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>ITSolutions AR — Admin</h1>
        
        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            className={`login-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {tab === 'register' && (
            <input
              type="text"
              placeholder="Nombre de empresa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Cargando...' : (tab === 'login' ? 'Login' : 'Registrarse')}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Estilos (agregar a styles.css):**
```css
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg);
}

.login-container {
  background: var(--surface);
  padding: 2rem;
  border-radius: var(--r-lg);
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.login-container h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--accent);
}

.login-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.login-tab {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.login-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--r-sm);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
  background: rgba(159, 240, 11, 0.05);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
}
```

**Checklist:**
- [ ] LoginPage renderiza correctamente
- [ ] Tabs login/register funcionan
- [ ] Form valida email y password
- [ ] Login llama a authStore.login()
- [ ] Registro llama a authStore.register()
- [ ] Error se muestra al usuario
- [ ] Spinner mientras está loading
- [ ] Redirige a /admin/dashboard después de login

---

### ITS-S3-WEB-004 — AdminLayout y AdminHeader

**Responsable:** Sin asignar

```ts
// pages/admin/AdminLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AdminHeader } from '@/components/admin/AdminHeader';

export function AdminLayout() {
  const { client, token } = useAuth();
  const navigate = useNavigate();

  // Proteger ruta
  if (!token || !client) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
```

```ts
// components/admin/AdminHeader.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function AdminHeader() {
  const navigate = useNavigate();
  const { client, logout } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <h1 className="admin-header__title">ITSolutions AR</h1>
        <nav className="admin-nav">
          <button
            className="admin-nav__link"
            onClick={() => navigate('/admin/dashboard')}
          >
            Dashboard
          </button>
          <button
            className="admin-nav__link"
            onClick={() => navigate('/')}
          >
            Ver sitio público
          </button>
        </nav>
      </div>

      <div className="admin-header__right">
        <span className="admin-header__user">{client?.name}</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            logout();
            navigate('/admin/login');
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
```

**Estilos:**
```css
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--surface);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-header__left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.admin-header__title {
  font-size: 1.5rem;
  color: var(--accent);
  margin: 0;
}

.admin-nav {
  display: flex;
  gap: 1rem;
}

.admin-nav__link {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: var(--r-sm);
  transition: all 0.3s;
}

.admin-nav__link:hover {
  background: rgba(159, 240, 11, 0.1);
  color: var(--accent);
}

.admin-header__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-header__user {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
```

**Checklist:**
- [ ] AdminLayout protege rutas (requiere token)
- [ ] AdminHeader renderiza
- [ ] Navbar con enlaces funcionan
- [ ] Logout funciona

---

### ITS-S3-WEB-005 — DashboardPage (versión básica)

**Responsable:** Betania

```ts
// pages/admin/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CampaignTable } from '@/components/admin/CampaignTable';

interface Campaign {
  id: string;
  title: string;
  sector: string;
  views: number;
  ar_activations: number;
  clicks: number;
  created_at: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/campaigns`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, [token]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Mis campañas</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin/campaigns/new')}
        >
          + Nueva campaña
        </button>
      </header>

      {loading && <div className="state-loading">Cargando campañas...</div>}
      {error && <div className="state-error">{error}</div>}
      {!loading && campaigns.length === 0 && (
        <div className="state-empty">
          No tienes campañas aún. ¡Crea una para empezar!
        </div>
      )}

      {!loading && campaigns.length > 0 && (
        <CampaignTable campaigns={campaigns} />
      )}
    </div>
  );
}
```

```ts
// components/admin/CampaignTable.tsx
interface CampaignTableProps {
  campaigns: Campaign[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  return (
    <table className="campaign-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Sector</th>
          <th>Vistas</th>
          <th>AR</th>
          <th>Clicks</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((campaign) => (
          <tr key={campaign.id}>
            <td>{campaign.title}</td>
            <td>
              <span className={`sector-badge sector-badge--${campaign.sector}`}>
                {campaign.sector}
              </span>
            </td>
            <td>{campaign.views}</td>
            <td>{campaign.ar_activations}</td>
            <td>{campaign.clicks}</td>
            <td>
              <button className="btn-icon">✏️</button>
              <button className="btn-icon">👁️</button>
              <button className="btn-icon">🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Estilos:**
```css
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.campaign-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border-radius: var(--r-md);
  overflow: hidden;
}

.campaign-table th {
  padding: 1rem;
  text-align: left;
  background: rgba(0, 0, 0, 0.2);
  font-weight: 600;
  color: var(--accent);
}

.campaign-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.campaign-table tr:hover {
  background: rgba(159, 240, 11, 0.05);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  margin-right: 0.5rem;
}
```

**Checklist:**
- [ ] Dashboard page renderiza
- [ ] GET /campaigns funciona
- [ ] Tabla muestra campañas
- [ ] Botón "+ Nueva campaña" funciona
- [ ] Error handling si falla fetch

---

## Informe / Documentación

### ITS-S3-WEB-DOC-001 — Guía de arquitectura frontend

**Archivo:** `docs/ARQUITECTURA-FRONTEND.md`

```markdown
# Arquitectura Frontend — Stage 3

## Estructura de carpetas

\`\`\`
src/
├── pages/
│   ├── Públicas (Stage 2)
│   │   ├── HomePage
│   │   ├── ARPage
│   │   ├── ScanPage
│   │   └── NotFoundPage
│   └── Admin (Stage 3)
│       ├── LoginPage
│       ├── DashboardPage
│       ├── CampaignFormPage
│       └── AnalyticsPage
├── components/
│   ├── Públicos
│   └── Admin/
│       ├── AdminHeader
│       ├── CampaignTable
│       ├── CampaignForm
│       └── AnalyticsCard
├── store/
│   └── authStore.ts (Zustand)
├── services/
│   ├── sketchfab.ts (existente)
│   └── api.ts (nuevo)
└── types/
    ├── sketchfab.ts (existente)
    └── api.ts (nuevo)
\`\`\`

## State management

Usamos **Zustand** para autenticación (simple y ligero).

\`\`\`ts
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { client, token, login, logout } = useAuthStore();
  // ...
}
\`\`\`

## Rutas protegidas

AdminLayout valida que el usuario tenga token. Si no, redirige a login.

## Variables de entorno

\`\`\`
VITE_API_BASE=http://localhost:5000/api     (dev)
VITE_API_BASE=https://api.itsolutions.com   (prod)
\`\`\`
```

**Checklist:**
- [ ] Documento creado
- [ ] Estructura explicada
- [ ] Ejemplos de uso

---

## Checklist de Sprint 5 Web

### Código
- [ ] Estructura de carpetas creada
- [ ] Rutas configuradas
- [ ] AuthContext creado (Context API + useAuth hook)
- [ ] AuthProvider envuelve <App />
- [ ] LoginPage funcional (login + register)
- [ ] AdminLayout protege rutas
- [ ] AdminHeader navega correctamente
- [ ] DashboardPage carga campañas
- [ ] CampaignTable renderiza datos

### Testing local
- [ ] Ir a /admin/login
- [ ] Registrarse con email + password
- [ ] Login funciona, redirige a /admin/dashboard
- [ ] Token se guarda en localStorage
- [ ] Cerrar navegador, abrir de nuevo → sesión restaurada
- [ ] Logout funciona
- [ ] GET /campaigns trae datos del backend
- [ ] useAuth() hook es accesible desde cualquier componente

### Integración con API
- [ ] VITE_API_BASE apunta a backend corriendo localmente
- [ ] Autorización: Header `Authorization: Bearer {token}`
- [ ] Manejo de errores (401 si token inválido, etc.)

### Documentación
- [ ] README frontend actualizado
- [ ] ARQUITECTURA-FRONTEND.md creado
- [ ] Comentarios en AuthContext explicando el flujo

---
