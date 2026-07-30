import xlsx from "xlsx";
import { nanoid } from "nanoid";
import { prisma } from "../config/db.js";

const COLUMNAS = {
  nombre: "Nombre de invitado/a",
  pases: "# Pases",
  bebes: "Bebés",
  menores: "Menores",
  parentesco: "Parentesco",
  whatsapp: "WhatsApp",
  acompanantes: "Nombres(s) Acompañantes",
};

function parseNombresAcompanantes(texto) {
  if (!texto || typeof texto !== "string" || !texto.trim()) return [];
  const limpio = texto.trim();
  // Separa por coma, " y " y " e " (conjunción española) al mismo tiempo,
  // para casos mixtos como "Sofía, Denisse y Fanny" o "Pareja, Gael e Ian".
  const partes = limpio.split(/\s*,\s*|\s+y\s+|\s+e\s+/i);
  return partes.map((p) => p.trim()).filter(Boolean);
}

async function obtenerOCrearGrupo(nombre) {
  if (!nombre || !String(nombre).trim()) return null;
  const nombreLimpio = String(nombre).trim();
  const existente = await prisma.grupo.findFirst({ where: { nombre: nombreLimpio } });
  if (existente) return existente;
  return prisma.grupo.create({ data: { nombre: nombreLimpio } });
}

/**
 * Importa invitados desde el Excel real (columnas documentadas en la Fase 2).
 * No borra datos existentes: cada corrida crea invitados nuevos. Pensado
 * para correrse una sola vez sobre una base limpia; correrlo de nuevo
 * duplicará registros (a futuro se puede agregar upsert por nombre+grupo
 * si hace falta reimportar).
 */
export async function importarInvitados(rutaArchivo) {
  const libro = xlsx.readFile(rutaArchivo);
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = xlsx.utils.sheet_to_json(hoja, { defval: null });

  const resumen = { principales: 0, acompanantes: 0, advertencias: [] };

  for (const fila of filas) {
    const nombre = fila[COLUMNAS.nombre];
    if (!nombre || !String(nombre).trim()) continue; // fila vacía o de encabezado repetido

    const pases = Number(fila[COLUMNAS.pases]) || 0;
    const bebes = Number(fila[COLUMNAS.bebes]) || 0;
    const menores = Number(fila[COLUMNAS.menores]) || 0;
    const telefono = fila[COLUMNAS.whatsapp] ? String(fila[COLUMNAS.whatsapp]) : null;
    const textoAcompanantes = fila[COLUMNAS.acompanantes];
    const grupo = await obtenerOCrearGrupo(fila[COLUMNAS.parentesco]);

    let nombresAcompanantes = parseNombresAcompanantes(textoAcompanantes);
    const esperados = Math.max(pases - 1, 0);

    if (nombresAcompanantes.length === 0 && esperados > 0) {
      // # Pases > 1 y el campo de acompañantes viene vacío -> placeholders
      nombresAcompanantes = Array.from({ length: esperados }, (_, i) => `Acompañante ${i + 1}`);
    } else if (textoAcompanantes && nombresAcompanantes.length !== esperados) {
      resumen.advertencias.push(
        `"${nombre}": # Pases=${pases} pero se detectaron ${nombresAcompanantes.length} acompañante(s) en "${textoAcompanantes}". Revisar manualmente.`
      );
    }

    const principal = await prisma.invitado.create({
      data: {
        nombreCompleto: String(nombre).trim(),
        esPrincipal: true,
        tokenAcceso: nanoid(12),
        grupoId: grupo?.id ?? null,
        pasesDeclarados: pases,
        bebes,
        menores,
        telefono,
        notasInternas: textoAcompanantes
          ? `Acompañantes (texto original del Excel): ${textoAcompanantes}`
          : null,
        acompanantes: {
          create: nombresAcompanantes.map((n) => ({
            nombreCompleto: n,
            esPrincipal: false,
          })),
        },
      },
      include: { acompanantes: true },
    });

    resumen.principales += 1;
    resumen.acompanantes += principal.acompanantes.length;
  }

  return resumen;
}
