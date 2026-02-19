/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MASTER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "Agency" AS ENUM ('BBWS', 'BMKG', 'BPBD', 'SYSTEM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agency" "Agency",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';
