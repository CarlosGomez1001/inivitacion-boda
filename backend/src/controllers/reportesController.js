import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { prisma } from "../config/db.js";

async function obtenerConfirmados() {
  // Todas las personas (principal + acompañantes) con asistencia confirmada.
  return prisma.invitado.findMany({
    where: { asistencia: "si" },
    include: { grupo: true, invitadoPrincipal: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

export async function obtenerEstadisticas(req, res) {
  const [totalPersonas, confirmados, declinados, pendientes, totalGrupos] = await Promise.all([
    prisma.invitado.count(),
    prisma.invitado.count({ where: { asistencia: "si" } }),
    prisma.invitado.count({ where: { asistencia: "no" } }),
    prisma.invitado.count({ where: { asistencia: null } }),
    prisma.invitado.count({ where: { esPrincipal: true } }),
  ]);

  res.json({
    totalPersonas,
    totalGruposInvitados: totalGrupos,
    confirmados,
    declinados,
    pendientes,
  });
}

export async function generarReporteExcel(req, res) {
  const confirmados = await obtenerConfirmados();

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Confirmados");

  hoja.columns = [
    { header: "Nombre", key: "nombre", width: 30 },
    { header: "Grupo / Parentesco", key: "grupo", width: 25 },
    { header: "Es principal", key: "esPrincipal", width: 12 },
    { header: "Invitado principal", key: "principal", width: 25 },
    { header: "Restricciones alimentarias", key: "restricciones", width: 30 },
  ];
  hoja.getRow(1).font = { bold: true };

  confirmados.forEach((inv) => {
    hoja.addRow({
      nombre: inv.nombreCompleto,
      grupo: inv.grupo?.nombre ?? "",
      esPrincipal: inv.esPrincipal ? "Sí" : "No",
      principal: inv.invitadoPrincipal?.nombreCompleto ?? "",
      restricciones: inv.restriccionesAlimentarias ?? "",
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=confirmados.xlsx");

  await workbook.xlsx.write(res);
  res.end();
}

export async function generarReportePdf(req, res) {
  const confirmados = await obtenerConfirmados();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=confirmados.pdf");

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(res);

  doc.fontSize(18).text("Lista de confirmados", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Total de personas confirmadas: ${confirmados.length}`);
  doc.moveDown();

  confirmados.forEach((inv, i) => {
    const linea = [
      `${i + 1}. ${inv.nombreCompleto}`,
      inv.grupo?.nombre ? `(${inv.grupo.nombre})` : "",
      inv.restriccionesAlimentarias ? ` — Restricción: ${inv.restriccionesAlimentarias}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    doc.fontSize(11).text(linea);
  });

  doc.end();
}
