-- The Russian relay that forwards this node's 443 (tcp and udp) from one of its
-- own ports. Both are null for a node no relay serves.
ALTER TABLE "node" ADD COLUMN "relay_host" TEXT,
ADD COLUMN "relay_port" INTEGER;
