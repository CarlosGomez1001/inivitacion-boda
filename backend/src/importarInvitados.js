import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { importarInvitados } from "./services/importador.js";
import { prisma } from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// El Excel vive en el frontend (src/data/Lista_invitados.xlsx), un nivel
// arriba de backend/. Se puede sobreescribir con EXCEL_INVITADOS_PATH en .env.
const rutaArchivo =
  process.env.EXCEL_INVITADOS_PATH ??
  path.resolve(__dirname, "../../src/data/Lista_invitados.xlsx");

async function main() {
  console.log(`Importando invitados desde: ${rutaArchivo}`);
  const resumen = await importarInvitados(rutaArchivo);

  console.log(`Principales creados: ${resumen.principales}`);
  console.log(`Acompañantes creados: ${resumen.acompanantes}`);

  if (resumen.advertencias.length) {
    console.log(`\nAdvertencias (revisar manualmente, ${resumen.advertencias.length}):`);
    resumen.advertencias.forEach((a) => console.log(`  - ${a}`));
  } else {
    console.log("\nSin advertencias.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
