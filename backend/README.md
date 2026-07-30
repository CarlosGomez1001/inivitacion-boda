# Backend — Invitación de Boda Digital

Node.js + Express + Prisma + PostgreSQL. Ver el plan completo en
`../Plan_Desarrollo_Fase1_Arquitectura.md` y `../Plan_Desarrollo_Fase2_Backlog.md`.

## Cómo correrlo en local (requiere Docker y Node instalados)

```bash
# 1. Levantar PostgreSQL
docker compose -f ../docker-compose.yml up -d postgres

# 2. Instalar dependencias
cd backend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# ajustar DATABASE_URL si cambiaste usuario/password/puerto en docker-compose.yml

# 4. Generar cliente Prisma y correr la primera migración
npx prisma generate
npx prisma migrate dev --name init

# 5. Levantar el servidor
npm run dev
```

Verificación: `curl http://localhost:4000/health` debe responder
`{"status":"ok","db":"connected"}`.

## Login de admin (Fase 2.2)

```bash
# Crea el primer usuario admin (con la app corriendo o no, solo necesita la DB)
npm run seed
# Imprime algo como:
#   email:    admin@invitacion.local
#   password: <contraseña generada>
```

Con el servidor corriendo (`npm run dev`), probar el login:

```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@invitacion.local","password":"<pega aquí la contraseña impresa por el seed>"}'
```

Debe responder `{"token": "...", "admin": {...}}`. Con ese token, probar la ruta protegida:

```bash
curl http://localhost:4000/api/admin/me \
  -H "Authorization: Bearer <token>"
```

Debe responder `{"admin": {"sub":..., "email":"admin@invitacion.local","rol":"novio", ...}}`.
Sin el header `Authorization`, o con un token inválido, debe responder 401.

## RSVP público (Fase 2.3)

Como el importador real del Excel todavía no existe (Fase 2.4), hay un script
para crear un invitado de prueba con 2 acompañantes:

```bash
npm run seed:demo
# Imprime algo como:
#   token: aB3xQ...
#   GET  http://localhost:4000/api/invitacion/aB3xQ...
#   acompañantes: id=2 (Acompañante Uno), id=3 (Acompañante Dos)
```

Probar que devuelve al principal y sus acompañantes:

```bash
curl http://localhost:4000/api/invitacion/<token>
```

Confirmar asistencia (ajusta los ids según lo que imprimió `seed:demo`; el id
del principal es el más bajo del grupo, usualmente el primero que se creó):

```bash
curl -X POST http://localhost:4000/api/invitacion/<token>/confirmar \
  -H "Content-Type: application/json" \
  -d '{
    "confirmaciones": [
      { "invitadoId": 1, "asistencia": "si" },
      { "invitadoId": 2, "asistencia": "si", "restriccionesAlimentarias": "Vegetariano" },
      { "invitadoId": 3, "asistencia": "no" }
    ]
  }'
```

Debe devolver el mismo invitado + acompañantes ya con `asistencia` actualizada.
Probar también casos de error: un token que no existe (debe dar 404) y un
`invitadoId` que no pertenezca a ese grupo (debe dar 403).

## Gestión de invitados e importador real (Fase 2.4)

Importar la lista real desde `src/data/Lista_invitados.xlsx` (no necesita
`npm install` de nuevo, `xlsx` ya estaba en las dependencias desde la Fase 2.1):

```bash
npm run import:invitados
```

Imprime cuántos principales/acompañantes creó y una lista de advertencias
(filas donde el # de nombres detectados en "Nombres(s) Acompañantes" no
coincide con "# Pases", para revisar manualmente — no bloquea el import).

Nota: si corres el importador más de una vez, duplica los registros. Si
necesitas repetirlo limpio, borra los invitados de prueba/anteriores primero
(o corre `npx prisma migrate reset` desde `backend/` y vuelve a correr
`npm run seed` antes del importador).

Probar el listado y el CRUD (usa el token de `/api/admin/login`):

```bash
# Listar (con filtros opcionales: ?estado=pendiente|confirmado|declinado, ?search=..., ?grupoId=...)
curl http://localhost:4000/api/admin/invitados \
  -H "Authorization: Bearer <token>"

# Editar un invitado (ejemplo: corregir pasesDeclarados)
curl -X PUT http://localhost:4000/api/admin/invitados/10 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"pasesDeclarados": 4}'

# Alta manual de un invitado principal
curl -X POST http://localhost:4000/api/admin/invitados \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombreCompleto":"Invitado Manual","esPrincipal":true,"pasesDeclarados":1}'

# Eliminar un invitado (si es principal, borra en cascada a sus acompañantes)
curl -X DELETE http://localhost:4000/api/admin/invitados/50 \
  -H "Authorization: Bearer <token>"
```

Todas estas rutas responden 401 sin el header `Authorization` correcto.

## Estado

- **Fase 2.1** — Express, conexión a Prisma/Postgres, endpoint `/health`. ✅
- **Fase 2.2** — Login admin (JWT + bcrypt), middleware `requireAuth`, seed del primer admin. ✅
- **Fase 2.3** — RSVP público (`GET/POST /api/invitacion/:token`), con rate limiting y validación de que cada invitado solo confirme por su propio grupo. ✅
- **Fase 2.4** — CRUD de invitados (`/api/admin/invitados`) e importador real del Excel (`npm run import:invitados`), con parseo de acompañantes y placeholders cuando el campo viene vacío. ✅
- Reportes y estadísticas se agregan en la Fase 2.5.
