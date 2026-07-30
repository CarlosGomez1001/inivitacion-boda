import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me } from "../controllers/adminAuthController.js";
import {
  listarInvitados,
  crearInvitado,
  actualizarInvitado,
  eliminarInvitado,
} from "../controllers/invitadosController.js";
import {
  obtenerEstadisticas,
  generarReporteExcel,
  generarReportePdf,
} from "../controllers/reportesController.js";
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

router.get("/invitados", requireAuth, listarInvitados);
router.post("/invitados", requireAuth, crearInvitado);
router.put("/invitados/:id", requireAuth, actualizarInvitado);
router.delete("/invitados/:id", requireAuth, eliminarInvitado);

router.get("/estadisticas", requireAuth, obtenerEstadisticas);
router.get("/reportes/excel", requireAuth, generarReporteExcel);
router.get("/reportes/pdf", requireAuth, generarReportePdf);

export default router;
