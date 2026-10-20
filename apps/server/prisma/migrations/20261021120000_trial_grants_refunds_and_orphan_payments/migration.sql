-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'refunded';

-- A payment row outlives the account that made it.
ALTER TABLE "payment" DROP CONSTRAINT "payment_user_id_fkey";

ALTER TABLE "payment" ADD COLUMN "payment_method_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "payment_user_id_created_at_idx" ON "payment"("user_id", "created_at");

-- A trial is remembered by identity, not by account.
CREATE TABLE "trial_grant" (
    "identity_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "granted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trial_grant_pkey" PRIMARY KEY ("identity_hash")
);

-- Backfill: the identities of every account that has already had its trial.
-- Must hash exactly like trialIdentities (subscription/lib/trial-identity).
WITH "emails" AS (
    SELECT
        u."id" AS "user_id",
        s."trial_started_at",
        regexp_replace(substring(lower(trim(u."email")) FROM '^(.*)@[^@]*$'), '\+.*$', '') AS "local",
        substring(lower(trim(u."email")) FROM '@([^@]*)$') AS "domain"
    FROM "user" u
    JOIN "subscription" s ON s."user_id" = u."id"
    WHERE s."trial_started_at" IS NOT NULL
)
INSERT INTO "trial_grant" ("identity_hash", "user_id", "granted_at")
SELECT
    encode(sha256(convert_to('email:' || CASE
        WHEN "domain" IN ('gmail.com', 'googlemail.com') THEN replace("local", '.', '') || '@gmail.com'
        ELSE "local" || '@' || "domain"
    END, 'UTF8')), 'hex'),
    "user_id",
    "trial_started_at"
FROM "emails"
WHERE "domain" IS NOT NULL
  AND "domain" <> 'placeholder.invalid'
  AND "domain" NOT LIKE '%.placeholder.invalid'
ON CONFLICT ("identity_hash") DO NOTHING;

INSERT INTO "trial_grant" ("identity_hash", "user_id", "granted_at")
SELECT
    encode(sha256(convert_to('telegram:' || t."telegram_id"::text, 'UTF8')), 'hex'),
    t."user_id",
    s."trial_started_at"
FROM "telegram_account" t
JOIN "subscription" s ON s."user_id" = t."user_id"
WHERE s."trial_started_at" IS NOT NULL
ON CONFLICT ("identity_hash") DO NOTHING;
