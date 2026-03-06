/*
  Warnings:

  - The values [BPBD] on the enum `Agency` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('BARU', 'DIPROSES', 'SELESAI');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('RAWAN_BANJIR', 'AMAN');

-- AlterEnum
BEGIN;
CREATE TYPE "Agency_new" AS ENUM ('CITRA_BANJIR', 'BBWS', 'BMKG', 'BPBD_JABAR', 'BPBD_KAB', 'SYSTEM');
ALTER TABLE "User" ALTER COLUMN "agency" TYPE "Agency_new" USING ("agency"::text::"Agency_new");
ALTER TYPE "Agency" RENAME TO "Agency_old";
ALTER TYPE "Agency_new" RENAME TO "Agency";
DROP TYPE "public"."Agency_old";
COMMIT;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" "LogAction" NOT NULL,
    "entity" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "reporterName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'BARU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionUpdate" (
    "id" SERIAL NOT NULL,
    "regionName" TEXT NOT NULL,
    "alertStatus" "AlertStatus" NOT NULL DEFAULT 'AMAN',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "familyCount" INTEGER NOT NULL DEFAULT 0,
    "deathCount" INTEGER NOT NULL DEFAULT 0,
    "evacueeCount" INTEGER NOT NULL DEFAULT 0,
    "injuredCount" INTEGER NOT NULL DEFAULT 0,
    "submergedHouses" INTEGER NOT NULL DEFAULT 0,
    "heavilyDamagedHouses" INTEGER NOT NULL DEFAULT 0,
    "damagedPublicFacilities" INTEGER NOT NULL DEFAULT 0,
    "damagedWorshipPlaces" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegionUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
