/*
  Warnings:

  - Added the required column `uniqueStrikeId` to the `MemberStrikeReasons` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `date` on the `MemberStrikeReasons` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "MemberStrikeReasons" ADD COLUMN     "uniqueStrikeId" TEXT NOT NULL,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MemberStrikeReasons_uniqueId_date_reason_key" ON "MemberStrikeReasons"("uniqueId", "date", "reason");
