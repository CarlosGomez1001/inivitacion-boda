# middlewares

- `auth.js` ✅ (Fase 2.2) — verifica el JWT y protege `/api/admin/*`.
- `rateLimit.js` ✅ (Fase 2.3) — `express-rate-limit` para las rutas públicas de RSVP (el login usa su propio limiter definido en `routes/admin.js`).
- `validate.js` — no se creó como middleware aparte; la validación con `zod` se hace inline en cada controlador (`adminAuthController.js`, `invitacionController.js`). Se puede extraer más adelante si se repite mucho.
