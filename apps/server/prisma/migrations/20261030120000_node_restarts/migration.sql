-- When the node's host booted and when its xray core started, as last probed.
-- The node-health job compares each probe against these to tell a reboot or a
-- core restart (every session on the node drops) apart from a quiet minute.
ALTER TABLE "node" ADD COLUMN "booted_at" TIMESTAMPTZ(3),
ADD COLUMN "core_started_at" TIMESTAMPTZ(3);
