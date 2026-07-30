import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./config/db.js";
import adminRouter from "./routes/admin.js";
import invitacionRouter from "./routes/invitacion.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/invitacion", invitacionRouter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected", message: err.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});

export default app;
