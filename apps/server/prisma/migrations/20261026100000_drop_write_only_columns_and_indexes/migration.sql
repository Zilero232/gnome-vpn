-- Two nodes on one host, or two in one country, would make provisioning and
-- the node sync update the wrong row (both match by host, and the panel token
-- is named after the country code). Refuse to go on with a message that names
-- the duplicates instead of a bare unique-index error.
DO $$
DECLARE
  duplicates TEXT;
BEGIN
  SELECT string_agg(format('host %s (%s rows)', "host", n), ', ')
  INTO duplicates
  FROM (SELECT "host", count(*) AS n FROM "node" GROUP BY "host" HAVING count(*) > 1) AS d;

  IF duplicates IS NOT NULL THEN
    RAISE EXCEPTION 'node.host must be unique before this migration: %. Delete or merge the duplicate node rows, then deploy again.', duplicates;
  END IF;

  SELECT string_agg(format('country_code %s (%s rows)', "country_code", n), ', ')
  INTO duplicates
  FROM (SELECT "country_code", count(*) AS n FROM "node" GROUP BY "country_code" HAVING count(*) > 1) AS d;

  IF duplicates IS NOT NULL THEN
    RAISE EXCEPTION 'node.country_code must be unique before this migration: %. Delete or merge the duplicate node rows, then deploy again.', duplicates;
  END IF;
END $$;

CREATE UNIQUE INDEX "node_host_key" ON "node"("host");

CREATE UNIQUE INDEX "node_country_code_key" ON "node"("country_code");

-- Write-only columns: provisioning stored the inbound's seed password, the
-- registry stored the hardware id the device key already carries, and an
-- invite stored where it was claimed. Nothing ever read any of them.
ALTER TABLE "node" DROP COLUMN "hysteria_auth";

ALTER TABLE "device" DROP COLUMN "hwid";

ALTER TABLE "referral" DROP COLUMN "source";

DROP TYPE "ReferralSource";

-- peer(user_id) is covered by the unique index that starts with user_id, and
-- peer(node_id, ...) by the unique (node_id, tunnel_address). expired-access
-- selects owners by state, which is what the new index serves.
DROP INDEX "peer_user_id_idx";

DROP INDEX "peer_node_id_state_idx";

CREATE INDEX "peer_state_user_id_idx" ON "peer"("state", "user_id");

-- Campaign revenue joins payments by their code, and the admin lists codes of
-- one kind newest first.
CREATE INDEX "payment_promo_code_id_idx" ON "payment"("promo_code_id");

CREATE INDEX "promo_code_kind_created_at_idx" ON "promo_code"("kind", "created_at");
