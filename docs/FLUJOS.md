# ITSolutions AR — Flujos de usuario por actor

Este documento describe qué ve cada tipo de actor, a qué puede acceder y qué funcionalidades tiene disponibles.

---

## 1. Actor: Gerente de Marketing / Administrador de Campaña

**Ejemplos:** Mueblería XYZ, Museo ABC, Escuela DEF

**Acceso:** `admin.itsolutions.com/dashboard`

**Autenticación:** Email + contraseña (JWT)

### Flujo principal: Crear una campaña

```
1. Login
   ├─ Email: gerente@muebleria.com
   ├─ Password: ***
   └─ JWT token válido por X horas

2. Dashboard
   ├─ Tabla: "Mis campañas"
   │  ├─ Columnas: Título | Sector | Vistas | AR activaciones | Clicks | Acciones
   │  └─ Datos: [ campaña 1, campaña 2, ... ]
   ├─ Botón: "+ Nueva campaña"
   ├─ Estadísticas totales (opcional):
   │  ├─ Vistas totales: 5.230
   │  ├─ AR activaciones: 1.245
   │  └─ Tasa de conversión: 24%
   └─ Botón: "Logout"

3. Crear campaña (form)
   ├─ Campo: Título (ej. "Sillón Windsor - Promo 30%")
   ├─ Campo: Descripción (ej. "Ver en tu living cómo se vería")
   ├─ Select: Sector
   │  ├─ Ecommerce
   │  ├─ Turismo
   │  └─ Educación
   ├─ Búsqueda de modelo Sketchfab:
   │  ├─ Input: "Windsor chair"
   │  ├─ Resultados: [modelo 1, modelo 2, ...]
   │  └─ Preview: Imagen + información del modelo
   ├─ Campo: URL destino / CTA (ej. "muebleria.com/producto/sillon")
   ├─ Auto-generado: QR código (mostrar preview)
   ├─ Auto-generado: Link compartible (copiar al clipboard)
   └─ Botones: [Guardar] [Cancelar]

4. Después de guardar
   ├─ Confirmación: "Campaña creada exitosamente"
   ├─ Descarga: Botón para descargar QR
   ├─ Copia: Botón para copiar link
   ├─ Vuelve a: Dashboard
   └─ Nueva campaña aparece en tabla

5. Ver analytics de una campaña
   ├─ Tabla con eventos:
   │  ├─ Evento | Cantidad | %
   │  ├─ Vista | 1.250 | 100%
   │  ├─ AR activación | 280 | 22%
   │  └─ Click en CTA | 85 | 30% (de AR)
   ├─ Totales:
   │  ├─ Vistas: 1.250
   │  ├─ Duración promedio: 2:45 min
   │  └─ Última actividad: hace 2 horas
   └─ Botón: "Descargar reporte" (opcional, Stage 4)

6. Editar/Eliminar campaña
   ├─ Acciones: [Editar] [Duplicar] [Eliminar]
   ├─ Editar: Abre el mismo form con datos precargados
   ├─ Duplicar: Crea copia de la campaña
   └─ Eliminar: Confirmación + elimina (datos borrados)
```

### Qué ve en el panel

```
┌─────────────────────────────────────────────────────────┐
│  ITSolutions AR — Admin Dashboard                       │
├─────────────────────────────────────────────────────────┤
│  Hola, Gerente (logout)                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Mis estadísticas:                                   │
│     Vistas totales: 5.230      AR: 1.245      CTR: 24%  │
│                                                         │
│  [+ Nueva campaña]                                      │
│                                                         │
│  Mis campañas:                                          │
│  ┌─────────────────────────────────────────────────────┐
│  │Título    │Sector │Vistas│AR  │Clicks│Acciones      │
│  ├─────────────────────────────────────────────────────┤
│  │Sillón    │Ecom   │1.250 │280 │85   │✏️ 👁️ 🗑️        │
│  │Windsor   │       │      │    │     │                │
│  ├─────────────────────────────────────────────────────┤
│  │Museo,    │Turis  │500   │120 │18   │✏️ 👁️ 🗑️        │
│  │Pirámides │mo     │      │    │     │                │
│  ├─────────────────────────────────────────────────────┤
│  │Geometría │Educ   │2.480 │845 │0    │✏️ 👁️ 🗑️        │
│  │3D        │ación  │      │    │     │                │
│  └─────────────────────────────────────────────────────┘
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Acciones disponibles

| Acción | Disponible | Nota |
|---|---|---|
| Crear campaña | ✅ | Requiere auth |
| Ver analytics | ✅ | Tabla simple |
| Editar campaña | ✅ | Puede cambiar todo |
| Duplicar campaña | ✅ | Copia el modelo |
| Eliminar campaña | ✅ | Confirmación requerida |
| Descargar QR | ✅ | PNG o SVG |
| Copiar link | ✅ | Al clipboard |
| Ver reporte PDF | ❌ | Stage 4+ |

---

## 2. Actor: Usuario final (cliente que compra / visita / estudia)

**Ejemplos:** Comprador en muebleria.com, Visitante en museo, Estudiante en clase

**Acceso:** `itsolutions.com/experience/:campaignId` (público, sin login)

**Dispositivo:** Mobile (primario), Desktop (secundario)

### Flujo A: Escanea QR en tienda / catálogo

```
1. Abre cámara del teléfono
   └─ Escanea QR impreso en catálogo o folleto

