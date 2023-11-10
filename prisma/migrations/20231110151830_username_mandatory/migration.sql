/*
  Warnings:

  - Made the column `username` on table `GuildMembersTable` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GuildMembersTable" ALTER COLUMN "username" SET NOT NULL;
