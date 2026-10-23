-- The expired-records job deletes sessions (with the address and user agent
-- better-auth stored on them), verification tokens and the bot's one-time codes
-- once they have expired; each sweep filters on expires_at.
CREATE INDEX "session_expires_at_idx" ON "session"("expires_at");

CREATE INDEX "verification_expires_at_idx" ON "verification"("expires_at");

CREATE INDEX "telegram_link_code_expires_at_idx" ON "telegram_link_code"("expires_at");

CREATE INDEX "telegram_web_login_expires_at_idx" ON "telegram_web_login"("expires_at");
