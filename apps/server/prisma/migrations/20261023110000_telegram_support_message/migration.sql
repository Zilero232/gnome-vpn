-- A support message from a user is posted to the owner's admin chat as a
-- header and a copy of the original. A reply to either is copied back to the
-- user, so both admin-chat messages are remembered against the chat they came
-- from. The rows outlive a restart, which an in-memory map would not, and the
-- support-threads job prunes them after 90 days.
--
-- The key is the admin chat and the message in it: a message id is unique only
-- within its chat, and a new TELEGRAM_ADMIN_CHAT_ID starts a fresh numbering.
-- The user is stored as the Telegram chat rather than the account, because that
-- is where a reply goes, and it still reaches someone who unlinked the chat.
CREATE TABLE "telegram_support_message" (
    "admin_chat_id" BIGINT NOT NULL,
    "admin_message_id" INTEGER NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_support_message_pkey" PRIMARY KEY ("admin_chat_id","admin_message_id")
);

CREATE INDEX "telegram_support_message_created_at_idx" ON "telegram_support_message"("created_at");
