# Despliegue en la VM de GCloud (Docker)

Ver arquitectura completa en `../Plan_Desarrollo_Fase1_Arquitectura.md`.

## Prerrequisitos en la VM

- Docker y el plugin de Docker Compose instalados (`docker --version`,
  `docker compose version`).
- Puerto 80 abierto en el firewall de GCloud (Compute Engine → Firewall
  rules) para la IP externa de la VM. Cuando exista un dominio, se agrega
  también el 443 (ver más abajo).
- El proyecto copiado o clonado en la VM (misma carpeta que en local:
  `src/`, `backend/`, `docker-compose.yml`, `deploy/`).

## 1. Construir el frontend

Desde la raíz del proyecto:

```bash
npm install
npm run build
```

Esto genera `dist/`, que Nginx sirve como archivos estáticos (ver `docker-compose.yml`).

## 2. Configurar variables de entorno

Backend:

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con valores reales:

- `DATABASE_URL` → debe apuntar al servicio `postgres` del compose (no a
  `localhost`): `postgresql://invitacion:<password-real>@postgres:5432/invitacion_boda`
- `JWT_SECRET` → generar uno real, por ejemplo con `openssl rand -hex 32`
- `CORS_ORIGIN` → la URL pública final (por ahora, mientras no hay dominio:
  `http://<IP-externa-de-la-VM>`)
- `EXCEL_INVITADOS_PATH=/app/data/Lista_invitados.xlsx` (así lo encuentra
  dentro del contenedor, ver el volumen montado en `docker-compose.yml`)

Credenciales de Postgres para docker-compose — crear un `.env` en la **raíz**
del proyecto (no en `backend/`):

```bash
cat > .env <<'EOF'
POSTGRES_USER=invitacion
POSTGRES_PASSWORD=<password-real, distinto al de ejemplo>
POSTGRES_DB=invitacion_boda
EOF
```

## 3. Levantar todo

```bash
docker compose up -d --build
```

Esto levanta `postgres`, `backend` (aplica las migraciones de Prisma
automáticamente al iniciar, vía `docker-entrypoint.sh`) y `nginx`.

Verificar que los 3 contenedores están corriendo:

```bash
docker compose ps
docker compose logs -f backend
```

## 4. Crear el primer admin e importar invitados

```bash
docker compose exec backend npm run seed
docker compose exec backend npm run import:invitados
```

(el importador lee el Excel montado en `/app/data/Lista_invitados.xlsx`
gracias al volumen `./src/data:/app/data:ro` del compose; para actualizar la
lista más adelante basta con reemplazar el archivo en `src/data/` y volver a
correr el importador, sin reconstruir la imagen).

## 5. Verificar

```bash
curl http://<IP-externa-de-la-VM>/api/admin/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@invitacion.local","password":"<la-que-imprimió-el-seed>"}'

curl http://<IP-externa-de-la-VM>/
```

Y desde el navegador: `http://<IP-externa-de-la-VM>/` (invitación pública) y
`http://<IP-externa-de-la-VM>/admin` (panel de novios).

## 6. Backups automáticos

```bash
chmod +x deploy/backup.sh
crontab -e
# agregar la línea:
# 0 3 * * * /ruta/absoluta/al/proyecto/deploy/backup.sh >> /var/log/invitacion-backup.log 2>&1
```

## Cuando ya tengan dominio (pendiente)

1. Apuntar el DNS del dominio a la IP externa de la VM.
2. Abrir el puerto 443 en el firewall de GCloud.
3. En la VM: `sudo apt install certbot python3-certbot-nginx` (fuera de
   Docker, o usar la imagen oficial de certbot) y correr
   `certbot --nginx -d tu-dominio.com`.
4. Certbot ajusta `deploy/nginx.conf` para servir HTTPS y programa la
   renovación automática del certificado.
5. Actualizar `CORS_ORIGIN` en `backend/.env` a `https://tu-dominio.com` y
   reiniciar el backend (`docker compose restart backend`).

## Actualizar el sitio tras un cambio de código

```bash
git pull   # o copiar los archivos actualizados
npm run build            # si cambió el frontend
docker compose up -d --build   # reconstruye y reinicia lo que haya cambiado
```
