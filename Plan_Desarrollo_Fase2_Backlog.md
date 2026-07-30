# Plan de Desarrollo — Invitación de Boda Digital
## Fase 2: Plan de Implementación (a cargo de Claude)

Este plan cambia de enfoque respecto a la versión anterior: ya no es un backlog para un equipo humano, sino la secuencia de trabajo que yo mismo ejecutaré, iteración por iteración, para construir todo lo definido en la Fase 1 sobre este repositorio.

---

## 1. Decisiones ya confirmadas

- **Admin inicial:** usuario de prueba genérico (`admin@invitacion.local` + contraseña temporal generada por mí), a cambiar antes de producción.
- **Dominio/TLS:** aún no hay dominio, sí IP pública de la VM. Se despliega por HTTP contra la IP; Nginx queda preparado para activar Certbot en cuanto exista un dominio.
- **Despliegue:** vía Docker (backend + PostgreSQL + Nginx como contenedores, orquestados con `docker-compose`).
- **Lista de invitados:** cargada en `src/data/Lista_invitados.xlsx` (91 invitados, columnas: Nombre de invitado/a, # Pases, Bebés, Menores, Parentesco, WhatsApp, Nombres(s) Acompañantes, Save The Date, Invitación, RSVP, #Asistentes) — se usa como caso real para el importador.
- **Acompañantes:** sí se identifican por nombre. Cada acompañante es su propia fila en `invitados`, ligada al principal vía `invitado_principal_id`, con `es_principal = false`. Al importar, el texto de "Nombres(s) Acompañantes" se separa por comas (y por " y " cuando no hay coma) para generar una fila por cada nombre. El invitado principal ve la lista de sus acompañantes por nombre y marca la asistencia de cada uno individualmente.

---

## 2. Alcance (sin cambios respecto a la Fase 1/2 original)

**Incluido:** invitación pública ya existente conectada al backend real, confirmación personalizada por token con acompañantes por nombre, panel admin (login, gestión de invitados, importador CSV, dashboard, reportes Excel/PDF), despliegue en la VM vía Docker.

**Fuera de esta iteración:** notificaciones automáticas, galería de fotos, pasarela de pago para regalos, editor visual de contenido, roles múltiples de admin.

---

## 3. Estructura de carpetas objetivo

```
Proyect_Invitacion/
├── src/                        (frontend existente — no se reestructura)
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.js
│   │   ├── config/db.js
│   │   ├── middlewares/auth.js
│   │   ├── routes/ (invitacion.js, admin.js)
│   │   ├── controllers/
│   │   ├── services/ (reportes.js, importador.js)
│   │   └── utils/ (tokens.js)
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml           (postgres + backend + nginx)
├── deploy/
│   ├── nginx.conf
│   └── DEPLOY.md                (runbook para correr esto en la VM)
```

---

## 4. Fases de implementación (orden estricto)

### Fase 2.1 — Andamiaje del backend
Crear `backend/`, inicializar `package.json`, instalar dependencias (`express`, `prisma`, `@prisma/client`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`, `zod`, `express-rate-limit`, `exceljs`, `pdfkit`, `multer`, `xlsx`, `nanoid`). Escribir `schema.prisma` con el modelo de la Fase 1 (`admins`, `grupos`, `invitados` auto-referenciada con `es_principal`/`invitado_principal_id`). Levantar PostgreSQL local con Docker dentro del entorno de trabajo y correr la primera migración. Endpoint `GET /health` respondiendo 200.

### Fase 2.2 — Autenticación admin
`POST /api/admin/login` (bcrypt + JWT), middleware `requireAuth` para proteger `/api/admin/*`, script de seed que crea el usuario admin de prueba.

### Fase 2.3 — RSVP público
`GET /api/invitacion/:token` (principal + lista de acompañantes por nombre, con su estado) y `POST /api/invitacion/:token/confirmar` (arreglo `[{ invitado_id, asistencia, restricciones_alimentarias }]`, uno por persona). Validación con `zod` (los `invitado_id` recibidos deben pertenecer a ese principal o ser él mismo) y `express-rate-limit` en estas rutas públicas.

### Fase 2.4 — Gestión de invitados (admin)
CRUD de invitados y acompañantes, importador que lee directamente `src/data/Lista_invitados.xlsx` (91 invitados) con este mapeo de columnas:

| Columna del Excel | Campo en BD |
|---|---|
| Nombre de invitado/a | `nombre_completo` (fila con `es_principal = true`) |
| # Pases | `pases_declarados` (solo para validar contra el # de acompañantes parseados) |
| Bebés | `bebes` |
| Menores | `menores` |
| Parentesco | `grupo_id` (se crean/reutilizan `grupos` por cada valor distinto) |
| WhatsApp | `telefono` |
| Nombres(s) Acompañantes | se parsea (separador `,` y también `" y "` cuando no hay coma) y cada nombre resultante genera una fila con `es_principal = false` e `invitado_principal_id` apuntando al principal; el texto original se guarda también en `notas_internas` del principal como respaldo |

Las columnas "Save The Date", "Invitación", "RSVP" y "#Asistentes" vienen vacías en el archivo actual — no se importan como datos, ya que ese seguimiento lo reemplaza el propio sistema (`asistencia`, `respondido_en`). Se genera token único solo para las filas principales.

**Caso # Pases > 1 con "Nombres(s) Acompañantes" vacío:** se generan igualmente `# Pases - 1` filas de acompañante, con `nombre_completo` = "Acompañante" (numerado como "Acompañante 1", "Acompañante 2"... si son más de uno, para poder distinguirlos al marcar asistencia). El principal podrá editar después esos nombres genéricos desde el panel admin si los novios los identifican más adelante.

El importador debe reportar (no bloquear) los casos donde el conteo de nombres parseados no coincida con `# Pases` menos 1 y el campo sí tenía texto, para revisión manual — por ejemplo, nombres con "y" dentro del mismo nombre compuesto o placeholders como "Pareja" en vez de un nombre real.

### Fase 2.5 — Métricas y reportes
`GET /api/admin/estadisticas`, `GET /api/admin/reportes/excel` (exceljs), `GET /api/admin/reportes/pdf` (pdfkit).

### Fase 2.6 — Integración con el frontend
Conectar `Rsvp.jsx` a la API real vía el token en la URL. Agregar vistas mínimas de admin (`login`, `dashboard`, `tabla de invitados`) dentro del mismo proyecto Vite, con el mínimo de rutas necesarias sin romper la SPA actual de una sola página.

### Fase 2.7 — Empaquetado con Docker
`Dockerfile` del backend, `docker-compose.yml` (postgres + backend + nginx), `deploy/nginx.conf` (proxy `/api`, sirve `dist/`, sin TLS por ahora ya que no hay dominio), `deploy/DEPLOY.md` con los comandos exactos para correr todo en la VM vía Docker, y script documentado de backup (`pg_dump` programado).

### Fase 2.8 — Pruebas y verificación
Pruebas manuales de cada endpoint contra Postgres local, casos de borde (token inválido, doble confirmación, CSV mal formateado, límite de rate limiting), y checklist final antes de dar por lista la iteración.

---

## 5. Qué haré en la siguiente iteración

Ejecutaré las Fases 2.1 a 2.8 en orden dentro de este repositorio, dejando el código, las migraciones y los archivos de Docker listos y commiteados. Me detendré a confirmar contigo solo si aparece algo que realmente no pueda decidir por mi cuenta (por ejemplo, el nombre exacto de las columnas del CSV real si no coincide con lo esperado).

¿Empiezo con la Fase 2.1 (andamiaje del backend) en la siguiente iteración?
