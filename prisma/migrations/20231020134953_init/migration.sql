/*
  Warnings:

  - The `strikeResetPeriod` column on the `ServerTable` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ServerTable" DROP COLUMN "strikeResetPeriod",
ADD COLUMN     "strikeResetPeriod" INTEGER;
