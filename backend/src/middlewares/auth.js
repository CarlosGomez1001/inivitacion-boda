import jwt from "jsonwebtoken";

/**
 * Protege rutas de admin: exige "Authorization: Bearer <token>" con un JWT
 * válido emitido por /api/admin/login. Deja el payload en req.admin.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No autorizado: falta token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // { sub, email, rol }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "No autorizado: token inválido o expirado" });
  }
}
