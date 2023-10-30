/*
  Warnings:

  - You are about to drop the `GuildRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "GuildRole";

-- CreateTable
CREATE TABLE "GuildRolesTable" (
    "serverId" TEXT NOT NULL,
    "guildRoleId" TEXT NOT NULL,
    "guildRoleName" TEXT NOT NULL,
    "absenceRoleId" TEXT NOT NULL,
    "absenceRoleName" TEXT NOT NULL,
    "strikeLimitRoleId" TEXT NOT NULL,
    "strikeLimitRoleName" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildRolesTable_pkey" PRIMARY KEY ("serverId")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildRolesTable_serverId_key" ON "GuildRolesTable"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRolesTable_guildRoleId_key" ON "GuildRolesTable"("guildRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRolesTable_guildRoleName_key" ON "GuildRolesTable"("guildRoleName");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRolesTable_absenceRoleId_key" ON "GuildRolesTable"("absenceRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRolesTable_strikeLimitRoleId_key" ON "GuildRolesTable"("strikeLimitRoleId");
