import { Router } from "express";
import { rsvpLimiter } from "../middlewares/rateLimit.js";
import { obtenerInvitacion, confirmarAsistencia } from "../controllers/invitacionController.js";

const router = Router();

router.get("/:token", rsvpLimiter, obtenerInvitacion);
router.post("/:token/confirmar", rsvpLimiter, confirmarAsistencia);

export default router;
