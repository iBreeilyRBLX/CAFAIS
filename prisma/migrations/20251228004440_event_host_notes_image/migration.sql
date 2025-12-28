/*
  Warnings:

  - You are about to drop the column `joinedAt` on the `EventParticipant` table. All the data in the column will be lost.
  - Added the required column `eventHostDiscordId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventHostDiscordId" TEXT NOT NULL,
ADD COLUMN     "imageLink" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "EventParticipant" DROP COLUMN "joinedAt";
