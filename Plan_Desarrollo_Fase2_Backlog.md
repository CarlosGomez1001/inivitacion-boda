# Plan de Desarrollo — Invitación de Boda Digital
## Fase 2: Definición del MVP y Backlog de Historias de Usuario

---

## 1. Alcance del MVP

**Dentro del MVP:**

- La invitación pública tal como ya existe (Hero, Countdown, Timeline, DressCode, Historia, Regalos), con `Rsvp.jsx` conectado al backend real.
- Confirmación de asistencia personalizada por token, con acompañantes identificados por nombre (esquema de la Fase 1).
- Panel de administración: login, gestión de invitados y acompañantes, carga masiva desde la lista real que ya tienen, dashboard de métricas, exportación Excel/PDF para catering.
- Despliegue en la VM de GCloud con dominio propio y HTTPS.

**Fuera del MVP (backlog futuro, no bloquea la boda):**

- Notificaciones automáticas por email/WhatsApp al confirmar.
- Galería de fotos (pre-boda y subida el día del evento).
- Mesa de regalos con pasarela de pago (hoy es solo texto/link externo, se mantiene así).
- Editor visual de contenido (mover `dataBoda.js` a la base de datos).
- Roles múltiples de administrador (ej. wedding planner con permisos limitados).

Se deja fuera lo anterior para no arriesgar el plazo de ~4 meses en funcionalidades que no afectan si la boda sale bien o mal; se retoman después si sobra tiempo.

---

## 2. Épicas

| Épica | Objetivo |
|---|---|
| A. Fundación técnica | Backend, base de datos y despliegue base funcionando en la VM |
| B. Confirmación de asistencia (RSVP) | Invitados confirman su asistencia y la de sus acompañantes por nombre |
| C. Admin — gestión de invitados | Novios administran su lista real de invitados y acompañantes |
| D. Admin — métricas y reportes | Novios ven avance en tiempo real y exportan reportes para catering |

---

## 3. Backlog detallado

### Épica A — Fundación técnica

