-- CreateTable
CREATE TABLE "TrainingEventLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingEventLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrainingEventLog" ADD CONSTRAINT "TrainingEventLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
