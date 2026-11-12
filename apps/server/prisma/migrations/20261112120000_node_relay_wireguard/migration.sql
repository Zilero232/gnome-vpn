-- The relay port that forwards to this node's WireGuard (udp 51820). Null for a
-- node whose relay carries only the 443 tunnels.
ALTER TABLE "node" ADD COLUMN "relay_wireguard_port" INTEGER;
