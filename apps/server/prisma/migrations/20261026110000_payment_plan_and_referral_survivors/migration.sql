-- Extra places are not a plan. The default stamped every extra-devices
-- payment `monthly`, so a filter or a chart by plan counted them as monthly
-- subscriptions. The plan is now null exactly on extra-devices payments.
ALTER TABLE "payment" ALTER COLUMN "plan" DROP DEFAULT,
ALTER COLUMN "plan" DROP NOT NULL;

UPDATE "payment" SET "plan" = NULL WHERE "kind" = 'extraDevices';

ALTER TABLE "payment" ADD CONSTRAINT "payment_plan_kind" CHECK (("kind" = 'extraDevices') = ("plan" IS NULL));

-- A referral outlives either account. Deleting the friend used to take the
-- row with it, which freed the inviter's cap window and left a later refund of
-- the friend's payment nothing to take back; deleting the inviter did the same
-- to the friend's days. The side that is gone becomes null instead.
ALTER TABLE "referral" DROP CONSTRAINT "referral_referred_id_fkey";

ALTER TABLE "referral" DROP CONSTRAINT "referral_referrer_id_fkey";

ALTER TABLE "referral" ALTER COLUMN "referrer_id" DROP NOT NULL,
ALTER COLUMN "referred_id" DROP NOT NULL;

ALTER TABLE "referral" ADD CONSTRAINT "referral_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "referral" ADD CONSTRAINT "referral_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