| ID | Historia | Criterios de aceptación | Prioridad | Estimación |
|---|---|---|---|---|
| HU-01 | Como equipo de desarrollo, quiero el backend Node/Express conectado a PostgreSQL vía Prisma y desplegado en la VM, para construir el resto sobre una base estable. | Repo backend inicializado; Prisma conectado a Postgres (Docker); endpoint `/health` responde 200; variables sensibles en `.env`; corre bajo PM2. | P0 | M (3–5 días) |
| HU-02 | Como equipo de desarrollo, quiero Nginx con HTTPS (Let's Encrypt) frente al backend y al frontend, para exponer el sitio de forma segura bajo el dominio final. | Dominio apunta a la VM; certificado con renovación automática; `/api` proxied al backend; frontend servido como estático. | P0 | S (1–2 días) |

### Épica B — Confirmación de asistencia (RSVP)

| ID | Historia | Criterios de aceptación | Prioridad | Estimación |
|---|---|---|---|---|
| HU-03 | Como invitado principal, quiero abrir mi invitación con mi link único y ver mi nombre y el de mis acompañantes precargado, para no escribir nada manualmente. | `GET /api/invitacion/:token` devuelve principal + acompañantes; token inválido muestra error amigable; `Rsvp.jsx` consume el endpoint. | P0 | M |
| HU-04 | Como invitado principal, quiero marcar individualmente si cada acompañante asistirá o no, para reflejar quién realmente vendrá. | Cada acompañante aparece por nombre con opción sí/no; el principal también se confirma a sí mismo; se puede corregir antes de enviar. | P0 | M |
| HU-05 | Como invitado principal, quiero indicar restricciones alimentarias por cada persona confirmada, para que el catering lo sepa. | Campo de texto opcional por persona con asistencia = "sí"; se guarda en `restricciones_alimentarias`. | P1 | S |
| HU-06 | Como invitado, quiero volver a entrar a mi link y ver/editar mi confirmación ya enviada, para corregir errores antes de la fecha límite. | El formulario carga la respuesta previa; el envío sobrescribe la anterior; opción de bloquear edición después de la fecha límite. | P1 | M |

### Épica C — Admin: gestión de invitados

| ID | Historia | Criterios de aceptación | Prioridad | Estimación |
|---|---|---|---|---|
| HU-07 | Como novio/novia, quiero iniciar sesión en el panel admin, para acceder de forma segura a los datos de mis invitados. | Login con JWT; contraseña con bcrypt; sesión expira; rutas de admin protegidas en el frontend. | P0 | S |
| HU-08 | Como novio/novia, quiero cargar mi lista real de invitados desde un CSV/Excel (nombre, grupo, principal/acompañante, teléfono), para no darlos de alta uno por uno. | Importador valida columnas; genera tokens solo para principales; reporta filas con error sin detener toda la carga. | P0 | M–L |
| HU-09 | Como novio/novia, quiero ver y editar la lista completa de invitados y acompañantes con búsqueda y filtros, para mantener los datos al día. | Tabla con filtro por estado/grupo; edición inline; alta manual de un invitado o acompañante nuevo. | P0 | M |
| HU-10 | Como novio/novia, quiero copiar el link personalizado de un invitado principal, para enviarlo por WhatsApp a quien aún no lo tiene. | Botón "copiar link" junto a cada principal en la tabla. | P1 | S |

### Épica D — Admin: métricas y reportes

| ID | Historia | Criterios de aceptación | Prioridad | Estimación |
|---|---|---|---|---|
| HU-11 | Como novio/novia, quiero un dashboard con el conteo de confirmados, pendientes y declinados por persona, para saber cuántos vendrán en tiempo real. | Contadores vía `GET /api/admin/estadisticas`; se actualizan al refrescar. | P0 | S |
| HU-12 | Como novio/novia, quiero descargar un Excel con los asistentes confirmados y sus restricciones alimentarias, para dárselo al catering. | Excel generado en el servidor; columnas: nombre, grupo, asistencia, restricciones; solo confirmados. | P0 | M |
| HU-13 | Como novio/novia, quiero el mismo reporte en PDF, para tener una versión imprimible. | Mismo contenido que el Excel, formato legible para imprimir. | P1 | S |

**Total estimado del MVP:** ~13 historias, equivalentes a 5–6 semanas de desarrollo efectivo para una persona trabajando medio tiempo, dejando margen amplio dentro de los ~4 meses disponibles para pruebas, ajustes de diseño y la fecha límite de confirmación (1-nov-2026).

---

## 4. Plan de iteraciones sugerido

| Sprint | Semanas | Contenido |
|---|---|---|
| 1 | 1–2 | HU-01, HU-02 (fundación + despliegue base), HU-07 (login admin) |
| 2 | 3–4 | HU-08 (carga masiva), HU-03, HU-04 (RSVP funcional de punta a punta) |
| 3 | 5–6 | HU-09, HU-10 (gestión de invitados), HU-05, HU-06 (RSVP completo) |
| 4 | 7–8 | HU-11, HU-12, HU-13 (métricas y reportes), pruebas end-to-end, ajustes finales |

Con esto el MVP queda listo entre 6 y 8 semanas, dejando 2+ meses de colchón antes de la boda para imprevistos, feedback real de invitados y, si sobra tiempo, retomar algo del backlog futuro (por ejemplo notificaciones por email).

---

## 5. Riesgos principales

El formato exacto del CSV con la lista real de invitados aún no se conoce — se mitiga entregando una plantilla fija antes de construir HU-08. La configuración inicial de la VM (SO, accesos SSH, si ya tiene Docker) no está confirmada — conviene verificarla antes del Sprint 1 para no bloquear HU-01/HU-02. La fecha límite de confirmación (1-nov-2026) deja poco margen para ajustes de última hora con el catering, por lo que los reportes (HU-12/HU-13) deben quedar listos y probados antes de esa fecha, no después.

---

## Próxima fase

**Fase 3:** Guía de implementación — estructura de carpetas del backend, esquema Prisma completo (migraciones), y componentes clave del panel admin.

¿Avanzamos a la Fase 3?