2. Browser lo redirige a:
   └─ itsolutions.com/experience/ABC123

3. Viewer AR se abre
```

### Flujo B: Hace click en botón "Ver en AR" en web

```
1. Entra a ecommerce en desktop
   └─ Muebleria.com/producto/sillon-windsor

2. Ve sección "Realidad aumentada"
   ├─ QR (si quiere ver en celular)
   └─ Botón: "Ver en AR en este dispositivo" (si es mobile)

3. Click en botón
   └─ Abre itsolutions.com/experience/ABC123
```

### Qué ve en la experiencia AR

```
┌─────────────────────────────────────────────────┐
│         ITSolutions AR Viewer                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │                                         │  │
│  │  [3D Model — Windsor Chair]             │  │
│  │  (Girado, escalado, posicionado en AR)  │  │
│  │                                         │  │
│  │  Toca el modelo para activar AR física  │  │
│  │  Gestos: Pinch (escala), Drag (mover)  │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ─────────────────────────────────────────── │
│  Sillón Windsor - Promoción 30%                │
│  Ver en tu living cómo se vería                │
│  @usuario_sketchfab                            │
│                                                 │
│  [VER EN TIENDA] ← CTA                         │
│  [Compartir]                                    │
│  ─────────────────────────────────────────── │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Funcionalidades disponibles

| Funcionalidad | Disponible | Nota |
|---|---|---|
| Ver modelo 3D | ✅ | Estándar (model-viewer) |
| Activar AR | ✅ | WebXR en Android, QuickLook en iOS |
| Rotar/escalar modelo | ✅ | Gestos multi-touch |
| Ver descripción | ✅ | Panel lateral |
| Click en CTA | ✅ | Vuelve a ecommerce |
| Compartir (copiar link) | ✅ | Clipboard |
| Ver QR | ❌ | No necesita, ya está en AR |
| Login / Métricas | ❌ | No visible para usuario final |

### Qué se registra (tracking sin datos personales)

```
Evento 1: Usuario abre /experience/ABC123
  └─ Registra: campaign_id, timestamp, (user_id anónimo)

Evento 2: Usuario activa AR
  └─ Registra: campaign_id, event_type: 'ar_activation', timestamp

Evento 3: Usuario hace click en CTA
  └─ Registra: campaign_id, event_type: 'cta_click', timestamp

NO se registra:
  ❌ Nombre, email, IP, ubicación
  ❌ Datos personales
  ❌ Cookies de rastreo
```

---

## 3. Actor: Administrador técnico / DevOps

**Acceso:** Console, CI/CD, logs

**Funciones:**
- Deploy de frontend y backend
- Gestión de base de datos (migrations)
- Monitoreo de errores
- Escalado de infraestructura

(No es parte del flujo de usuario principal)

---

## 4. Casos de uso específicos por sector

### Caso A: Ecommerce (Mueblería XYZ)

```
ACTOR 1: Gerente de Marketing (Mueblería)
├─ Va a admin.itsolutions.com
├─ Crea campaña: "Sillón Windsor"
│  ├─ Modelo Sketchfab: "Windsor chair" (uid: ABC123)
│  ├─ Descripción: "Ver en tu living cómo se vería"
│  ├─ CTA: "Ver en tienda" → muebleria.com/producto/sillon-windsor
│  └─ Genera QR
├─ Descarga QR
├─ Lo pega en:
│  ├─ Catálogo impreso
│  ├─ Página de producto (web)
│  └─ Email de promoción
└─ Ve analytics: "1.250 vistas, 280 AR, 85 conversiones"

ACTOR 2: Comprador (Cliente final)
├─ Entra a muebleria.com en teléfono
├─ Busca "Sillón Windsor"
├─ Ve página de producto:
│  ├─ Fotos
│  ├─ Descripción
│  ├─ Precio
│  ├─ Sección: "Ver en realidad aumentada"
│  │  └─ QR o botón "Ver en AR"
│  └─ "Agregar al carrito"
├─ Escanea QR o toca botón
├─ Se abre itsolutions.com/experience/ABC123
├─ Ve sillón en su living (AR)
├─ Click "Ver en tienda"
├─ Vuelve a muebleria.com/producto/sillon-windsor
├─ "Agregar al carrito" → Checkout
└─ Compra

RESULTADO:
  ✅ Comprador vio en AR antes de comprar
  ✅ Menos devoluciones
  ✅ Mueblería ve métrica: "Conversión desde AR: 24%"
```

