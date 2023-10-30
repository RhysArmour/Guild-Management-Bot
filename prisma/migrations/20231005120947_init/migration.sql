/*
  Warnings:

  - The `totalAbsenceDuration` column on the `Members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Members" DROP COLUMN "totalAbsenceDuration",
ADD COLUMN     "totalAbsenceDuration" INTEGER;
