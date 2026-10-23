-- AlterTable
ALTER TABLE "node" ADD COLUMN     "is_overloaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_checked_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "node_uptime" (
    "node_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "checked_minutes" INTEGER NOT NULL DEFAULT 0,
    "up_minutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "node_uptime_pkey" PRIMARY KEY ("node_id","day")
);

-- CreateIndex
CREATE INDEX "node_uptime_day_idx" ON "node_uptime"("day");

-- AddForeignKey
ALTER TABLE "node_uptime" ADD CONSTRAINT "node_uptime_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
