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

## Estado (Fase 2.1)

Andamiaje creado: Express, conexión a Prisma/Postgres, endpoint `/health`.
Rutas de negocio (RSVP, admin, reportes) se agregan en las Fases 2.2–2.5.
