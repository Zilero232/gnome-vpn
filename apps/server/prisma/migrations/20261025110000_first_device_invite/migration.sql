-- When the account's first device ever was announced. The device registry
-- forgets removed devices, so "first ever" needs a mark of its own.
ALTER TABLE "subscription" ADD COLUMN "first_device_at" TIMESTAMPTZ(3);

-- Accounts that already have a device, or whose link a client has fetched, are
-- past their first device.
UPDATE "subscription" AS s
SET "first_device_at" = d."first_at"
FROM (SELECT "user_id", min("created_at") AS "first_at" FROM "device" GROUP BY "user_id") AS d
WHERE s."user_id" = d."user_id";

UPDATE "subscription" AS s
SET "first_device_at" = l."last_seen_at"
FROM "subscription_link" AS l
WHERE s."user_id" = l."user_id"
  AND s."first_device_at" IS NULL
  AND l."last_seen_at" IS NOT NULL;
