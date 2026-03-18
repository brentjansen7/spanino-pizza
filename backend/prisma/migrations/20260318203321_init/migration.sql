-- CreateTable
CREATE TABLE "klanten" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "naam" TEXT NOT NULL,
    "email" TEXT,
    "telefoon" TEXT,
    "adres" TEXT,
    "stad" TEXT,
    "postcode" TEXT,
    "notities" TEXT,
    "aangemaaktOp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "facturen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factuurNummer" TEXT NOT NULL,
    "klantId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'concept',
    "vervaldatum" DATETIME,
    "btwPercentage" REAL NOT NULL DEFAULT 21.0,
    "notities" TEXT,
    "aangemaaktOp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verstuurdOp" DATETIME,
    "betaaldOp" DATETIME,
    CONSTRAINT "facturen_klantId_fkey" FOREIGN KEY ("klantId") REFERENCES "klanten" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "factuur_regels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factuurId" INTEGER NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "aantal" REAL NOT NULL,
    "eenheidsprijs" REAL NOT NULL,
    "volgorde" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "factuur_regels_factuurId_fkey" FOREIGN KEY ("factuurId") REFERENCES "facturen" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feestverzoeken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "naam" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefoon" TEXT,
    "datumEvenement" DATETIME,
    "aantalPersonen" INTEGER,
    "typeEvenement" TEXT,
    "bericht" TEXT,
    "status" TEXT NOT NULL DEFAULT 'nieuw',
    "emailVerstuurdOp" DATETIME,
    "aangemaaktOp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "naam" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "onderwerp" TEXT NOT NULL,
    "inhoud" TEXT NOT NULL,
    "bijgewerktOp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "instellingen" (
    "sleutel" TEXT NOT NULL PRIMARY KEY,
    "waarde" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "facturen_factuurNummer_key" ON "facturen"("factuurNummer");
