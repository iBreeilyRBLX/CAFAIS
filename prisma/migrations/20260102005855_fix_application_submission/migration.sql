-- Drop the existing ApplicationSubmission table due to incorrect foreign key reference
DROP TABLE IF EXISTS "ApplicationSubmission";

-- Create the new ApplicationSubmission table with correct references
CREATE TABLE "ApplicationSubmission" (
    "id" TEXT NOT NULL,
    "userDiscordId" TEXT NOT NULL,
    "submissionCount" INTEGER NOT NULL DEFAULT 1,
    "isPending" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationSubmission_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on userDiscordId to prevent duplicate pending applications
CREATE UNIQUE INDEX "ApplicationSubmission_userDiscordId_key" ON "ApplicationSubmission"("userDiscordId");

-- Create index on userDiscordId for faster queries
CREATE INDEX "ApplicationSubmission_userDiscordId_idx" ON "ApplicationSubmission"("userDiscordId");

-- Create index on isPending for faster filtering
CREATE INDEX "ApplicationSubmission_isPending_idx" ON "ApplicationSubmission"("isPending");

-- Add foreign key constraint to UserProfile
ALTER TABLE "ApplicationSubmission" ADD CONSTRAINT "ApplicationSubmission_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "UserProfile"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;
