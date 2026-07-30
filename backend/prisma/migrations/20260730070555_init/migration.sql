-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'novio',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitados" (
    "id" SERIAL NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "invitado_principal_id" INTEGER,
    "token_acceso" TEXT,
    "grupo_id" INTEGER,
    "pases_declarados" INTEGER,
    "bebes" INTEGER NOT NULL DEFAULT 0,
    "menores" INTEGER NOT NULL DEFAULT 0,
    "telefono" TEXT,
    "email" TEXT,
    "asistencia" TEXT,
    "restricciones_alimentarias" TEXT,
    "respondido_en" TIMESTAMP(3),
    "notas_internas" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitados_token_acceso_key" ON "invitados"("token_acceso");

-- AddForeignKey
ALTER TABLE "invitados" ADD CONSTRAINT "invitados_invitado_principal_id_fkey" FOREIGN KEY ("invitado_principal_id") REFERENCES "invitados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitados" ADD CONSTRAINT "invitados_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
