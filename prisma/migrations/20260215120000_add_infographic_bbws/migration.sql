-- CreateTable
CREATE TABLE "Infographic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Infographic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BbwsStation" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "riverName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BbwsStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BbwsWaterLevel" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "waterLevel" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'BBWS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BbwsWaterLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Infographic_isActive_sortOrder_idx" ON "Infographic"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BbwsStation_code_key" ON "BbwsStation"("code");

-- CreateIndex
CREATE INDEX "BbwsStation_isActive_idx" ON "BbwsStation"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BbwsWaterLevel_stationId_measuredAt_key" ON "BbwsWaterLevel"("stationId", "measuredAt");

-- CreateIndex
CREATE INDEX "BbwsWaterLevel_stationId_measuredAt_idx" ON "BbwsWaterLevel"("stationId", "measuredAt");

-- CreateIndex
CREATE INDEX "BbwsWaterLevel_measuredAt_idx" ON "BbwsWaterLevel"("measuredAt");

-- AddForeignKey
ALTER TABLE "BbwsWaterLevel" ADD CONSTRAINT "BbwsWaterLevel_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "BbwsStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
