/*
  Warnings:

  - The primary key for the `MemberStrikeReasons` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MemberStrikeReasons" DROP CONSTRAINT "MemberStrikeReasons_pkey",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "MemberStrikeReasons_id_seq";
