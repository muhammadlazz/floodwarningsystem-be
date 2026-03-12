-- CreateTable
CREATE TABLE "BbwsDebit" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "debit" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BbwsDebit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BbwsRainfall" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BbwsRainfall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BmkgStation" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BmkgStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BmkgWeather" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "forecast" TEXT NOT NULL,
    "notes" TEXT,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BmkgWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BmkgRainfall" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BmkgRainfall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BbwsDebit_stationId_measuredAt_idx" ON "BbwsDebit"("stationId", "measuredAt");

-- CreateIndex
CREATE INDEX "BbwsDebit_measuredAt_idx" ON "BbwsDebit"("measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "BbwsDebit_stationId_measuredAt_key" ON "BbwsDebit"("stationId", "measuredAt");

-- CreateIndex
CREATE INDEX "BbwsRainfall_stationId_measuredAt_idx" ON "BbwsRainfall"("stationId", "measuredAt");

-- CreateIndex
CREATE INDEX "BbwsRainfall_measuredAt_idx" ON "BbwsRainfall"("measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "BbwsRainfall_stationId_measuredAt_key" ON "BbwsRainfall"("stationId", "measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "BmkgStation_code_key" ON "BmkgStation"("code");

-- CreateIndex
CREATE INDEX "BmkgStation_isActive_idx" ON "BmkgStation"("isActive");

-- CreateIndex
CREATE INDEX "BmkgWeather_stationId_measuredAt_idx" ON "BmkgWeather"("stationId", "measuredAt");

-- CreateIndex
CREATE INDEX "BmkgWeather_measuredAt_idx" ON "BmkgWeather"("measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "BmkgWeather_stationId_measuredAt_key" ON "BmkgWeather"("stationId", "measuredAt");

-- CreateIndex
CREATE INDEX "BmkgRainfall_stationId_measuredAt_idx" ON "BmkgRainfall"("stationId", "measuredAt");

-- CreateIndex
CREATE INDEX "BmkgRainfall_measuredAt_idx" ON "BmkgRainfall"("measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "BmkgRainfall_stationId_measuredAt_key" ON "BmkgRainfall"("stationId", "measuredAt");

-- AddForeignKey
ALTER TABLE "BbwsDebit" ADD CONSTRAINT "BbwsDebit_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "BbwsStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BbwsRainfall" ADD CONSTRAINT "BbwsRainfall_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "BbwsStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BmkgWeather" ADD CONSTRAINT "BmkgWeather_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "BmkgStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BmkgRainfall" ADD CONSTRAINT "BmkgRainfall_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "BmkgStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
