-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('info', 'warning', 'critical');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "sourceIp" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_observedAt_idx" ON "Event"("observedAt");

-- CreateIndex
CREATE INDEX "Event_algorithm_idx" ON "Event"("algorithm");

-- CreateIndex
CREATE INDEX "Event_assetType_idx" ON "Event"("assetType");

-- CreateIndex
CREATE INDEX "Event_assetId_idx" ON "Event"("assetId");

-- CreateIndex
CREATE INDEX "Event_assetId_algorithm_idx" ON "Event"("assetId", "algorithm");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_sourceIp_idx" ON "Event"("sourceIp");
