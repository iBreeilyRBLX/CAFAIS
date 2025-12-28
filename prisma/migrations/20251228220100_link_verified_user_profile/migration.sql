/*
  Warnings:

  - You are about to drop the column `robloxDisplayName` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `robloxUserId` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `robloxUsername` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OauthState" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '10 minutes';

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "robloxDisplayName",
DROP COLUMN "robloxUserId",
DROP COLUMN "robloxUsername";

-- AddForeignKey
ALTER TABLE "VerifiedUser" ADD CONSTRAINT "VerifiedUser_discordId_fkey" FOREIGN KEY ("discordId") REFERENCES "UserProfile"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;
