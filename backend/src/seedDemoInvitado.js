import "dotenv/config";
import { nanoid } from "nanoid";
import { prisma } from "./config/db.js";

// Crea un invitado principal + 2 acompañantes de prueba, solo para poder
// probar el flujo de RSVP (Fase 2.3) antes de que exista el importador
// real del Excel (Fase 2.4). Se puede correr varias veces: crea uno nuevo
// cada vez.
async function main() {
  const token = nanoid(12);

  const principal = await prisma.invitado.create({
    data: {
      nombreCompleto: "Invitado de Prueba",
      esPrincipal: true,
      tokenAcceso: token,
      pasesDeclarados: 3,
      acompanantes: {
        create: [
          { nombreCompleto: "Acompañante Uno", esPrincipal: false },
          { nombreCompleto: "Acompañante Dos", esPrincipal: false },
        ],
      },
    },
    include: { acompanantes: true },
  });

  console.log("Invitado de prueba creado:");
  console.log(`  token: ${principal.tokenAcceso}`);
  console.log(`  GET  http://localhost:4000/api/invitacion/${principal.tokenAcceso}`);
  console.log(
    "  acompañantes:",
    principal.acompanantes.map((a) => `id=${a.id} (${a.nombreCompleto})`).join(", ")
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
