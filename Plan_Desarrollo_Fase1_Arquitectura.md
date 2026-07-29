# Plan de Desarrollo — Invitación de Boda Digital
## Fase 1: Especificación de Requisitos y Arquitectura General

**Calibración:** Backend en Node.js + Express, PostgreSQL, servidor Compute Engine (VM) ya contratado, escala media (100–250 invitados), boda el 21-nov-2026 (~4 meses de plazo).

---

## 1. Estado actual (Frontend)

Ya existe una SPA funcional en React 18 + Vite (SWC) + Tailwind v4, sin backend ni persistencia:

- `dataBoda.js` es la fuente única de contenido (novios, fecha, itinerario, textos libres). Todo se renderiza estáticamente desde ahí.
- Componentes ya construidos: `Hero`, `Countdown`, `Timeline` (itinerario con claves fijas `ceremonia/recepcion/cena/baile/desvelados`), `DressCode`, `Historia`, `Regalos`, `Rsvp`, `Footer`, `Navbar`, más utilidades (`eventLinks.js` para Google Calendar/.ics/Maps/Waze, `formatDate.js`).
- `Rsvp.jsx` solo captura nombre + asistencia (sí/no) en estado local; no hay acompañantes, restricciones alimentarias, ni envío a ningún servidor — al confirmar solo cambia una bandera visual.
- No hay identificación por invitado: cualquiera puede escribir cualquier nombre.

**Brechas a cubrir:** persistencia real, confirmación personalizada por invitado (no solo por nombre libre), campos de acompañantes/restricciones, y todo el backend + panel admin + base de datos.

---

## 2. Arquitectura propuesta

Recomiendo un **monolito modular**, no microservicios: para 100–250 invitados y un equipo pequeño, separar servicios agregaría complejidad operativa sin beneficio real. Un backend Node/Express + PostgreSQL en la misma VM ya cubre el caso con margen.

### Diagrama de contenedores (C4 simplificado)

```
┌─────────────┐      HTTPS       ┌──────────────────────────┐
│  Invitado   │ ───────────────▶ │   Nginx (reverse proxy)  │
│  (browser)  │                  │   TLS via Let's Encrypt  │
└─────────────┘                  └───────────┬──────────────┘
                                              │
                     ┌────────────────────────┼─────────────────────┐
                     ▼                        ▼                     
          /             (estático)   /api/*  (proxy_pass)
          ┌─────────────────────┐    ┌─────────────────────────┐
          │  Frontend build     │    │  Backend Node/Express   │
          │  (dist/, servido    │    │  (PM2, puerto interno)  │
          │  directo por Nginx) │    │  + Panel Admin (mismo    │
          └─────────────────────┘    │  SPA, rutas protegidas)  │
                                      └───────────┬──────────────┘
                                                   │
                                                   ▼
                                      ┌─────────────────────────┐
                                      │  PostgreSQL (Docker o    │
                                      │  instalación nativa,     │
                                      │  misma VM)               │
                                      └─────────────────────────┘
                                                   │
                                                   ▼
                                      ┌─────────────────────────┐
                                      │  Backups (pg_dump →      │
                                      │  Cloud Storage, diario)  │
                                      └─────────────────────────┘
```

Todo vive en una sola VM de Compute Engine: Nginx como frontera, el frontend como archivos estáticos, el backend como proceso Node gestionado por PM2, y Postgres en un contenedor Docker aparte (aísla la base de datos sin necesitar Cloud SQL, que sería sobreingeniería para este tamaño).

---

## 3. Stack definitivo

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React + Vite + Tailwind (ya existe) | Sin cambios estructurales; se le agregan llamadas fetch y rutas de admin |
| Backend | Node.js 20 LTS + Express | Mismo lenguaje que el frontend, curva de aprendizaje mínima |
| ORM | Prisma | Migraciones versionadas, tipado, evita SQL a mano en un proyecto de este tamaño |
| Base de datos | PostgreSQL 16 | Relacional, ideal para reportes tabulares (Excel/PDF) y filtros de catering |
| Auth admin | JWT + bcrypt | Suficiente para 1–2 usuarios administradores, sin necesidad de un proveedor externo |
| Proceso | PM2 | Reinicio automático, logs, cero downtime en despliegues |
| Proxy/TLS | Nginx + Certbot | Estándar de facto en una VM propia |
| Reportes | `exceljs` (Excel) + `pdfkit` (PDF) | Generación server-side bajo demanda desde el panel admin |

---

## 4. Modelo de datos

