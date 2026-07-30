import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "./config/db.js";

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@invitacion.local";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? generateTempPassword();

function generateTempPassword() {
  return Math.random().toString(36).slice(-10) + "!A1";
}

async function main() {
  const existing = await prisma.admin.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`El admin ${EMAIL} ya existe, no se creó de nuevo.`);
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await prisma.admin.create({
    data: { email: EMAIL, passwordHash, rol: "novio" },
  });

  console.log("Admin de prueba creado:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
  console.log("Cámbiala antes de producción (o define SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD en .env y vuelve a correr el seed).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
