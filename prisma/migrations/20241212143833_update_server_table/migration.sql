/*
  Warnings:

  - A unique constraint covering the columns `[playerId]` on the table `GuildMembersTable` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GuildMembersTable" ADD COLUMN     "allyCode" TEXT,
ADD COLUMN     "playerId" TEXT,
ADD COLUMN     "playerName" TEXT;

-- AlterTable
ALTER TABLE "ServerTable" ADD COLUMN     "guildId" TEXT,
ADD COLUMN     "guildName" TEXT,
ADD COLUMN     "guildResetTime" TIMESTAMP(3),
ADD COLUMN     "ticketStrikesActive" BOOLEAN DEFAULT true,
ALTER COLUMN "strikeResetPeriod" SET DATA TYPE TEXT;

-- Migrate old data into ISO 8601 format
UPDATE "ServerTable" SET "strikeResetPeriod" = CONCAT('P', "strikeResetPeriod", 'W');


-- CreateIndex
CREATE UNIQUE INDEX "GuildMembersTable_playerId_key" ON "GuildMembersTable"("playerId");