Como ya tienes el nombre de cada asistente (no solo un número de pases), la tabla de invitados se vuelve auto-referenciada: cada fila es una persona con nombre propio, y las filas de acompañantes apuntan a su invitado principal vía `invitado_principal_id`. El principal recibe el link con token; desde ahí ve y marca la asistencia de cada acompañante por nombre, uno por uno.

```sql
CREATE TABLE admins (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol           VARCHAR(50) DEFAULT 'novio',
  creado_en     TIMESTAMP DEFAULT now()
);

CREATE TABLE grupos (              -- familia, lado (novio/novia), mesa, etc.
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE invitados (
  id                        SERIAL PRIMARY KEY,
  nombre_completo           VARCHAR(200) NOT NULL,
  token_acceso              VARCHAR(40) UNIQUE,            -- nanoid/uuid; solo el invitado principal tiene token
  invitado_principal_id     INTEGER REFERENCES invitados(id), -- NULL si es el principal; si no, apunta a su principal
  grupo_id                  INTEGER REFERENCES grupos(id),
  telefono                  VARCHAR(30),
  email                     VARCHAR(255),
  -- Campos de confirmación (null = pendiente), uno por persona
  asistencia                VARCHAR(10),                    -- 'si' | 'no' | null
  restricciones_alimentarias TEXT,
  respondido_en             TIMESTAMP,
  notas_internas            TEXT,
  creado_en                 TIMESTAMP DEFAULT now()
);
```

El `token_acceso` es la base de la "confirmación personalizada por nombre": el invitado principal recibe un link único (`/invitacion/<token>`) que precarga su nombre y la lista de sus acompañantes (por nombre, vía `invitado_principal_id`), y desde ahí confirma la asistencia de cada uno individualmente — en vez de un formulario abierto donde cualquiera escribe cualquier nombre. El número de "pases" ya no se guarda como número suelto: es implícito en la cantidad de filas de acompañantes ligadas al principal.

---

## 5. API (endpoints principales)

**Públicos** (usados por la invitación):
- `GET /api/invitacion/:token` — devuelve el invitado principal y la lista de sus acompañantes (por nombre) con su estado actual
- `POST /api/invitacion/:token/confirmar` — recibe un arreglo `[{ invitado_id, asistencia, restricciones_alimentarias }]` (principal + cada acompañante) y guarda la asistencia individual de cada uno

**Admin** (requieren JWT):
- `POST /api/admin/login`
- `GET /api/admin/invitados` (con filtros: confirmados, pendientes, grupo)
- `POST /api/admin/invitados` (alta manual o carga masiva CSV)
- `PUT /api/admin/invitados/:id`
- `DELETE /api/admin/invitados/:id`
- `GET /api/admin/estadisticas` (contadores en tiempo real)
- `GET /api/admin/reportes/excel`
- `GET /api/admin/reportes/pdf`

---

## 6. Panel de administración (funcionalidades MVP)

Login simple, dashboard con métricas en tiempo real (confirmados/pendientes/declinados, contados por persona) y por grupo familiar, tabla de invitados con búsqueda y edición inline (incluye alta de acompañantes por nombre bajo su principal), generación de link personalizado por invitado principal para enviar manualmente por WhatsApp, carga masiva desde CSV/Excel, y descarga de reportes Excel/PDF para el servicio de catering. La edición visual del contenido de la invitación (mover `dataBoda.js` a la base de datos) queda fuera del MVP — se puede evaluar como iteración futura si de verdad se necesita.

---

## 7. Seguridad y privacidad

Tokens de invitado no secuenciales (nanoid/UUID) para evitar que alguien adivine el link de otro invitado (Broken Access Control, OWASP A01). HTTPS obligatorio vía Certbot. Rate limiting en los endpoints públicos (`express-rate-limit`) contra fuerza bruta sobre tokens. Validación de inputs con `zod`. Contraseñas de admin con bcrypt y JWT de corta duración. Variables sensibles solo en `.env`, nunca en el repositorio. Backups diarios automatizados de PostgreSQL hacia un bucket de Cloud Storage. CORS restringido al dominio del frontend.

---

## 8. Próximas fases

- **Fase 2:** Definición del MVP y backlog (historias de usuario detalladas y priorizadas).
- **Fase 3:** Guía de implementación (estructura de carpetas del backend, esquema Prisma completo, componentes clave del panel admin).
- **Fase 4:** Despliegue, monitoreo y pruebas (configuración PM2/Nginx, logging, pruebas E2E).

¿Avanzamos a la Fase 2 (backlog e historias de usuario)?
