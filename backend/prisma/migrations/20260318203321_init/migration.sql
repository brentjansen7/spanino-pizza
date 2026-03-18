-- CreateTable
CREATE TABLE "klanten" (
    "id" SERIAL NOT NULL,
    "naam" TEXT NOT NULL,
    "email" TEXT,
    "telefoon" TEXT,
    "adres" TEXT,
    "stad" TEXT,
    "postcode" TEXT,
    "notities" TEXT,
    "aangemaaktOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "klanten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturen" (
    "id" SERIAL NOT NULL,
    "factuurNummer" TEXT NOT NULL,
    "klantId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'concept',
    "vervaldatum" TIMESTAMP(3),
    "btwPercentage" DOUBLE PRECISION NOT NULL DEFAULT 21.0,
    "notities" TEXT,
    "aangemaaktOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verstuurdOp" TIMESTAMP(3),
    "betaaldOp" TIMESTAMP(3),

    CONSTRAINT "facturen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factuur_regels" (
    "id" SERIAL NOT NULL,
    "factuurId" INTEGER NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "aantal" DOUBLE PRECISION NOT NULL,
    "eenheidsprijs" DOUBLE PRECISION NOT NULL,
    "volgorde" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "factuur_regels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feestverzoeken" (
    "id" SERIAL NOT NULL,
    "naam" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefoon" TEXT,
    "datumEvenement" TIMESTAMP(3),
    "aantalPersonen" INTEGER,
    "typeEvenement" TEXT,
    "bericht" TEXT,
    "status" TEXT NOT NULL DEFAULT 'nieuw',
    "emailVerstuurdOp" TIMESTAMP(3),
    "aangemaaktOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feestverzoeken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL NOT NULL,
    "naam" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "onderwerp" TEXT NOT NULL,
    "inhoud" TEXT NOT NULL,
    "bijgewerktOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instellingen" (
    "sleutel" TEXT NOT NULL,
    "waarde" TEXT NOT NULL,

    CONSTRAINT "instellingen_pkey" PRIMARY KEY ("sleutel")
);

-- AddForeignKey
ALTER TABLE "facturen" ADD CONSTRAINT "facturen_klantId_fkey" FOREIGN KEY ("klantId") REFERENCES "klanten"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factuur_regels" ADD CONSTRAINT "factuur_regels_factuurId_fkey" FOREIGN KEY ("factuurId") REFERENCES "facturen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "facturen_factuurNummer_key" ON "facturen"("factuurNummer");
