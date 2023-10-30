-- DropForeignKey
ALTER TABLE "StrikeReasons" DROP CONSTRAINT "StrikeReasons_uniqueId_fkey";

-- AddForeignKey
ALTER TABLE "StrikeReasons" ADD CONSTRAINT "StrikeReasons_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "Members"("uniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
