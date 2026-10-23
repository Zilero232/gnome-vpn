-- A system campaign code granted by the win-back job rather than typed by a
-- reader. Manual redemption refuses it as if it did not exist.
ALTER TABLE "promo_code" ADD COLUMN "is_automatic" BOOLEAN NOT NULL DEFAULT false;

-- The period end the win-back touches were sent for, and the last touch sent.
-- A new period moves the end, so comparing the two re-arms the touches for the
-- next lapse without sending a touch twice for this one.
ALTER TABLE "subscription" ADD COLUMN "win_back_for" TIMESTAMPTZ(3),
ADD COLUMN "win_back_touch" INTEGER NOT NULL DEFAULT 0;

-- When the reader blocked the bot, as Telegram last told us; cleared when they
-- come back. A blocked chat with no deliverable email is not worth a touch.
ALTER TABLE "telegram_account" ADD COLUMN "blocked_at" TIMESTAMPTZ(3);
