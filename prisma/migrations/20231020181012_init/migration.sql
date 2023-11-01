/*
  Warnings:

  - Made the column `strikeResetPeriod` on table `ServerTable` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ServerTable" ALTER COLUMN "strikeResetPeriod" SET NOT NULL,
ALTER COLUMN "strikeResetPeriod" SET DEFAULT 1;
