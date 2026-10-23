-- One row per notice a job has claimed: who, which claim, and what it was
-- about. Inserting the row is the claim — a second run hits the primary key and
-- sends nothing. It replaces claim columns that had been added to the rows the
-- notices are about.
CREATE TABLE "notice_log" (
    "user_id" TEXT NOT NULL,
    "notice" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notice_log_pkey" PRIMARY KEY ("user_id","notice","ref")
);

CREATE INDEX "notice_log_notice_sent_at_idx" ON "notice_log"("notice", "sent_at");

ALTER TABLE "notice_log" ADD CONSTRAINT "notice_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A ref that is a moment is written exactly as JavaScript's toISOString()
-- writes it, which is how the jobs build it.
INSERT INTO "notice_log" ("user_id", "notice", "ref", "sent_at")
SELECT "user_id", 'periodReminder', to_char("reminder_sent_for" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), "updated_at"
FROM "subscription"
WHERE "reminder_sent_for" IS NOT NULL;

INSERT INTO "notice_log" ("user_id", "notice", "ref", "sent_at")
SELECT "user_id", 'winBackTouch' || "win_back_touch", to_char("win_back_for" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), "updated_at"
FROM "subscription"
WHERE "win_back_for" IS NOT NULL AND "win_back_touch" IN (1, 2);

INSERT INTO "notice_log" ("user_id", "notice", "ref", "sent_at")
SELECT "user_id", 'firstDevice', 'ever', "first_device_at"
FROM "subscription"
WHERE "first_device_at" IS NOT NULL;

INSERT INTO "notice_log" ("user_id", "notice", "ref", "sent_at")
SELECT "user_id", 'checkoutReminder', "id", "reminded_at"
FROM "payment"
WHERE "reminded_at" IS NOT NULL AND "user_id" IS NOT NULL;

ALTER TABLE "payment" DROP COLUMN "reminded_at";

ALTER TABLE "subscription" DROP COLUMN "first_device_at",
DROP COLUMN "reminder_sent_for",
DROP COLUMN "win_back_for",
DROP COLUMN "win_back_touch";
