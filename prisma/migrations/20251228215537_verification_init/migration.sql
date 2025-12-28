-- CreateTable
CREATE TABLE "VerifiedUser" (
    "discordId" TEXT NOT NULL,
    "robloxId" BIGINT NOT NULL,
    "robloxUsername" TEXT NOT NULL,
    "robloxDisplayName" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifiedUser_pkey" PRIMARY KEY ("discordId")
);

-- CreateTable
CREATE TABLE "OauthState" (
    "id" TEXT NOT NULL,
    "stateToken" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordUserTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '10 minutes',

    CONSTRAINT "OauthState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OauthState_stateToken_key" ON "OauthState"("stateToken");
