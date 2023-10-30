/*
  Warnings:

  - You are about to drop the column `previousAbsenceDuration` on the `Members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Members" DROP COLUMN "previousAbsenceDuration",
ADD COLUMN     "totalAbsenceDuration" TIMESTAMP(3);
