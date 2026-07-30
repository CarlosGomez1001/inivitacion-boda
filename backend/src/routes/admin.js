import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me } from "../controllers/adminAuthController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Protege el login contra fuerza bruta (OWASP A07).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de login, intenta más tarde." },
});

router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, me);

// Fase 2.4: CRUD de invitados + importador CSV/Excel
// Fase 2.5: GET /estadisticas, /reportes/excel, /reportes/pdf

export default router;
