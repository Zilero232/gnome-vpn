-- How many clients and users a node is serving right now, as last probed.
ALTER TABLE "node" ADD COLUMN "online_clients" INTEGER,
ADD COLUMN "online_users" INTEGER;

-- The busiest minute of each node's UTC day: online clients (and when), distinct
-- users, and the CPU and memory peaks. The node-health job raises each value
-- with GREATEST every minute, so a row only ever holds the day's maximum.
CREATE TABLE "node_peak" (
    "node_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "clients" INTEGER,
    "clients_at" TIMESTAMPTZ(3),
    "users" INTEGER,
    "cpu" DOUBLE PRECISION,
    "memory" DOUBLE PRECISION,

    CONSTRAINT "node_peak_pkey" PRIMARY KEY ("node_id","day")
);

CREATE INDEX "node_peak_day_idx" ON "node_peak"("day");

ALTER TABLE "node_peak" ADD CONSTRAINT "node_peak_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
