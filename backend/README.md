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

## Estado

- **Fase 2.1** — Express, conexión a Prisma/Postgres, endpoint `/health`. ✅
- **Fase 2.2** — Login admin (JWT + bcrypt), middleware `requireAuth`, seed del primer admin. ✅
- Rutas de negocio (RSVP, gestión de invitados, reportes) se agregan en las Fases 2.3–2.5.
