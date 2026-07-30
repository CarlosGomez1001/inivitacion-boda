# middlewares

- `auth.js` ✅ (Fase 2.2) — verifica el JWT y protege `/api/admin/*`.
- `rateLimit.js` (pendiente, Fase 2.3) — `express-rate-limit` para las rutas públicas de RSVP (el login ya tiene su propio limiter definido directamente en `routes/admin.js`).
- `validate.js` (pendiente, Fase 2.3+) — helper para validar body/params con `zod`.
