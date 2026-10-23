-- When an abandoned checkout was reminded about. A payment is reminded about
-- at most once, and an account at most once a day.
ALTER TABLE "payment" ADD COLUMN "reminded_at" TIMESTAMPTZ(3);
