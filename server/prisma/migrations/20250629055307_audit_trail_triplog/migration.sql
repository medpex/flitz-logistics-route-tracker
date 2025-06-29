/*
  Warnings:

  - Added the required column `businessPartner` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "businessPartner" TEXT NOT NULL,
ADD COLUMN     "detourReason" TEXT;

-- CreateTable
CREATE TABLE "TripLog" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "startLocation" TEXT NOT NULL,
    "stations" TEXT[],
    "endLocation" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "businessPartner" TEXT NOT NULL,
    "detourReason" TEXT,
    "status" TEXT NOT NULL,
    "appointmentId" TEXT,
    "startKm" INTEGER,
    "startTime" TEXT,
    "endKm" INTEGER,
    "endTime" TEXT,
    "totalDistance" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,

    CONSTRAINT "TripLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TripLog" ADD CONSTRAINT "TripLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
