/*
  Warnings:

  - A unique constraint covering the columns `[uniqueId,reason]` on the table `MemberStrikeReasons` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MemberStrikeReasons_uniqueId_date_reason_key";

-- AlterTable
CREATE SEQUENCE memberstrikereasons_id_seq;
ALTER TABLE "MemberStrikeReasons" ALTER COLUMN "id" SET DEFAULT nextval('memberstrikereasons_id_seq'),
ADD CONSTRAINT "MemberStrikeReasons_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE memberstrikereasons_id_seq OWNED BY "MemberStrikeReasons"."id";

-- CreateIndex
CREATE UNIQUE INDEX "MemberStrikeReasons_uniqueId_reason_key" ON "MemberStrikeReasons"("uniqueId", "reason");
