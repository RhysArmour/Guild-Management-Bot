/*
  Warnings:

  - You are about to drop the `Members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StrikeReasons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Strikes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tickets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Members" DROP CONSTRAINT "Members_serverId_fkey";

-- DropForeignKey
ALTER TABLE "StrikeReasons" DROP CONSTRAINT "StrikeReasons_uniqueId_fkey";

-- DropTable
DROP TABLE "Members";

-- DropTable
DROP TABLE "StrikeReasons";

-- DropTable
DROP TABLE "Strikes";

-- DropTable
DROP TABLE "Tickets";

-- CreateTable
CREATE TABLE "GuildMembersTable" (
    "uniqueId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strikes" INTEGER NOT NULL,
    "lifetimeStrikes" INTEGER NOT NULL,
    "absent" BOOLEAN NOT NULL,
    "currentAbsenceStartDate" TIMESTAMP(3),
    "totalAbsenceDuration" INTEGER,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildMembersTable_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "MemberStrikeReasons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "MemberStrikeReasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildStrikesTable" (
    "serverId" TEXT NOT NULL,
    "strikeChannelName" TEXT NOT NULL,
    "strikeChannelId" TEXT NOT NULL,
    "strikeLimitChannelName" TEXT NOT NULL,
    "strikeLimitChannelId" TEXT NOT NULL,
    "strikeLimit" INTEGER NOT NULL,
    "strikeResetPeriod" TEXT,
    "lastStrikeReset" TIMESTAMP(3),
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "GuildStrikeValues" (
    "serverId" TEXT NOT NULL,
    "strikeReason" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "GuildTicketsTable" (
    "serverId" TEXT NOT NULL,
    "ticketChannelName" TEXT NOT NULL,
    "ticketChannelId" TEXT NOT NULL,
    "ticketLimit" INTEGER NOT NULL,
    "triggerPhrase" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildTicketsTable_pkey" PRIMARY KEY ("serverId")
);

-- CreateIndex
CREATE INDEX "idx_uniqueId" ON "GuildMembersTable"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberStrikeReasons_uniqueId_date_reason_key" ON "MemberStrikeReasons"("uniqueId", "date", "reason");

-- CreateIndex
CREATE UNIQUE INDEX "GuildStrikesTable_serverId_key" ON "GuildStrikesTable"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildStrikesTable_strikeChannelId_key" ON "GuildStrikesTable"("strikeChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildStrikesTable_strikeLimitChannelId_key" ON "GuildStrikesTable"("strikeLimitChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildStrikeValues_serverId_key" ON "GuildStrikeValues"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildTicketsTable_serverId_key" ON "GuildTicketsTable"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildTicketsTable_ticketChannelId_key" ON "GuildTicketsTable"("ticketChannelId");

-- AddForeignKey
ALTER TABLE "GuildMembersTable" ADD CONSTRAINT "GuildMembersTable_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerTable"("serverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberStrikeReasons" ADD CONSTRAINT "MemberStrikeReasons_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "GuildMembersTable"("uniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildStrikeValues" ADD CONSTRAINT "GuildStrikeValues_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "GuildStrikesTable"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;
