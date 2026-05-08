# Stage 3 — Lo que vamos a hacer

Este documento explica de forma clara qué se construirá en Stage 3 y por qué.

---

## El cambio de Stage 2 a Stage 3

### Stage 2 (MVP actual)
El MVP es un catálogo **público** donde cualquiera puede:
- Ver modelos 3D de Sketchfab
- Filtrar por sector (ecommerce, turismo, educación)
- Ver en realidad aumentada (AR)
- Escanear QR

**Acceso:** Solo lectura. No hay login. No hay edición.

### Stage 3 (Próximo)
Agregamos un **panel de administración** donde los clientes (tiendas, museos, escuelas) pueden:
- Crear su propia cuenta
- Armar sus propias "campañas" (experiencias AR)
- Configurar qué modelo, textos, botón de acción
- Generar un QR único para compartir
- Ver métricas de cuánta gente las usó

**Acceso:** Cada cliente ve solo sus datos. Datos privados y seguros.

---

## El flujo completo (Stage 3)

### Para la tienda de muebles

```
1. La tienda entra a admin.itsolutions.com
2. Se registra con email + contraseña
3. Click: "Nueva campaña"
4. Llena el form:
   - Nombre: "Sillón Windsor - Promo 30%"
   - Descripción: "Ver en tu living cómo se vería"
   - Elige modelo de Sketchfab
   - Pone link a su tienda
5. Sistema genera automáticamente un QR
6. Descarga el QR
7. Lo pone en su catálogo, emails, redes
8. Espera...
9. Clientes finales escanean el QR
10. Ven el sillón en AR
11. Hacen click en "Ver en tienda"
12. Compran con confianza porque ya lo vieron en AR
13. La tienda ve en dashboard: "500 vistas, 80 AR activaciones, 12 compras"
```

### Para el usuario final

```
1. Cliente va a tienda (física o web)
2. Ve QR que dice "Ver en AR"
3. Escanea con su teléfono
4. Se abre ITSolutions AR
5. Ve el producto en 3D
6. Lo pone en realidad aumentada (en su living)
7. Lo rota, lo mira desde todos los ángulos
8. Click: "Ver en tienda"
9. Vuelve a la tienda y compra
```

---

## Qué se construye en Stage 3

### Panel de administración (lo nuevo)
- **Página de login:** Email + contraseña
- **Dashboard:** Tabla con mis campañas (cuáles creé, cuántas vistas tienen)
- **Formulario para crear campaña:**
  - Nombre y descripción
  - Buscar modelo en Sketchfab
  - URL a dónde manda el botón "Ver en tienda"
- **Generador de QR:** Automático, descargable
- **Analytics:** Tabla simple con vistas, AR activaciones, conversiones

### API del backend (lo nuevo)
Sistema donde el frontend envía datos:
- Login/registro de usuarios
- Guardar campañas en base de datos
- Guardar eventos (usuario vio, activó AR, hizo click)
- Mostrar métricas al gerente

### Base de datos (lo nuevo)
Tablas para guardar:
- Usuarios (clientes que se registran)
- Campañas (las que crean)
- Eventos (las acciones de usuarios finales)

---

## Qué NO se hace en Stage 3

Esto lo dejamos para después:
- ❌ Los clientes suben sus propios modelos 3D
- ❌ Sistema de pagos y planes
- ❌ White-label (tu marca en el panel)
- ❌ Integración con Google Analytics avanzada

**Por qué no?** Porque Stage 3 es el MVP del admin. Primero hacemos funcionar esto, después escalamos.

---

## Cuándo se entrega

**5-6 semanas** dividido en 4 sprints:

| Sprint | Qué hace | Semana |
|---|---|---|
| Sprint 5 | Backend base + Login en frontend | 1-2 |
| Sprint 6 | Formulario + Buscar modelos + API de analytics | 3 |
| Sprint 7 | Dashboard + página de analytics | 4 |
| Sprint 8 | Testing + documentación + deploy | 5 |

---

## El valor para los clientes

### Para una tienda
- Menos devoluciones (cliente vio en AR antes de comprar)
- Más conversión (cliente confía)
- Métrica clara (sabe cuánta gente usó AR)

### Para un museo
- Experiencia más engagement
- Atrae visitantes más jóvenes
- Recuerdos más fuertes del sitio

### Para una escuela
- Estudiantes aprenden mejor (entienden geometría 3D)
- Menos aburrimiento
- Tecnología real que impresiona

---

## Por qué es realista

- ✅ Sequelize: ORM conocido, no reinventamos la rueda
- ✅ Context API: React nativo, sin librerías extra
- ✅ Sequelize + PostgreSQL: Estándar en la industria
- ✅ Algoritmo simple: Los sprints dicen exactamente qué hacer
- ✅ Alcance definido: No suben modelos, sin pagos, sin lo complejo

---

## Próximos pasos

1. **Leer los sprints** en `docs/sprints-web/` y `docs/sprints-api/`
2. **Decidir quiénes hacen qué** (quién backend, quién frontend)
3. **Setup local** (PostgreSQL, Node, React)
4. **Empezar Sprint 5**

---

**Para entender flujos de usuario y qué ve cada actor, ver [docs/FLUJOS.md](./docs/FLUJOS.md)**
