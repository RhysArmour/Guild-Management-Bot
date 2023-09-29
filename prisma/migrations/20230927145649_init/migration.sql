-- CreateTable
CREATE TABLE "ServerTable" (
    "serverId" TEXT NOT NULL,
    "serverName" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerTable_pkey" PRIMARY KEY ("serverId")
);

-- CreateTable
CREATE TABLE "Members" (
    "uniqueId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strikes" INTEGER NOT NULL,
    "lifetimeStrikes" INTEGER NOT NULL,
    "absent" BOOLEAN NOT NULL,
    "currentAbsenceStartDate" TEXT,
    "previousAbsenceDuration" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Members_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "StrikeReasons" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "StrikeReasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strikes" (
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
CREATE TABLE "Tickets" (
    "serverId" TEXT NOT NULL,
    "ticketChannelName" TEXT NOT NULL,
    "ticketChannelId" TEXT NOT NULL,
    "ticketLimit" INTEGER NOT NULL,
    "triggerPhrase" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tickets_pkey" PRIMARY KEY ("serverId")
);

-- CreateTable
CREATE TABLE "GuildRole" (
    "serverId" TEXT NOT NULL,
    "guildRoleId" TEXT NOT NULL,
    "guildRoleName" TEXT NOT NULL,
    "absenceRoleId" TEXT NOT NULL,
    "absenceRoleName" TEXT NOT NULL,
    "strikeLimitRoleId" TEXT NOT NULL,
    "strikeLimitRoleName" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildRole_pkey" PRIMARY KEY ("serverId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServerTable_serverId_key" ON "ServerTable"("serverId");

-- CreateIndex
CREATE INDEX "idx_uniqueId" ON "Members"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "StrikeReasons_uniqueId_date_reason_key" ON "StrikeReasons"("uniqueId", "date", "reason");

-- CreateIndex
CREATE UNIQUE INDEX "Strikes_serverId_key" ON "Strikes"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "Strikes_strikeChannelId_key" ON "Strikes"("strikeChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "Strikes_strikeLimitChannelId_key" ON "Strikes"("strikeLimitChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "Tickets_serverId_key" ON "Tickets"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "Tickets_ticketChannelId_key" ON "Tickets"("ticketChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRole_serverId_key" ON "GuildRole"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRole_guildRoleId_key" ON "GuildRole"("guildRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRole_guildRoleName_key" ON "GuildRole"("guildRoleName");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRole_absenceRoleId_key" ON "GuildRole"("absenceRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRole_strikeLimitRoleId_key" ON "GuildRole"("strikeLimitRoleId");

-- AddForeignKey
ALTER TABLE "Members" ADD CONSTRAINT "Members_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerTable"("serverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrikeReasons" ADD CONSTRAINT "StrikeReasons_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "Members"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
