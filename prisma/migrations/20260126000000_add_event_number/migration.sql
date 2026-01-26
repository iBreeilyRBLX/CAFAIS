-- Add sequential event number to Event

ALTER TABLE "Event" ADD COLUMN "eventNumber" INTEGER;

CREATE SEQUENCE IF NOT EXISTS "Event_eventNumber_seq";

WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY "startTime" ASC, id ASC) AS rn
    FROM "Event"
)
UPDATE "Event" e
SET "eventNumber" = ordered.rn
FROM ordered
WHERE e.id = ordered.id;

SELECT setval('"Event_eventNumber_seq"', COALESCE((SELECT MAX("eventNumber") FROM "Event"), 0));

ALTER TABLE "Event" ALTER COLUMN "eventNumber" SET DEFAULT nextval('"Event_eventNumber_seq"');
ALTER TABLE "Event" ALTER COLUMN "eventNumber" SET NOT NULL;

CREATE UNIQUE INDEX "Event_eventNumber_key" ON "Event"("eventNumber");
