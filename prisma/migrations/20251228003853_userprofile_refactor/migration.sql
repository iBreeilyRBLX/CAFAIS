/*
  Warnings:

  - You are about to drop the column `userId` on the `Award` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EventAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LOA` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RankCooldown` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RankLock` table. All the data in the column will be lost.
  - The primary key for the `UserProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avatar` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userDiscordId,eventId]` on the table `EventAttendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId,userDiscordId]` on the table `EventParticipant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userDiscordId,rank]` on the table `RankCooldown` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userDiscordId,rank]` on the table `RankLock` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userDiscordId` to the `Award` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userDiscordId` to the `EventAttendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userDiscordId` to the `EventParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userDiscordId` to the `LOA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userDiscordId` to the `RankCooldown` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userDiscordId` to the `RankLock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Award" DROP CONSTRAINT "Award_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "LOA" DROP CONSTRAINT "LOA_userId_fkey";

-- DropForeignKey
ALTER TABLE "RankCooldown" DROP CONSTRAINT "RankCooldown_userId_fkey";

-- DropForeignKey
ALTER TABLE "RankLock" DROP CONSTRAINT "RankLock_userId_fkey";

-- DropIndex
DROP INDEX "Award_userId_idx";

-- DropIndex
DROP INDEX "EventAttendance_userId_eventId_key";

-- DropIndex
DROP INDEX "EventAttendance_userId_idx";

-- DropIndex
DROP INDEX "EventParticipant_eventId_userId_key";

-- DropIndex
DROP INDEX "EventParticipant_userId_idx";

-- DropIndex
DROP INDEX "LOA_userId_idx";

-- DropIndex
DROP INDEX "RankCooldown_userId_idx";

-- DropIndex
DROP INDEX "RankCooldown_userId_rank_key";

-- DropIndex
DROP INDEX "RankLock_userId_idx";

-- DropIndex
DROP INDEX "RankLock_userId_rank_key";

-- DropIndex
DROP INDEX "UserProfile_discordId_idx";

-- DropIndex
DROP INDEX "UserProfile_discordId_key";

-- AlterTable
ALTER TABLE "Award" DROP COLUMN "userId",
ADD COLUMN     "userDiscordId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EventAttendance" DROP COLUMN "userId",
ADD COLUMN     "userDiscordId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EventParticipant" DROP COLUMN "userId",
ADD COLUMN     "userDiscordId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LOA" DROP COLUMN "userId",
ADD COLUMN     "userDiscordId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RankCooldown" DROP COLUMN "userId",
ADD COLUMN     "userDiscordId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RankLock" DROP COLUMN "userId",
ADD COLUMN     "userDiscordId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_pkey",
DROP COLUMN "avatar",
DROP COLUMN "id",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "robloxDisplayName" TEXT,
ADD COLUMN     "robloxUserId" TEXT,
ADD COLUMN     "robloxUsername" TEXT,
ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("discordId");

-- CreateIndex
CREATE INDEX "Award_userDiscordId_idx" ON "Award"("userDiscordId");

-- CreateIndex
CREATE INDEX "EventAttendance_userDiscordId_idx" ON "EventAttendance"("userDiscordId");

-- CreateIndex
CREATE UNIQUE INDEX "EventAttendance_userDiscordId_eventId_key" ON "EventAttendance"("userDiscordId", "eventId");

-- CreateIndex
CREATE INDEX "EventParticipant_userDiscordId_idx" ON "EventParticipant"("userDiscordId");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_eventId_userDiscordId_key" ON "EventParticipant"("eventId", "userDiscordId");

-- CreateIndex
CREATE INDEX "LOA_userDiscordId_idx" ON "LOA"("userDiscordId");

-- CreateIndex
CREATE INDEX "RankCooldown_userDiscordId_idx" ON "RankCooldown"("userDiscordId");

-- CreateIndex
CREATE UNIQUE INDEX "RankCooldown_userDiscordId_rank_key" ON "RankCooldown"("userDiscordId", "rank");

-- CreateIndex
CREATE INDEX "RankLock_userDiscordId_idx" ON "RankLock"("userDiscordId");

-- CreateIndex
CREATE UNIQUE INDEX "RankLock_userDiscordId_rank_key" ON "RankLock"("userDiscordId", "rank");

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "UserProfile"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "UserProfile"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LOA" ADD CONSTRAINT "LOA_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "UserProfile"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankCooldown" ADD CONSTRAINT "RankCooldown_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "UserProfile"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankLock" ADD CONSTRAINT "RankLock_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "UserProfile"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "UserProfile"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;
