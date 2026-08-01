#!/bin/sh
# Backup diario de PostgreSQL corriendo en Docker.
#
# Agregar a crontab en la VM (correr `crontab -e`), por ejemplo a las 3am:
#   0 3 * * * /ruta/absoluta/al/proyecto/deploy/backup.sh >> /var/log/invitacion-backup.log 2>&1

set -e

DIR_BACKUPS="$(cd "$(dirname "$0")/.." && pwd)/backups"
mkdir -p "$DIR_BACKUPS"

FECHA=$(date +%Y-%m-%d_%H%M)
ARCHIVO="$DIR_BACKUPS/invitacion_boda_$FECHA.sql.gz"

docker exec invitacion_postgres pg_dump -U invitacion invitacion_boda | gzip > "$ARCHIVO"
echo "Backup creado: $ARCHIVO"

# Opcional: subir a un bucket de Cloud Storage (requiere gsutil configurado en la VM)
# gsutil cp "$ARCHIVO" gs://tu-bucket-de-backups/

# Conserva solo los últimos 14 backups locales
ls -1t "$DIR_BACKUPS"/*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --
