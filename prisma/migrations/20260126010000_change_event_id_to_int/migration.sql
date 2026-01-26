-- Change Event.id from UUID to sequential integer

-- Add new integer id column and populate it in chronological order
ALTER TABLE "Event" ADD COLUMN "id_int" INTEGER;

CREATE SEQUENCE IF NOT EXISTS "Event_id_int_seq";

WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY "startTime" ASC, id ASC) AS rn
    FROM "Event"
)
UPDATE "Event" e
SET "id_int" = ordered.rn
FROM ordered
WHERE e.id = ordered.id;

SELECT setval('"Event_id_int_seq"', COALESCE((SELECT MAX("id_int") FROM "Event"), 0));

ALTER TABLE "Event" ALTER COLUMN "id_int" SET DEFAULT nextval('"Event_id_int_seq"');
ALTER TABLE "Event" ALTER COLUMN "id_int" SET NOT NULL;

-- Add new integer eventId to EventParticipant and populate
ALTER TABLE "EventParticipant" ADD COLUMN "eventId_int" INTEGER;
UPDATE "EventParticipant" ep
SET "eventId_int" = e."id_int"
FROM "Event" e
WHERE ep."eventId" = e."id";
ALTER TABLE "EventParticipant" ALTER COLUMN "eventId_int" SET NOT NULL;

-- Drop constraints/indexes using old id
ALTER TABLE "EventParticipant" DROP CONSTRAINT IF EXISTS "EventParticipant_eventId_fkey";
ALTER TABLE "EventParticipant" DROP CONSTRAINT IF EXISTS "EventParticipant_eventId_userDiscordId_key";
DROP INDEX IF EXISTS "EventParticipant_eventId_idx";

ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_pkey";

-- Remove old columns
ALTER TABLE "EventParticipant" DROP COLUMN "eventId";
ALTER TABLE "Event" DROP COLUMN "id";

-- Remove eventNumber column/index from prior migration
ALTER TABLE "Event" DROP COLUMN IF EXISTS "eventNumber";
DROP INDEX IF EXISTS "Event_eventNumber_key";

-- Rename new columns to expected names
ALTER TABLE "Event" RENAME COLUMN "id_int" TO "id";
ALTER TABLE "EventParticipant" RENAME COLUMN "eventId_int" TO "eventId";

-- Recreate primary/foreign keys and indexes
ALTER TABLE "Event" ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "EventParticipant_eventId_userDiscordId_key" ON "EventParticipant"("eventId", "userDiscordId");
CREATE INDEX "EventParticipant_eventId_idx" ON "EventParticipant"("eventId");

ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
