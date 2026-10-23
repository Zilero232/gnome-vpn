-- What an admin did, by whom and to which account: one row per write in the
-- web admin panel. The target is a plain id, not a foreign key, so the record
-- outlives the account it was about. Nothing reads it yet.
CREATE TABLE "admin_action" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "admin_email" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_user_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_action_pkey" PRIMARY KEY ("id")
);

-- Consents to the processing of personal data (152-FZ) and to promotional
-- messages (38-FZ art. 18). Append-only: the latest row of a kind is the
-- current state, the rows before it are the history. No row is backfilled —
-- an account created before this has given no recorded consent, so it gets no
-- offers until it opts in.
CREATE TYPE "ConsentKind" AS ENUM ('personalData', 'marketing');

CREATE TYPE "ConsentSource" AS ENUM ('signup', 'telegram', 'account', 'bot', 'email');

CREATE TABLE "consent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "kind" "ConsentKind" NOT NULL,
    "version" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "source" "ConsentSource" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "consent_user_id_kind_created_at_idx" ON "consent"("user_id", "kind", "created_at");

ALTER TABLE "consent" ADD CONSTRAINT "consent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
