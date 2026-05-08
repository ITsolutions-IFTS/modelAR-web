# Documentación — ITSolutions AR

Índice de documentación del proyecto.

---

## Documentación principal

- **[FLUJOS.md](./FLUJOS.md)** — Qué ve cada actor (gerente, usuario final, admin)
  - Casos de uso por sector
  - Funcionalidades disponibles

## Implementación por Stage

### Frontend (React)
- **[sprints-web/README.md](./sprints-web/README.md)** — Sprints 1-6
  - Stage 2 MVP (sprints 1-4)
  - Stage 3 Admin Panel (sprints 5-6)

### Backend (Node.js)
- **[sprints-api/README.md](./sprints-api/README.md)** — Sprints 5-6
  - Stage 3 API REST + Database

---

## Cómo usar esta documentación

1. Lee [FLUJOS.md](./FLUJOS.md) para entender el proyecto
2. Ve a [sprints-web/](./sprints-web/) para frontend
3. Ve a [sprints-api/](./sprints-api/) para backend

---

## Estructura de carpetas

```
docs/
├── README.md (estás aquí)
├── FLUJOS.md
│
├── sprints-web/              ← Frontend React
│   ├── README.md
│   ├── sprint-1.md a sprint-6.md
│   └── ...
│
├── sprints-api/              ← Backend Node.js
│   ├── README.md
│   ├── sprint-5.md a sprint-6.md
│   └── ...
│
├── diagramas/                ← UML (existente)
└── flows/ (futuro)
```

---

## Convenciones

| Símbolo | Significado |
|---|---|
| ✅ | Completado |
| 🔁 | Segunda iteración pendiente (v2) |
| ⏳ | Pendiente de inicio |
| 🔴 | Desactualizado / Bloqueante |
| 🧪 | Requiere testing en dispositivo real |

---

Ver documentación específica en `sprints-web/` y `sprints-api/`.