### Caso B: Turismo (Museo ABC)

```
ACTOR 1: Community Manager (Museo)
├─ Va a admin.itsolutions.com
├─ Crea campaña: "Pirámides - Reconstrucción 3D"
│  ├─ Modelo Sketchfab: "Ancient pyramid" (uid: DEF456)
│  ├─ Descripción: "Mira cómo se veía hace 4000 años"
│  ├─ CTA: "Más información" → museo.com/piramides
│  └─ Genera QR
├─ Imprime QR en cartelería dentro del museo
└─ Ve analytics: "500 vistas, 120 AR, buen engagement"

ACTOR 2: Visitante (Cliente final)
├─ Llega al museo
├─ Ve réplica de pirámide
├─ Ve cartel con QR + texto: "Escanea para ver en AR"
├─ Escanea QR
├─ Ve pirámide reconstruida en AR
├─ Aprende historia interactiva
├─ Click "Más información" → museo.com/piramides
├─ Lee más sobre el artefacto
└─ Comparte en redes: "Increíble la realidad aumentada del museo"

RESULTADO:
  ✅ Experiencia memorable
  ✅ Visitante más engaged
  ✅ Viral potencial (compartir)
  ✅ Museo ve: "Experiencia AR: 500 vistas, alta duración promedio"
```

### Caso C: Educación (Escuela DEF)

```
ACTOR 1: Profesor de Geometría
├─ Va a admin.itsolutions.com
├─ Crea campaña: "Poliedros 3D"
│  ├─ Modelo Sketchfab: "Dodecahedron" (uid: GHI789)
│  ├─ Descripción: "Toca para rotar el poliedro"
│  ├─ CTA: "Ver más" → wikipedia.org/dodecahedron
│  └─ Genera QR
├─ Imprime QR en clase o lo comparte en classroom
└─ Ve analytics: "100% de estudiantes vieron, 95% activó AR"

ACTOR 2: Estudiante
├─ En clase, profesor dice: "Escanea el QR"
├─ Escanea con teléfono
├─ Ve poliedro 3D en AR
├─ Lo rota, lo manipula desde todos los ángulos
├─ Entiende geometría 3D mejor que con dibujos
├─ Comparte con compañero: "Mira, así funciona"
└─ Después, profesor ve que 95% de clase "entendió" (activó AR)

RESULTADO:
  ✅ Mejor comprensión de conceptos abstractos
  ✅ Clase más interactiva y moderna
  ✅ Profesor tiene métrica: "Engagement: 95% AR activation"
  ✅ Estudiantes aprenden más (research: 3x mejor con AR)
```

---

## 5. Comparativa: Qué ve cada actor

| Aspecto | Gerente | Usuario final | Admin técnico |
|---|---|---|---|
| **URL** | admin.itsolutions.com | itsolutions.com/experience/:id | console/logs |
| **Login** | Email + password | (sin login) | (sin acceso web) |
| **Qué ve** | Dashboard + form | Modelo AR | Logs de error |
| **Puede hacer** | CRUD campañas, analytics | Ver AR, click CTA, compartir | Deploy, migrations |
| **Datos accesibles** | Sus campañas | Experiencia pública | Sistema |
| **Aislamiento** | Por cliente (solo sus datos) | Público (cualquiera) | Completo |

---

## 6. Resumen: Funcionalidades por Stage

### Stage 2 (MVP actual)
```
✅ Ver catálogo Sketchfab público
✅ Búsqueda y filtrado por sector
✅ Ver modelo 3D (model-viewer)
✅ Activar AR (WebXR)
✅ Escanear QR (ir a modelo)
✅ Compartir link
❌ Admin panel
❌ Crear campaña propia
❌ Analytics
❌ Autenticación
```

### Stage 3 (Próximo)
```
✅ Admin panel (login + dashboard)
✅ Crear/editar/eliminar campaña
✅ Buscar modelo en Sketchfab desde admin
✅ Generar QR automático
✅ Analytics básicas (vistas, AR, clicks)
✅ Viewer público (/experience/:id)
✅ API REST completa
✅ Base de datos
❌ Plan de suscripción
❌ Pagos
❌ White-label
```

### Stage 4+ (Futuro)
```
❌ Upload de modelos propios
❌ Sistema de pagos
❌ Planes y suscripción
❌ Integración Google Analytics
❌ White-label per client
❌ Webhook con ecommerce externo
```

---
