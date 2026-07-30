# services

- `importador.js` ✅ (Fase 2.4) — lee el Excel (vía `backend/src/importarInvitados.js`), parsea "Nombres(s) Acompañantes" (por comas y por " y "), genera filas de acompañante o placeholders "Acompañante N" cuando el campo viene vacío con # Pases > 1, y reporta advertencias cuando el conteo no cuadra.
- `reportes.js` (pendiente, Fase 2.5) — genera Excel (`exceljs`) y PDF (`pdfkit`) de confirmados para catering.
