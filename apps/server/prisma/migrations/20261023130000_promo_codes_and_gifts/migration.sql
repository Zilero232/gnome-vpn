-- CreateEnum
CREATE TYPE "PromoCodeKind" AS ENUM ('discount', 'days', 'gift');

-- AlterEnum
ALTER TYPE "PaymentKind" ADD VALUE 'gift';

-- A discounted payment records the code and the percent it was priced with.
ALTER TABLE "payment" ADD COLUMN     "discount_percent" INTEGER,
ADD COLUMN     "promo_code_id" TEXT;

-- CreateTable
CREATE TABLE "promo_code" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "kind" "PromoCodeKind" NOT NULL,
    "percent" INTEGER,
    "days" INTEGER,
    "max_uses" INTEGER,
    "expires_at" TIMESTAMPTZ(3),
    "plan" "SubscriptionPlan",
    "buyer_id" TEXT,
    "payment_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_code_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "promo_code_effect" CHECK ((("kind" = 'discount') = ("percent" IS NOT NULL)) AND (("kind" = 'discount') = ("days" IS NULL))),
    CONSTRAINT "promo_code_max_uses" CHECK ("max_uses" IS NULL OR "max_uses" > 0)
);

-- CreateTable
CREATE TABLE "promo_redemption" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "promo_code_id" TEXT NOT NULL,
    "user_id" TEXT,
    "identity_hashes" TEXT[],
    "replaced_at" TIMESTAMPTZ(3),
    "consumed_at" TIMESTAMPTZ(3),
    "payment_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_redemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_code_code_key" ON "promo_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "promo_code_payment_id_key" ON "promo_code"("payment_id");

-- CreateIndex
CREATE INDEX "promo_code_buyer_id_created_at_idx" ON "promo_code"("buyer_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "promo_redemption_payment_id_key" ON "promo_redemption"("payment_id");

-- CreateIndex
CREATE INDEX "promo_redemption_user_id_created_at_idx" ON "promo_redemption"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "promo_redemption_promo_code_id_user_id_key" ON "promo_redemption"("promo_code_id", "user_id");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code" ADD CONSTRAINT "promo_code_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code" ADD CONSTRAINT "promo_code_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_redemption" ADD CONSTRAINT "promo_redemption_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_code"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_redemption" ADD CONSTRAINT "promo_redemption_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_redemption" ADD CONSTRAINT "promo_redemption_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
