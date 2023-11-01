/*
  Warnings:

  - You are about to drop the column `guildChannelsTableServerId` on the `GuildStrikeValues` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uniqueId]` on the table `GuildStrikeValues` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uniqueId` to the `GuildStrikeValues` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GuildStrikeValues_serverId_key";

-- AlterTable
ALTER TABLE "GuildStrikeValues" DROP COLUMN "guildChannelsTableServerId",
ADD COLUMN     "uniqueId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GuildStrikeValues_uniqueId_key" ON "GuildStrikeValues"("uniqueId");
