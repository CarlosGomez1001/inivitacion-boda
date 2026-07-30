import { z } from "zod";
import { prisma } from "../config/db.js";

function serializarInvitado(invitado) {
  return {
    id: invitado.id,
    nombre: invitado.nombreCompleto,
    asistencia: invitado.asistencia,
    restriccionesAlimentarias: invitado.restriccionesAlimentarias,
  };
}

async function buscarPrincipalPorToken(token, includeAcompanantes = true) {
  return prisma.invitado.findUnique({
    where: { tokenAcceso: token },
    include: includeAcompanantes ? { acompanantes: true } : undefined,
  });
}

export async function obtenerInvitacion(req, res) {
  const { token } = req.params;

  const principal = await buscarPrincipalPorToken(token);

  if (!principal || !principal.esPrincipal) {
    return res.status(404).json({ error: "Invitación no encontrada" });
  }

  return res.json({
    invitado: serializarInvitado(principal),
    acompanantes: principal.acompanantes.map(serializarInvitado),
  });
}

const confirmacionSchema = z.object({
  confirmaciones: z
    .array(
      z.object({
        invitadoId: z.number().int().positive(),
        asistencia: z.enum(["si", "no"]),
        restriccionesAlimentarias: z.string().max(500).optional().nullable(),
      })
    )
    .min(1),
});

export async function confirmarAsistencia(req, res) {
  const { token } = req.params;

  const parsed = confirmacionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", detalles: parsed.error.flatten() });
  }

  const principal = await buscarPrincipalPorToken(token);

  if (!principal || !principal.esPrincipal) {
    return res.status(404).json({ error: "Invitación no encontrada" });
  }

  // Un invitado principal solo puede confirmar por sí mismo y sus propios
  // acompañantes, nunca por IDs de otro grupo (evita adivinar/forzar ids).
  const idsValidos = new Set([principal.id, ...principal.acompanantes.map((a) => a.id)]);

  const { confirmaciones } = parsed.data;

  for (const c of confirmaciones) {
    if (!idsValidos.has(c.invitadoId)) {
      return res.status(403).json({ error: `El invitado ${c.invitadoId} no pertenece a esta invitación` });
    }
  }

  const ahora = new Date();

  await prisma.$transaction(
    confirmaciones.map((c) =>
      prisma.invitado.update({
        where: { id: c.invitadoId },
        data: {
          asistencia: c.asistencia,
          restriccionesAlimentarias: c.restriccionesAlimentarias ?? null,
          respondidoEn: ahora,
        },
      })
    )
  );

  const actualizado = await buscarPrincipalPorToken(token);

  return res.json({
    invitado: serializarInvitado(actualizado),
    acompanantes: actualizado.acompanantes.map(serializarInvitado),
  });
}
