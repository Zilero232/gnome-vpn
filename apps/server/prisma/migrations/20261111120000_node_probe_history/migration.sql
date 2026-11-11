-- The last time the node's relay let the probe through. The feed serves the node
-- directly while the relay is down; the readings themselves live in node_probe.
ALTER TABLE "node" ADD COLUMN "relay_healthy_at" TIMESTAMPTZ(3);

-- One row per node and minute: the packet loss to the node and through its relay,
-- kept for a week so a "it dropped at 21:40" report can be checked afterwards.
CREATE TABLE "node_probe" (
    "node_id" TEXT NOT NULL,
    "at" TIMESTAMPTZ(3) NOT NULL,
    "packet_loss" INTEGER,
    "relay_packet_loss" INTEGER,

    CONSTRAINT "node_probe_pkey" PRIMARY KEY ("node_id","at")
);

CREATE INDEX "node_probe_at_idx" ON "node_probe"("at");

ALTER TABLE "node_probe" ADD CONSTRAINT "node_probe_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
