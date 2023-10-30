/*
  Warnings:

  - A unique constraint covering the columns `[uniqueId,date,reason]` on the table `MemberStrikeReasons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serverId` to the `MemberStrikeReasons` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MemberStrikeReasons_uniqueId_reason_key";

-- AlterTable
ALTER TABLE "MemberStrikeReasons" ADD COLUMN     "serverId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MemberStrikeReasons_uniqueId_date_reason_key" ON "MemberStrikeReasons"("uniqueId", "date", "reason");
