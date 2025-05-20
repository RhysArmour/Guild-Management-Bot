/*
  Warnings:

  - Added the required column `active` to the `MemberStrikeReasons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryDate` to the `MemberStrikeReasons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MemberStrikeReasons" ADD COLUMN     "active" BOOLEAN NOT NULL,
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL;
