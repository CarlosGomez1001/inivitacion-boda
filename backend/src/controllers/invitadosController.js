import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "../config/db.js";

function serializarInvitado(invitado) {
  return {
    id: invitado.id,
    nombre: invitado.nombreCompleto,
    esPrincipal: invitado.esPrincipal,
    tokenAcceso: invitado.tokenAcceso,
    grupoId: invitado.grupoId,
    grupo: invitado.grupo?.nombre ?? null,
    pasesDeclarados: invitado.pasesDeclarados,
    bebes: invitado.bebes,
    menores: invitado.menores,
    telefono: invitado.telefono,
    email: invitado.email,
    asistencia: invitado.asistencia,
    restriccionesAlimentarias: invitado.restriccionesAlimentarias,
    respondidoEn: invitado.respondidoEn,
    notasInternas: invitado.notasInternas,
    acompanantes: invitado.acompanantes ? invitado.acompanantes.map(serializarInvitado) : undefined,
  };
}

export async function listarInvitados(req, res) {
  const { estado, grupoId, search } = req.query;

  const where = { esPrincipal: true };

  if (estado === "confirmado") where.asistencia = "si";
  else if (estado === "declinado") where.asistencia = "no";
  else if (estado === "pendiente") where.asistencia = null;

  if (grupoId) where.grupoId = Number(grupoId);
  if (search) where.nombreCompleto = { contains: String(search), mode: "insensitive" };

  const principales = await prisma.invitado.findMany({
    where,
    include: { acompanantes: true, grupo: true },
    orderBy: { nombreCompleto: "asc" },
  });

  res.json({ invitados: principales.map(serializarInvitado) });
}

const crearInvitadoSchema = z.object({
  nombreCompleto: z.string().min(1),
  esPrincipal: z.boolean().default(true),
  invitadoPrincipalId: z.number().int().positive().optional(),
  grupoId: z.number().int().positive().optional().nullable(),
  pasesDeclarados: z.number().int().min(0).optional(),
  bebes: z.number().int().min(0).optional(),
  menores: z.number().int().min(0).optional(),
  telefono: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

export async function crearInvitado(req, res) {
  const parsed = crearInvitadoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", detalles: parsed.error.flatten() });
  }

  const data = parsed.data;

  if (!data.esPrincipal && !data.invitadoPrincipalId) {
    return res.status(400).json({ error: "Un acompañante requiere invitadoPrincipalId" });
  }

  const invitado = await prisma.invitado.create({
    data: {
      nombreCompleto: data.nombreCompleto,
      esPrincipal: data.esPrincipal,
      invitadoPrincipalId: data.esPrincipal ? null : data.invitadoPrincipalId,
      tokenAcceso: data.esPrincipal ? nanoid(12) : null,
      grupoId: data.grupoId ?? null,
      pasesDeclarados: data.pasesDeclarados ?? null,
      bebes: data.bebes ?? 0,
      menores: data.menores ?? 0,
      telefono: data.telefono ?? null,
      email: data.email ?? null,
    },
  });

  res.status(201).json({ invitado: serializarInvitado(invitado) });
}

const actualizarInvitadoSchema = z.object({
  nombreCompleto: z.string().min(1).optional(),
  grupoId: z.number().int().positive().optional().nullable(),
  pasesDeclarados: z.number().int().min(0).optional().nullable(),
  bebes: z.number().int().min(0).optional(),
  menores: z.number().int().min(0).optional(),
  telefono: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  notasInternas: z.string().optional().nullable(),
});

export async function actualizarInvitado(req, res) {
  const id = Number(req.params.id);
  const parsed = actualizarInvitadoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", detalles: parsed.error.flatten() });
  }

  try {
    const invitado = await prisma.invitado.update({ where: { id }, data: parsed.data });
    res.json({ invitado: serializarInvitado(invitado) });
  } catch (err) {
    res.status(404).json({ error: "Invitado no encontrado" });
  }
}

export async function eliminarInvitado(req, res) {
  const id = Number(req.params.id);
  try {
    await prisma.invitado.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Invitado no encontrado" });
  }
}
