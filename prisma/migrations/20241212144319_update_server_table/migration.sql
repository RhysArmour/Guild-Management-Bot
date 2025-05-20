-- DropIndex
DROP INDEX "GuildMembersTable_playerId_key";

-- AlterTable
ALTER TABLE "ServerTable" ALTER COLUMN "strikeResetPeriod" DROP DEFAULT;
