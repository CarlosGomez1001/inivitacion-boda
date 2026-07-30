import rateLimit from "express-rate-limit";

// Protege las rutas públicas de RSVP contra fuerza bruta sobre tokens
// (OWASP A01: Broken Access Control / enumeración de tokens).
export const rsvpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes, intenta más tarde." },
});
