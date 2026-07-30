# services

- `importador.js` (Fase 2.4) — lee `src/data/Lista_invitados.xlsx`, parsea "Nombres(s) Acompañantes" (por comas y por " y "), genera filas de acompañante o placeholders "Acompañante N" cuando el campo viene vacío con # Pases > 1.
- `reportes.js` (Fase 2.5) — genera Excel (`exceljs`) y PDF (`pdfkit`) de confirmados para catering.
