-- The «Ответ поддержки» line goes out in the reader's language. A chat linked to
-- an account has its own locale, but the desk also serves chats with no account,
-- so the sender's Telegram language is kept with the thread at the time it is
-- opened. Nullable: rows written before this column fall back to the default.
ALTER TABLE "telegram_support_message" ADD COLUMN "locale" TEXT;
