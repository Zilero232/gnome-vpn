-- The share of probe connections to the node that did not complete, in percent, as
-- last measured by node-health. Null until the first probe.
ALTER TABLE "node" ADD COLUMN "packet_loss" INTEGER;
