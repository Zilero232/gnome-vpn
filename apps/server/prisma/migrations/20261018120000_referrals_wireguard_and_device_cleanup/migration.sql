-- CreateEnum
CREATE TYPE "ReferralSource" AS ENUM ('web', 'telegram');

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN "bonus_days" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "referral_code" (
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_code_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "referral" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "referrer_id" TEXT NOT NULL,
    "referred_id" TEXT NOT NULL,
    "source" "ReferralSource" NOT NULL,
    "payment_id" TEXT,
    "referrer_days" INTEGER NOT NULL DEFAULT 0,
    "friend_days" INTEGER NOT NULL DEFAULT 0,
    "rewarded_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "referral_not_self" CHECK ("referrer_id" <> "referred_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_code_code_key" ON "referral_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "referral_referred_id_key" ON "referral"("referred_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_payment_id_key" ON "referral"("payment_id");

-- CreateIndex
CREATE INDEX "referral_referrer_id_rewarded_at_idx" ON "referral"("referrer_id", "rewarded_at");

-- AddForeignKey
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A browser or a messenger's link preview fetching the feed registered as a device and held a slot.
CREATE TEMP TABLE non_client_device AS
SELECT "id" FROM "device"
WHERE "hwid" IS NULL
  AND "key" IN (
    'app:mozilla',
    'app:telegrambot',
    'app:whatsapp',
    'app:facebookexternalhit',
    'app:twitterbot',
    'app:slackbot-linkexpanding',
    'app:vkshare',
    'app:viber',
    'app:skypeuripreview'
  );

UPDATE "peer"
SET "revoked_at" = CURRENT_TIMESTAMP, "state" = 'disabled'
WHERE "device_id" IN (SELECT "id" FROM non_client_device)
  AND "revoked_at" IS NULL;

DELETE FROM "device" WHERE "id" IN (SELECT "id" FROM non_client_device);

DROP TABLE non_client_device;

-- AlterTable
ALTER TABLE "node" ADD COLUMN "wg_public_key" TEXT;

-- AlterTable
ALTER TABLE "peer" ADD COLUMN "tunnel_address" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "peer_node_id_tunnel_address_key" ON "peer"("node_id", "tunnel_address");
