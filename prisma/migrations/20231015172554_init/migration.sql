/*
  Warnings:

  - You are about to drop the `GuildStrikesTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuildTicketsTable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `serverName` to the `GuildMembersTable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GuildMembersTable" DROP CONSTRAINT "GuildMembersTable_serverId_fkey";

-- DropForeignKey
ALTER TABLE "GuildStrikeValues" DROP CONSTRAINT "GuildStrikeValues_serverId_fkey";

-- AlterTable
ALTER TABLE "GuildMembersTable" ADD COLUMN     "serverName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GuildStrikeValues" ADD COLUMN     "guildChannelsTableServerId" TEXT;

-- AlterTable
ALTER TABLE "ServerTable" ADD COLUMN     "lastStrikeReset" TIMESTAMP(3),
ADD COLUMN     "strikeResetPeriod" TEXT,
ADD COLUMN     "triggerPhrase" TEXT;

-- DropTable
DROP TABLE "GuildStrikesTable";

-- DropTable
DROP TABLE "GuildTicketsTable";

-- CreateTable
CREATE TABLE "GuildChannelsTable" (
    "serverId" TEXT NOT NULL,
    "strikeChannelName" TEXT NOT NULL,
    "strikeChannelId" TEXT NOT NULL,
    "strikeLimitChannelName" TEXT NOT NULL,
    "strikeLimitChannelId" TEXT NOT NULL,
    "ticketChannelName" TEXT NOT NULL,
    "ticketChannelId" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "GuildLimitsTable" (
    "serverId" TEXT NOT NULL,
    "ticketLimit" INTEGER NOT NULL,
    "strikeLimit" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildLimitsTable_pkey" PRIMARY KEY ("serverId")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildChannelsTable_serverId_key" ON "GuildChannelsTable"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildChannelsTable_strikeChannelId_key" ON "GuildChannelsTable"("strikeChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildChannelsTable_strikeLimitChannelId_key" ON "GuildChannelsTable"("strikeLimitChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildChannelsTable_ticketChannelId_key" ON "GuildChannelsTable"("ticketChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildLimitsTable_serverId_key" ON "GuildLimitsTable"("serverId");

-- AddForeignKey
ALTER TABLE "GuildChannelsTable" ADD CONSTRAINT "GuildChannelsTable_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerTable"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildLimitsTable" ADD CONSTRAINT "GuildLimitsTable_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerTable"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildRolesTable" ADD CONSTRAINT "GuildRolesTable_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerTable"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildStrikeValues" ADD CONSTRAINT "GuildStrikeValues_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerTable"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMembersTable" ADD CONSTRAINT "GuildMembersTable_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerTable"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;
