# The Telegram bot

`apps/server/src/modules/telegram/` — a second door to the same account. How to
create the bot and fill in its variables is in [ops/deploy.md](../ops/deploy.md#creating-the-telegram-bot).
Part of the [documentation index](../README.md).

## Telegram is a second door to the same account

`apps/server/src/modules/telegram/` is a bot and nothing more: it reads the
subscription, the link and the checkout through the services that already own
them. Nothing about billing or peers is reimplemented there, and a command that
needs a user resolves the chat through `TelegramLinkService` rather than trusting
it.

**It is split by what a command touches, not one service.** `TelegramBotService`
owns the routing table — `actions` maps each command and keyboard button to a
handler, `callbacks` each inline-button prefix — and nothing else.
`TelegramSubscriptionService` answers `/connect` (`/link`), `/status`, `/buy`
and `/trial`; `TelegramAppsService` `/apps`; `TelegramDevicesService`
`/devices` — the device list, removing one and buying extra places;
`TelegramWireguardService` `/wireguard` — making a config and sending its file;
`TelegramBillingService` `/rotate` and auto-renewal; `TelegramAccountService` `/start`,
linking, `/website`, `/language`, `/help`, `/unlink` and `/delete`;
`TelegramReferralService` `/invite` and a `/start ref_<code>` arrival
([referrals.md](referrals.md)); `TelegramOffersService` `/offers` and the switch under
an offer ([below](#telegram-is-a-second-door-to-the-same-account)); `TelegramSupportService` `/support` and the
support desk; `TelegramStatsService` `/stats`, `TelegramBroadcastService`
`/broadcast` and `TelegramPromoService` `/promo`, the three owner commands.
`TelegramLinkService` owns the chat rows and link codes, `TelegramWebLoginService`
the sign-in links, `TelegramProfileService` announces the bot to Telegram,
`TelegramNotifyService` speaks first (below), `TelegramAlertService` tells the
owner what the jobs and billing saw, and `TelegramSharedService` holds
what every handler needs — resolving the chat, picking the locale, replying with
the keyboard, recognising the admin chat — rather than each of them repeating it.

**Telegram is a way in, not only a way back.** `/start` from an unknown chat
creates the account itself — `ensureChat` mints a `User` through
`IdentityService.createFromTelegram`, which calls better-auth's
`internalAdapter.createUser` and so runs the database hook that creates the
`Subscription`, then writes the `TelegramAccount` row. Nobody has to visit the
site first, and nobody has to link anything.

**An account made through Telegram records its consent to the processing of
personal data.** `ensureChat` writes a `personalData` consent with source
`telegram` and the current `PERSONAL_DATA_CONSENT_VERSION` right after it
creates the account — from `/start`, a `ref_` arrival or the site's login
widget alike — because using the bot is the action the consent is given by. The
bot says so where that action happens: the description shown before «Запустить»
ends with «Нажимая «Запустить», вы даёте согласие на обработку персональных
данных», and the greeting of a new account ends with «Пользуясь ботом, вы даёте
согласие на обработку персональных данных» linking the consent page on the
site in the reader's language (`TelegramSharedService.consentUrl`,
`LEGAL_PAGE.consent`). A failed write is logged as an error; the account is
already there.

**Only three doors call `ensureChat`: `/start`, a `ref_` arrival and the login
widget.** A link code binds the chat to the code's account itself
(`consumeCode`). Every other command and button resolves the chat with
`findChat` and, for a chat it does not know, answers `notLinked` with
`remove_keyboard`. Before this, any press from an unlinked chat — an old
keyboard left over after `/unlink`, a stale inline button — silently minted a
fresh, empty account and carried on as if it were the reader's. `ensureChat`
reports `isNew`, so `/start` greets a new account with the long `start` text and
everyone else with a short `welcomeBack`; a linked code answers `linked` alone.

**The bot answers only in a private chat.** Every handler is registered on
`bot.chatType('private')`. In a group the `/start` command and the bot being
added (`my_chat_member`, read by `isGroupJoin`) get one `groupOnly` reply with a
button to the private chat, and nothing else: the subscription link and the
one-time sign-in link are secrets, a group would show them to everyone, and an
anonymous admin arrives as the same `GroupAnonymousBot` user for every admin. A
stray inline press from a group is acknowledged and dropped. Two things are
deliberately outside that rule: `/chatid`, which answers in any chat, and the
admin chat ([below](#the-admin-chat)), which may be a group.

**`User.email` stays required, and a Telegram-born account gets a placeholder.**
The column is required in better-auth's _core_ schema, not in the
emailAndPassword plugin, so making it nullable is an unsupported configuration
rather than a migration. `telegramPlaceholderEmail` mints
`<id>@telegram.placeholder.invalid` instead — `.invalid` is reserved by RFC 6761
and can never resolve, which is the point. `sendEmail` drops anything addressed
to one, so no transactional mail is ever attempted against an address that
cannot receive it.

**The trial asks for a verified email only where there is an email to verify.**
`requireEmailVerification` is off, so that gate never meant more than "you hold
some mailbox", which a disposable address satisfies. A Telegram id is not a
weaker proof than that. `isPlaceholderEmail` is what the gate reads; the
once-only guarantee still rests where it always did, on the `Subscription` row.

**A chat that registered itself is not a claim on the id.** Someone who signs up
on the site and then sends the bot their code would otherwise be told the chat
belongs to another account — their own, created seconds earlier by `/start`.
`consumeCode` therefore deletes the Telegram-born user when it is untouched:
placeholder email, no period other than a trial, no bonus days, no referrals
made, no promo code redeemed by hand (an automatic win-back grant does not
count, [promo-codes.md](promo-codes.md#automatic-codes)) and no payment that is not `canceled` — an
abandoned checkout is not a purchase. A trial-only account is merged: `TrialService.transfer` carries the
trial (and its grant) over to the site account inside the same transaction,
and the bot account's peers are released on their nodes after it commits.
Anything more is never deleted, and the refusal stands — its copy
(`alreadyLinked`) says how to proceed: unlink the chat from the other account,
then send the same code again, which the rolled-back claim left valid.

**`/website` hands out a one-time link rather than a password.** The bot has no
password to give, so `TelegramWebLogin` stores a 32-byte code for ten minutes and
`/telegram/web-login` trades it once for a session token. It is a table of its
own, not a second meaning for `TelegramLinkCode`: that one proves a chat may
drive an account, this one turns its holder into the account. The route is
anonymous by necessity and throttled tighter than the API (`WEB_LOGIN.throttle`)
for the same reason the feed is.

`POST /telegram/web-login/widget` is the other way in from the site: it takes a
Telegram Login Widget payload, checks its shape with `isWidgetPayload` and its
signature against the bot token (`verifyWidgetPayload`), and signs the chat in
through the same `ensureChat`. Both routes treat the body as untrusted — the
code must be a non-empty string, and a payload that is not a widget payload is
refused before anything is verified.

**Unlinking is refused while the chat is the only way in.** For an account with a
placeholder email, removing the chat would leave a paid subscription nothing can
open, so `askUnlink` says so instead of asking to confirm.

**An unlink says goodbye before the row goes.** `TelegramLinkService.unlink` —
reached from the bot and from the site's `DELETE /telegram` alike — sends
`unlinked` with `remove_keyboard` through `TelegramNotifyService.farewell` first,
so the chat is not left with a keyboard whose every press would now answer
`notLinked`.

**The link is a code, not an OAuth flow.** The account page issues a short code,
the reader retypes it into the bot, and the bot exchanges it for the user id.
Issuing a second code invalidates the first, the code lives fifteen minutes, and
its alphabet leaves out `0/O` and `1/I/l` because a person reads it off a screen.

**A Telegram id already linked elsewhere is a conflict, not a move.** Silently
repointing it would take the subscription away from whoever holds the other
account, so `consumeCode` refuses — inside the transaction, so the refusal rolls
the claim back and the code still works from the right chat.

**A second chat for the same account is the opposite case, and is a move.**
`telegram_account.user_id` is unique, so the row cannot simply be added: the
previous chat is unlinked first. Without that the `create` collides on
`user_id` and someone linking their new phone is told "something went wrong".

**An empty `TELEGRAM_BOT_TOKEN` switches the bot off.** The module still loads
and the routes still exist; they simply do nothing. A deploy that has not
configured Telegram is not a failed deploy.

**The webhook is verified by header, and a mismatch answers 200.** Telegram
signs every call with `TELEGRAM_WEBHOOK_SECRET`. Answering an error would have
Telegram retry, and telling a prober it guessed wrong invites it to keep
guessing — so a bad secret is dropped silently. For the same reason
`handleUpdate` never throws: Telegram replays any update it gets no 200 for.
The route (`WEBHOOK.path`) carries `@SkipThrottle()`: every update arrives from
Telegram's own addresses, so a per-IP limit would throttle Telegram itself, and
the secret header is what keeps everyone else out.

**The server registers its own webhook on boot, so nothing is run by hand.**
`api.telegram.org` is blocked by most Russian ISPs, which makes a manual
registration step something only the production host can do — and something a
domain change or a rotated secret silently invalidates. `listen` sets it
alongside the descriptions, skipping the call when `getWebhookInfo` already
names the same URL and reports no delivery error. That error is what catches a
rotated secret: the URL still matches, so nothing else would notice that
Telegram is being turned away by the header check.

A webhook is only registered when `TELEGRAM_WEBHOOK_URL` is https and a secret
is set. Both are Telegram's own requirements, and calling `setWebhook` without
them fails the whole announcement, taking the command list with it.

**The webhook has its own host, and that host is the only one behind
Cloudflare.** IPv4 from this VPS to `api.telegram.org` is SNI-blocked in both
directions, so a webhook pointed at `API_URL` gets `Connection timed out`.
Telegram will not take an AAAA-only name either — `setWebhook` answers
`IPv6-only addresses are not allowed` — so the callback host needs IPv4 that is
not ours: `bot.example.com` is proxied through Cloudflare, and Telegram
reaches its addresses. The site and `api` stay unproxied, because Russian ISPs
have throttled Cloudflare since June 2025 and every user pays for that hop.

Caddy serves the host `/telegram/*` and 404s the rest: it is a callback
endpoint, not a second copy of the API. Outbound still needs the IPv6 network in
`docker-compose.yml` — Cloudflare answers the inbound half only.

Telegram caches DNS for a few minutes, so a record change is not visible to
`setWebhook` immediately; it keeps answering for the old address until the cache
expires.

**Every outbound call retries a network failure.** IPv6 egress to
`api.telegram.org` holds, but not every time: a renewal's "renewed" message was
lost to a single `Network request for 'sendMessage' failed!`, logged and gone.
Two API transformers on the bot itself split the work, so a reply to a button,
a notification and the boot announcement all get both. `retryNetworkErrors`
retries an `HttpError` (the call never got an answer) `BOT_API.callRetries`
times. `@grammyjs/auto-retry` retries a `429` flood wait no longer than
`BOT_API.maxDelaySeconds` and a Telegram 5xx `BOT_API.callRetries` times, and is
told to rethrow an `HttpError` (`rethrowHttpErrors: true`): left to itself it
retries network failures forever, ignoring `maxRetryAttempts`, and a Telegram
that is down would then hang the YooKassa webhook and every scheduler job that
announces something. Any other `GrammyError` is an answer — a blocked bot, a bad
chat id — and is never retried. A retried `sendMessage` whose first attempt did
arrive shows twice; that is the price of not losing one.

**Every message is HTML, and a message Telegram cannot parse still arrives.**
`sendDefaults`, a third API transformer, gives `sendMessage` and
`editMessageText` `parse_mode: 'HTML'` and no link preview unless the caller
says otherwise. If Telegram answers `can't parse entities` — or
`EFFECT_ID_INVALID` for a message effect it no longer knows — it sends the same
message once more with only the field that failed removed: broken markup goes
out as plain text (tags stripped, entities unescaped), an unknown effect is
dropped and the formatting kept. A broken tag costs the formatting, never the
message. HTML rather than
MarkdownV2 because only `&`, `<`, `>` need escaping, where MarkdownV2 would make
every full stop and bracket in the copy a hazard.

**Every message in a reader's chat is one width.** Telegram sizes a bubble to its
longest line and an inline keyboard to its bubble, so a short message ("💳
Подписка" and a date) came out narrow with its buttons squeezed into a column,
next to a long one at full width. `withWidth`, part of the same transformer,
widens the text of every `sendMessage` and `editMessageText` to a private chat
to `SEND_DEFAULTS.width.cells` (32) on its **last line**: a space and blank
braille cells (U+2800, which is not whitespace and so is not trimmed) are
appended until that line is as wide as the target, so every bubble — the full
width on a phone — and every keyboard are one width. It once added a separate
line of those cells instead, which left every message with an empty-looking
line at the bottom. Width is counted on the text without tags, an emoji as two
cells (`cellsOf`); a message whose widest line already reaches the target is
left alone; a text ending in a quote or a code block gets the fill inside the
closing tag, where a new line would otherwise start. It is added once (a text
that already ends with the fill is skipped), never to a group such as the admin
chat, and never to a caption.

The fallback, if IPv6 egress goes too, is long polling, which needs no inbound
path at all.

The boot logs what `getWebhookInfo` answered — the registered URL, the last
delivery error and the pending count — because that is the whole of what a
separate diagnostic command could have told anyone, and a log is where someone
looks when the bot goes quiet.

**An update can arrive before the bot has initialised, so `handleUpdate` waits
on it.** The announcement runs detached to keep Nest booting, and grammY refuses
to dispatch anything until `bot.init()` has told it who the bot is — a webhook
that is already registered delivers into that gap and every update fails with
"Bot not initialized". `init()` therefore sits outside the announcement's own
try/catch: the rest of the announcement is best-effort, but this part is what
`handleUpdate` awaits, so its failure has to reach the promise rather than be
swallowed alongside a description that did not update.

**An unset secret rejects everything rather than matching the absent header.**
`TELEGRAM_WEBHOOK_SECRET` defaults to `''`, so a `!==` against it would let a
request with no header through — a deploy that configured the token and forgot
the secret would hand the bot to whoever finds the route. The comparison is
`timingSafeEqual`, whose length check returns early because the length of a
secret is not itself a secret.

**The two refusals a command can give are different answers.** A code that did
not work and a chat that belongs to someone else's account send a reader to
different places, so `refusalText` branches on the error code rather than
catching everything as an invalid code; the same is true of the trial, where an
unconfirmed address is not a used-up trial. `errorCodeOf` reads the code back
out of the app exception's body, which is where the app exceptions carry it.

**The bot speaks both languages.** It reads Telegram's own `language_code` for
the first message and stores what `/language` chose, which then wins — someone
who set it did so because the client was reporting the wrong thing.

**The keyboard is the interface; the commands are the fallback.** The reply
keyboard holds only what is pressed every week — connect, apps, subscription,
renew, devices — and one "⚙️ More" that opens the rest (support, help, invites,
the website, auto-charge, a new link, language, unlink, delete) as an inline
menu, two buttons to a row under a full sentence (every message is padded to
one width, above, so the buttons never squeeze into a column). Support and help share the first row — the two
answers to "something is wrong" — and with nine buttons one has to stand alone:
it is "Delete", at the bottom, full width and red, which is where a destructive
button belongs anyway. The menu's title lists exactly the buttons shown, in
their order, in both its versions (`moreTitle`, `moreTitleNoAccess`). With six
buttons it can afford to be `persistent()`; the old layout of fourteen could
not. It changes with the chat: the link and the status only appear once there
is a subscription to use, and the trial only while it can still be taken —
beside "Subscribe", in one row, since the two only ever show together.
`KEYBOARD_ROWS` and `MORE_ROWS` are the whole layout — a button names the state
it belongs to, and a row that empties out is dropped rather than shipped blank.
A button's colour belongs to the button, not to the message it sits under, so
`BUTTON_STYLE` holds it once per key (`success` for paying, `primary` for
connecting, `danger` for deleting) and every keyboard reads it; Telegram added
colours in Bot API 9.4 and older clients ignore them. Which actions to offer
under a status or a refusal is `offerKeys(period)`, one rule for every place
that asks.

An inline button that stands for an action carries `menu:<button key>`, and
`openMenu` runs the same handler the reply-keyboard press would. That is how the
More menu, the buttons under `/status` and the buttons on a notice all reach
existing handlers without a second routing table; a test asserts every key they
can carry is handled.

**Menus edit their message; answers that change the chat send a new one.**
Picking an app, going back to the list, choosing a plan, flipping
auto-renewal, asking to remove a device and answering that question all edit
the message the button sat on (`TelegramSharedService.edit`), so stale buttons
never pile up and a second press of an old one finds nothing to repeat. A yes/no
confirmation clears its buttons (`settle`) the moment it is answered, for the
same reason. An edit falls back to a new message only when Telegram says the
message cannot be edited (`EDIT.uneditable`); any other failure is a real
error and reaches the handler's error path, so a flaky network never produces
the same screen twice. What changes the reply keyboard — linking, a new language, unlink,
delete, the trial starting — still sends a new message, because only a new
message can carry a reply keyboard.

**Links are buttons where Telegram allows it.** A payment, the one-time website
sign-in and an app's download page go behind an URL button rather than a bare
link, but only when `isButtonUrl` says Telegram will take it: `https` and not a
local host. `urlMessage` is the one place that decides, so every link falls
back the same way. A dev setup on `http://localhost` gets the link as text instead of a
`BUTTON_URL_INVALID`. The subscription link itself gets a `copy_text` button,
which puts it on the clipboard in one tap, beside the `<code>` that copies on
tap as well.

An app's screen under `/apps` does the same with the link that app takes —
INCY's deep link, the plain URL for every other — the server's `copyUrl`,
which the site copies too — and three
numbered steps whose middle one says where in that app to paste it
(`CLIENT_PASTE`). It used to print the import link (`hiddify://…`,
`incy://…`) as text to "open", but Telegram neither turns a custom scheme into
a link nor allows it on a URL button, so that text sent people nowhere.

A press arrives as a plain text message, so `buttonFor` maps a label back to its
key across both languages before the text is read as a link code. The labels
therefore have to stay unique, including between languages — a test asserts it,
because two identical labels would make a press ambiguous.

**Its copy lives in JSON, not in TypeScript.** `config/locales/{ru,en}.json`
hold every string the bot sends, mirroring the client's per-namespace files, and
`BotMessages` is derived from the Russian one — so a key present in one language
and missing from the other fails to typecheck rather than reaching a reader. The
command menu is built from the `commands` block rather than listed a second time
beside it.

The `text` block is Telegram HTML — `<b>`, `<i>`, `<code>`, `<blockquote>`, and
`<blockquote expandable>` for the long half of `/help`. A test runs every string
in both languages through `isTelegramHtml` (known tags, balanced, no bare angle
bracket) and fails the build on one Telegram would refuse. `fillText` escapes
every value it substitutes, because a device names itself and a name like
`<TV>` would otherwise close a tag nobody opened; `fillLabel` fills button
labels verbatim, because a button shows text, not markup. Both, and the
emails' `fillEmail`, go through one `fillTokens` (`common/lib`), which hands
`replaceAll` a function rather than a string, so a value holding `$&` or `` $` ``
— a Telegram name can — is inserted as written instead of being read as a
replacement pattern. The `buttons`, `profile` and `commands` blocks stay plain text.

**Announcing the bot never blocks the boot.** Nest does not finish starting
until `onModuleInit` returns, and `api.telegram.org` is unreachable from some
networks, so the announcement runs detached and a failure is logged rather than
raised. The same is why a command list that failed to update is not an error.

**Everything BotFather can set, the server sets on boot** — name, description,
short description and command list in each locale, and the menu button, which is
always `type: 'commands'` (it opens the command list). Each value but the menu
button is compared with what Telegram already holds and written only when it
differs. The one
exception is the photo, which has no API method and stays a one-off
`/setuserpic`. Editing any of the rest in BotFather is overwritten on the next
restart.

**The bot speaks first when the state changes under the reader.** A payment
settles in a webhook and a renewal in a cron, so without this nobody learns
anything until they open the chat and press something — and the keyboard they
are looking at still offers "Subscribe" on a subscription that is already paid.
`TelegramNotifyService.tell` sends one of the notices in `NOTICES` — a payment,
extra devices bought, an automatic renewal, a card that was declined, a period
about to end (`period-reminder`), a period that ran out, every change to the
device registry: a device added, a device refused at the limit, devices cut by
a smaller limit, the shared keys retired ([devices.md](devices.md)) — and the
two growth jobs: a win-back offer or reminder after a lapse
(`winBackOffer`, `trialWinBackOffer`, `winBackReminder`,
[scheduler.md](scheduler.md#win-back)) and a checkout left unpaid
(`checkoutAbandoned`, `giftCheckoutAbandoned`,
[billing.md](billing.md#abandoned-checkouts)).

A caller names the notice (`notice: 'paid'`), not the string, and `NOTICES`
says what each one carries. `paid` and `renewed` set `refreshHint`: when the
account has devices, the message ends with a line telling the reader to refresh
the subscription in the app if the servers did not appear. A WireGuard config
is announced as `wireguardAdded`, which does not suggest `/rotate` — the link
has nothing to do with a config made on the site.

**Two moments of delight carry an invite.** A caller may pass `invite: <plan>`,
and the notice then ends with one line naming the referral rewards of that
plan from `REFERRAL_REWARDS` (`inviteLine`: «когда он оплатит подписку на 12
мес., вы получите +30 дней, а он — +15 дней») and gets the Invite button.
`paid` passes the plan just paid; the notice for the account's **first device
ever** passes its current plan (monthly on a trial). "First ever" is a claim,
not a count: the registry forgets removed devices, so `FeedNoticeService`
claims a `firstDevice` row in the notice log
([scheduler.md](scheduler.md#the-notice-log); `20261025110000_first_device_invite`
backfilled every account that already had a device or a fetched link, and
`20261026120000_notice_log` moved that mark into the log) and only the call
that wins it invites.
`noticeLayout` decides where the line goes: under an inline notice the line is
appended and `invite` joins the buttons; `paid` carries the reply keyboard,
which leaves a message no room for an inline button, so the line follows as a
second message with the button. The effects stay where they were.

**An offer is not a service message, and it goes only to those who asked.**
`NOTICES` marks the three win-back notices (`winBackOffer`,
`trialWinBackOffer`, `winBackReminder`) `isPromotional`: they offer a discount,
which is advertising under the law on advertising (38-ФЗ, art. 18) and needs the
recipient's prior consent. `tell` checks the account's latest marketing consent
before a promotional notice and sends nothing — neither the message nor the
email — when it is not granted, or when the check itself fails
([legal.md](legal.md#consents)). Everything else is a service message and is
not gated: a payment, a renewal and its advance notice, a declined card, a
period ending or ended, every device change, an unfinished checkout (it is
about an order the reader started, and offers nothing new), a gift bought, and
the referral rewards. The invite line on `paid` and the first device is a part
of those service messages — it describes the account's own rewards — and is
not gated either.

A promotional message carries one more button under its own,
«🔕 Не присылать предложения» (`offers:off`): pressing it records a withdrawal
(source `bot`) and turns the message into a short confirmation that payment,
access and device messages keep coming, with «🔔 Присылать предложения» to
undo it. `/offers` (`TelegramOffersService`) shows the current state with the
same switch; it is in the command menu rather than in "⚙️ More", whose layout
and title stay as they are. `offersChoice` reads the payload strictly, like
every other callback.

**`tell` is a fan-out, not only a Telegram message.** Someone who never linked
Telegram would otherwise learn nothing about a charge, a failed card or an
ending period. `NoticeEmailService` sends the money and access notices —
`paid`, `renewed`, `renewSoon` (before every automatic charge, which the law
expects us to announce), `chargeFailed`, `endingSoon`, `trialEndingSoon`,
`expired` — `giftPurchased`, with its code, and the growth notices (the three
win-back ones with their `{percent}`, the two checkout reminders) to a
verified, real address, whether or not a chat is linked. A promotional email
ends with a different footer — sent because the reader agreed to offers — and
an unsubscribe link (`UnsubscribeService.link`,
`${CLIENT_URL}/unsubscribe?token=…`, also sent as the `List-Unsubscribe`
header), which withdraws the consent with source `email`. Every email's button
opens the account's Subscription tab (`NOTICE_EMAIL`, `/account#subscription`). The
copy is its own (`lib/email/locales`), because the bot's text points at bot
buttons; the locale is `user.locale`, then the linked chat's, then Russian.
Every failure is logged and swallowed, like the Telegram half.

**`user.locale` is the site's language, remembered.** The site's auth client
sends `x-locale` (the page's `<html lang>`) with every better-auth call, and an
after-hook on sign-up, sign-in and `get-session` stores it whenever it differs —
so a reader who switches the site to English gets English mail from then on.
Sign-up without the header falls back to `Accept-Language`, which is what the
site's own detection uses. The auth emails (verification, reset, email change)
read the header of the request that triggered them first, then `user.locale`,
and their callback URLs carry the locale prefix (`/en/account`), so the click
lands on the page in the language the mail was written in. The two that change which buttons apply — `paid`
and `expired` — carry the reply keyboard rebuilt from the current state; every
other notice carries the one button that answers it (renew on a declined card
or an ending period, devices on a registry change, auto-charge on a renewal,
renew or buy on a win-back message, buy on an unfinished checkout and the
website on an unfinished gift), plus Invite when it carries an invite (above).
A message holds one markup or the other, never both. `paid` and `renewed` also
carry a message effect, as do `devicesAdded`, `referralRewarded` and
`giftPurchased`, and so do the trial starting and a chat getting linked;
an effect Telegram no longer knows falls back like broken markup does.

It lives in `TelegramNotifyModule`, which imports only `SubscriptionModule` —
`BillingModule`, `SubscriptionLinkModule`, the scheduler and the admin module
import that rather than the
whole `TelegramModule`, which imports billing and admin back. `TelegramAlertService`
lives there for the same reason. The admin panel's «Написать в Telegram» goes
through it too: `TelegramNotifyService.message` sends the admin's text, escaped
for the bot's HTML parse mode, and answers `sent`, `notLinked`, `blocked` (403),
`botOff` or `failed` ([admin.md](admin.md)).

**A payment started in the bot returns to the bot.** `createCheckout` and
`buyExtraDevices` get `returnUrl: https://t.me/<bot>`; the site's `/account`
would ask a Telegram-born reader to sign in to an account they have no password
for. Creating a payment is throttled per Telegram user (`CHECKOUT.throttleMs`,
through `TelegramThrottleService`, below), in memory — billing reuses a pending payment anyway, this only stops a
double-tap from making two YooKassa calls. A refused press answers
`checkoutWait` on the button itself. During a paid period `/buy` says the new
term is added to the current one (`choosePlanStacked`); a stale extra-places
press answers `devicesNeedPaid` or `devicesFull` over the list, and a stale
auto-renewal press without a card simply re-renders the panel. A pending promo
discount applies to the bot's checkout as well: the message states the amount
actually charged and adds `checkoutDiscount` with the code and the full price
(`checkoutIntro`, [promo-codes.md](promo-codes.md#the-discount-lifecycle)). A
paid gift is announced with `giftPurchased`, which carries the code.

**Every consumer imports the files directly, never `telegram` or
`telegram/services`** — `telegram-notify.service` and `telegram-alert.service`. Either barrel re-exports a service that injects
`CheckoutService`, so reaching billing through one loads billing while billing
is still initialising: `Cannot access 'CheckoutService' before initialization`,
at boot, with nothing failing to typecheck first. This is the one place in the
server that goes around a module barrel deliberately, and moving either import
back to the barrel brings the crash back — it was tried.

A chat that is not linked simply gets nothing, and anything that fails — the
chat lookup included, which sits inside the same `try` — is logged rather than
raised: an unreachable Telegram must not fail a settled payment.

**A chat that blocked the bot is remembered.** `telegram_account.blocked_at`
is set when Telegram's `my_chat_member` update says the reader blocked the bot
in their private chat (`botBlockChange`: `kicked`), and when a notice, an
admin's message or a broadcast gets a 403
(`20261025100000_win_back`); it is cleared when they unblock it (`member`),
press anything (`touch`), or a notice reaches them. Nothing is withheld from a
blocked chat — a send costs one call and proves the state — but the growth
jobs skip an account whose only channel is a blocked chat and a placeholder
email, since neither delivers.

**`/devices` is the bot's copy of the device page.** It lists what
`DevicesService.list` holds — numbered, with the system, the app, when it was
last seen and a mark on any device past the limit — and puts one "Remove"
button per device above the `+1/+2/+3` purchase, each priced. The purchase row
shows only on a paid period (the server refuses extras on a trial), and at the
cap it becomes a disabled button saying so rather than three that would fail.
Removing edits the list in place: the question replaces it, and the answer
brings the list back with a line on top saying what happened. An empty list says
when a device appears (the app's first subscription refresh), because that is
the question someone asking with nothing listed has. This is also where the
over-limit announcement in the feed sends people.

Removing a device asks first, like `/rotate` and `/unlink`, but the question
names its subject, so the yes/no payload carries it: `confirmKeyboard` writes
`<yes|no>:<device id>` under `CALLBACK_PREFIX.removeDevice`, and `deviceAnswer`
reads it back only when the answer is one of the two and the id is a UUID. A
press on a device that is already gone — an old list, a second phone — answers
that the device is no longer there rather than "something went wrong":
`DEVICE_NOT_FOUND` is a state, not a failure. The confirmation warns that an app
which refreshes again takes the place back, since registration is just a feed
fetch.

`TelegramModule` imports `DevicesModule` directly; that module depends on
Prisma alone, so it brings no path back into billing or the bot.

**`/wireguard` makes a config without the site.** It is also the last button
under `/apps`, beside the apps it is an alternative to — and only there, since a
second copy in "⚙️ More" was one more place to look for the same thing. The same
`WireguardConfigService` the account page calls, behind the check `/apps` and
`/connect` make: a `period` of `none` gets the no-access message, and `none` is
exactly what the REST route's `hasActiveAccess` refuses. The screen
lists the reader's configs, one button each that sends the `.conf` again, and
one "➕" per WireGuard server that is up; at the limit those give way to the
Devices button, because removing a config is what `/devices` already does — a
config is a device. Picking a server asks which kind of device it is for
(`WIREGUARD_KINDS`: phone, computer, router) instead of a typed name: the bot
reads free text as a link code, and a typed name would need a conversation
state it does not have. The kind names the config (`wireguardName` numbers a
repeat — «Телефон 2») and picks the line in the caption that says which app
opens the file. The file goes out with `sendDocument`; Telegram puts it on
every device the reader is signed in on, so a config made at a computer opens
on the phone without a QR code.

Creating holds a lock per Telegram user until it settles, and the device
buttons are cleared the moment one is pressed: a double tap must not make two
configs, each taking a place, and a time window would not do — one panel call
may take ten seconds. A config that was made but whose file did not go out
gets its own answer (`wireguardNotSent`), not "something went wrong", so
nobody makes a second one to get the first file. At the limit a stale "➕"
re-renders the list instead of asking for a device kind it would then refuse.
The bot passes `shouldAnnounce: false`, so the "new WireGuard config —
if it was not you, delete it" notice that a config made on the site sends to
the chat is not sent to the chat that just made it. Country names come from
`Intl.DisplayNames` in the reader's language, with the flag from `countryFlag`
(`common/lib`, shared with the feed's server names).

## Identity, input and callbacks

**One chat row per account, and the id is the identity.**
`telegram_account.telegram_id` is what never changes — a username does, which is
why the username is stored for display only. The row points at a `User`, so a
Telegram account is a second door to one subscription rather than a second
subscription.

**A message is read as a link code only when it is shaped like one.** Anything
else a reader types goes to the support desk, or gets the help text while there
is none ([below](#the-support-desk)). The shape is `SHORT_CODE` in
`packages/schemas` — the same alphabet, length and `isShortCode` check as an
invite code, minted by one `generateShortCode`. Without that check, every
stray message became a database claim attempt — a free guessing oracle across
every live code at once, and updates from Telegram never pass the per-IP
throttler because they all arrive from Telegram.

**`ResolvedChat` carries the Telegram id.** `findChat` already has it, and a
handler that needs it — `setLocale` — would otherwise read `identityOf` a second
time around the shared unwrap that just did.

**A callback payload is untrusted input, whatever button rendered it.**
`countFrom` checks the shape before the value because `Number()` reads `" 2"`
and `"0x2"` as two, and `autoRenewChoice` returns null rather than treating an
unrecognised payload as "off" — a ternary there would let a crafted press turn a
paying reader's renewal off. `parseClientId` matches against `CLIENT_IDS` rather
than asking `in`, which also answers for `__proto__`. `parseUuid` takes
nothing but a UUID, so a crafted device or node id never reaches a query.

**Every callback handler unwraps the press the same way**, so
`TelegramSharedService.answered` does it once: read the sender, acknowledge the
press so the client stops spinning, resolve the chat, hand the handler the
value. The acknowledgement (`acknowledge`) swallows its own failure — a press
answered after a slow handler gets "query is too old", and that must not cost
the reader the answer itself. `confirmed` builds on it for the yes/no presses that `ask` renders, and
`withUser` is the same unwrap for a typed command.

**A callback payload is matched on an escaped prefix.** `callbackPattern` builds
the regular expression rather than interpolating the prefix by hand, so a prefix
carrying a metacharacter cannot widen the match, and a fresh pattern per call is
what keeps a global flag from carrying `lastIndex` between updates.

**A Telegram id is a bigint from the edge inwards.** It exceeds what a JS number
holds safely, so `identityOf` converts once at the boundary rather than leaving
each call site to remember.

## The admin chat

**`TELEGRAM_ADMIN_CHAT_ID` is the owner's side of the bot, and it is optional.**
It names one chat — the owner's private chat with the bot, or a group of the
people who answer — where support requests arrive, the owner commands work and
the alerts are posted. It defaults to `''`, and `config/env.schema.ts` accepts
only that or a whole number (a group's id is negative). Empty switches all of it
off without a word: the owner commands answer nowhere, the alerts are dropped
before anything is composed, and the support entry falls back to what the bot
offered before. How to set it up: [ops/deploy.md](../ops/deploy.md#creating-the-telegram-bot).

**A group that becomes a supergroup gets a new id.** Telegram migrates a basic
group the moment someone turns on a supergroup-only setting (topics, visible
history, finer admin rights), and from then on every send to the old id fails
with "group chat was upgraded" — alerts, support threads and the owner commands
all go quiet together. The failure carries the new id
(`parameters.migrate_to_chat_id`); `migratedChatId` reads it and the server
logs an error naming the value to put in `TELEGRAM_ADMIN_CHAT_ID`. The deploy
guide asks for a supergroup before `/chatid` is run, so the id never moves.

**Membership of the admin chat is the authorisation.** There is no list of owner
ids to keep in sync: whoever is in that chat can answer users and run
`/broadcast`, so the group holds only people who should. `isAdminChat` compares
the update's chat with the configured id and nothing else.

**The admin chat is handled before everything else, and falls through.**
`register` puts a `bot.filter(isAdminChat)` composer first: the owner commands,
their buttons, and replies that answer a support thread. Anything else there
calls `next()`, so when the admin chat is the owner's own private chat it still
behaves as their ordinary chat — `/status`, the keyboard and the rest. In a
group the bot runs in privacy mode and sees only commands and replies to its own
messages, which is exactly what it needs; admins talking among themselves never
reach it.

**`/chatid` answers in any chat, with that chat's id and a line saying where to
put it.** Without it the owner had no way to learn a group's id: the bot runs on
a webhook, so `getUpdates` is not available, and a third-party "id bot" is one
more account to let into the group. The id is the only thing it reveals — the
asker is already in that chat. It is registered on the whole bot rather than the
private-chat router, and kept out of the command menu.

**The admin chat speaks the default language.** What the bot posts there on its
own — a support header, an alert — is in `DEFAULT_BOT_LOCALE`; an answer to an
admin's command follows the language of whoever pressed, the same rule the bot
applies to everyone.

## The support desk

**Support used to be an email address; now it is the chat the reader is already
in.** «💬 Поддержка» sits in "⚙️ More" beside "Help", under every `/help`, and
behind `/support` in the command menu. With an admin chat it says that the next
messages — text, screenshots, files, voice — go to support and the answer comes
back here. Without one it offers `SUPPORT_URL` (a button when Telegram takes the
URL, text otherwise) or, when that is empty too, the site — which is what `/help`
used to say ("write to support on the site"). `/help` closes on the line that
matches (`helpSupport` or `helpSupportOffline`).

**Every free message in a private chat goes to support — no "support mode".** A
text that is not a keyboard label, not shaped like a link code and does not start
with `/`, and any photo, document, voice note, audio, video, video note, GIF or
sticker (`SUPPORT_MEDIA`), is passed on. Nothing else reads free text — that is
why `/wireguard` asks for a device kind with buttons — so nothing another flow
needs is swallowed. Before this, such a text got the help text and media got
nothing; someone typing "it doesn't connect" to the bot was already writing to
support, and a mode they would first have to enter needs conversation state the
bot deliberately does not keep. An unknown `/command` still gets the help text,
and without an admin chat free text gets it too. A chat with no account is
served as well: someone who unlinked or deleted their account is exactly who may
need help, and the header says there is no account.

**A keyboard an older release left behind still works.** A reply keyboard stays
on a reader's screen until the bot sends another, so labels that were renamed
(«➕ Устройства», «🔄 Автосписание», «🔁 Обновить ссылку», «🗑️ Удалить аккаунт» and
their English twins) still arrive. `LEGACY_BUTTONS` maps each to the action it
named — all of them still exist — so such a tap opens that screen instead of
landing in the support desk.

**The reader is acknowledged once, not per message.** «Передали в поддержку —
ответим здесь» goes out at most once per `SUPPORT.ackWindowMs` per chat. Abuse is
held by a sliding count — `SUPPORT.rateLimit` messages per window — rather
than a once-per-window limit, because an album of screenshots arrives as
up to ten separate messages at once and a once-per-window limit would drop
nine of them. Past the limit messages are dropped and the reader is told so once
per window. The limit is per Telegram user and in memory; the per-IP throttler
never sees these updates, which all come from Telegram.

**Each thread gets one compact header, and the copies hang under it.** The header
(`supportHeader`) names the sender — name, `@username`, Telegram id — and, for a
linked chat, the account's email (a placeholder shows as "no email"), the bot
language, the device count, and the access: paid until a date on a plan, a trial
until a date, lapsed on a date, or never. The original follows with
`copyMessage`, as a reply to the header. Messages from one chat within
`SUPPORT.threadWindowMs` of a header reuse it, so an album is one header and its
photos rather than twice as many messages, and a long conversation gets a fresh
header — with a fresh status — every few minutes. The cache (`@isaacs/ttlcache`,
its lifetime counted from the header, not refreshed by a read) holds the header's
_promise_, read and set with no `await` between: Telegram delivers webhook updates in parallel, and the photos of one
album would otherwise race to post a header each. A header that failed to post
is forgotten, so the next message tries again.

**Every limit in the bot is one call.** `TelegramThrottleService.allow({ throttle, key })`
counts a hit in the `@nestjs/throttler` storage the HTTP guard already uses,
under its own key (`telegram:<throttle>:<key>`) and with no block duration, and
answers whether it fit. The windows and limits are `BOT_THROTTLE.limits` —
checkout, the owner alerts, the support rate, its slow-down notice, the
acknowledgement and the answer title. With no block the window slides: a hit
counts until its own window ends, and a refused hit is not counted, so a reader
who keeps writing is let through again as soon as the oldest message ages out.
The storage is in memory, like the rest of the bot's state.

**`copyMessage`, not `forwardMessage`.** A forward from someone who hides their
forwards links to nobody, and the copy works the same way in both directions.

**The way back is stored, not remembered.** `telegram_support_message` maps a
message in the admin chat — the header and every copy — to the Telegram chat it
came from, keyed by the admin chat and the message id (an id is unique only
within its chat, and a new admin chat starts a fresh numbering). A reply
therefore works after a restart or a deploy. The row stores the chat, not the
account, because a reply goes to a chat, and it should reach someone who has
since unlinked. Storing is best-effort: a failed insert is logged, since the
message already arrived and the reader must not be told it did not. The
`support-threads` job forgets rows after `RETENTION.supportMessageDays`
([scheduler.md](scheduler.md)).

**An answer is a Telegram reply to the header or to a copy.** The bot copies the
admin's message to the user, preceded by «💬 Ответ поддержки» in the user's
language — the linked chat's locale, or, for a chat with no account, the
Telegram language the sender had when the thread opened, kept on the
`telegram_support_message` row (`locale`) for exactly that case. The line is a message of its own: a caption prefix would not survive a
sticker, a voice or video note, or plain text, which `copyMessage` cannot alter,
and the one form that works for every type is a separate line. It is sent at most
once per `SUPPORT.answerTitleWindowMs` per user, so an answer in three messages
reads as one answer. A delivered answer gets a 👍 reaction on the admin's
message; one that did not arrive gets a reply saying why — the user blocked the
bot (`403`) or it simply failed. A reply to anything that is not a support
message falls through and is ignored.

## Owner commands

**`/stats`, `/broadcast` and `/promo` work only in the admin chat.** Anywhere else they are
not registered at all: they are not in the command menu, and typed into a
reader's chat they are an unknown command like any other, which gets the help
text. Nothing hints they exist.

**They are a registry, beside the reader's.** `TelegramBotService.ownerActions`
maps a command to a handler and `ownerCallbacks` an inline-button prefix, exactly
like `actions` and `callbacks`, and both are registered on the admin-chat filter.
`/promo` was added exactly that way: one entry there and `TelegramPromoService`.
A test asserts that no owner command shadows a reader's command (a
private admin chat would otherwise lose it) and that none reaches the menu.

**`/stats` is one message read straight from the database** — through
`AdminStatsService.collect`, the same collection the web admin panel's overview
reads, so the bot and `/admin` can never disagree on a number ([admin.md](admin.md)). Users in total and
new in the last `STATS_WINDOW.newUsersHours` and `STATS_WINDOW.newUsersDays`; live paid
periods by plan, live trials (`periodKind`, the rule the rest of the server
uses) and paid periods that renew automatically — a saved card and no
`cancelAtPeriodEnd`, the same condition the recurring charge selects on; the
number and sum of payments that succeeded in the last `STATS_WINDOW.paymentsDays`
(refunded ones are no longer `succeeded`); devices; linked chats; and every node
as up, down — with how long ago it last answered — or switched off. A node is
down by the same threshold the alerts use (`nodeStatus`, below), so `/stats`
never contradicts an alert.

**`/broadcast` sends a message the owner already wrote.** Reply to any message in
the admin chat with `/broadcast` — text, a photo with a caption, whatever
Telegram can hold — and choose the audience: every linked chat, those with
access (a live period, trials included) or those without. The next screen shows
the number of recipients and asks to confirm; only then does anything go out.
The message is sent with `copyMessage`, so it arrives as the bot's own message
rather than "Forwarded from". The buttons carry `bcast:<audience>:<message id>`
and `bsend:<yes|no>:<audience>:<message id>`, parsed strictly
(`broadcastChoice`, `broadcastAnswer`) and far under Telegram's 64 bytes even
for the largest id, which a test checks.

**The sending runs in the background, paced and counted.** The confirming update
returns as soon as the run starts: a webhook that waited minutes would be
retried by Telegram. One broadcast runs at a time; a second confirmation is
told to wait. `sendWait` spaces the copies `1000 / BROADCAST.perSecond` ms apart
(25 a second, under Telegram's limit), a `429` waits the `retry_after` Telegram
names and tries the same chat again up to `BROADCAST.floodRetries` times — short
floods are already absorbed by the bot's own `autoRetry` — and every chat ends
as delivered, blocked (`403`: the user blocked the bot or deleted their account)
or failed. A source message deleted mid-run stops it, since every other copy
would fail the same way. The report — the three counts — is posted as a reply to
the source. A chat that blocked the bot is treated as `TelegramNotifyService`
treats it: counted and left alone; its row stays, since unblocking the bot makes
it reachable again. A restart mid-run loses the rest of it and its report.

**`/promo` creates, lists and stops campaign codes.** `/promo BLOGGER20 20%` is
a discount on one payment, `/promo WELCOME 7d` bonus days; the answer ends with
a ready link, `<site>/?promo=CODE` (`webPromoLink`), that fills the code into
sign-up by itself; `uses=100` and
`until=2026-12-31` are optional and come in any order. `until` names the last
day the code works, to its end in Moscow (`T23:59:59+03:00`), because that is
the day the owner means. `/promo off CODE` stops a code by setting its expiry to
now: nobody can redeem it any more, while a discount someone already redeemed
stays theirs. `/promo` alone prints the syntax and the last
`CAMPAIGN_LIST.limit` codes with how many accounts redeemed each, out of the
limit, and whether it is stopped. `parsePromoCommand` is strict — no effect, two
effects, an unknown word or a date like `2026-02-30` are refused rather than
guessed, the last one so it is not silently rolled into March — and the checks
are `campaignProblem`, the service's own, run before the call so every refusal
reads in the admin's language. Gift codes are never listed or stopped here: a
paid gift is the buyer's, and a refund is what disables it
([promo-codes.md](promo-codes.md)).

## Operational alerts

**What the jobs and billing used to only log now also reaches the owner.**
`TelegramAlertService` posts to the admin chat when a node stops answering or
comes back, when a node's CPU or memory crosses `ALERT.nodeCpuPercent` or
`ALERT.nodeMemoryRatio`, when reconciliation fails
`ALERT.reconcileFailureStreak` times in a row, on every settled payment (the plan
or the extra places, the amount, and the payer's email — or Telegram handle and
id for a Telegram-born account), on every refund (taken back from the YooKassa
dashboard, partial and left for review, automatic for an orphaned or lapsed
payment, or an automatic one YooKassa declined), and on a failed automatic
renewal (YooKassa's reason, and whether the card was dropped).

**An alert never costs the caller anything.** Every method returns `void`: it
decides synchronously, then composes and sends detached, and any failure —
including the database lookup for a name — is logged and dropped. A YooKassa
webhook or a cron job never waits for Telegram and never fails because of it.
It lives in `TelegramNotifyModule` and is imported by file, like
`TelegramNotifyService` ([above](#telegram-is-a-second-door-to-the-same-account)).

**A node is down when it has been silent for a while, not when one probe
failed.** `node-health` reports every probe; a failed one counts only once the
node's last healthy probe — or its creation, for a node that never answered — is
`OWNER_ALERT.nodeDownAfterMinutes` old. `nodeAlert` then announces "down" once,
repeats it every `OWNER_ALERT.repeatMs` while the node stays down, and announces
"recovered" only for a node whose "down" was sent. A flapping node therefore
costs at most one of each per hour, and the owner's latest message about it is
never more than an hour out of date. The state is in memory: after a restart a
node still down is announced again, and one that recovered across the restart
gets no recovery line.

**Load and reconcile alerts are once per node per kind per hour**
(`BOT_THROTTLE.limits.ownerAlert`, keyed `cpu:<node>`, `memory:<node>`, `reconcile:<node>`).
Billing alerts ride on the claims billing already makes: a settled payment is
announced only by whoever claimed it, and an automatic refund only when this
call moved the row to `refunded` — a webhook retry racing the pending sweep
announces nothing twice. The one alert that could repeat is a refund YooKassa
canceled: the payment stays pending and the sweep tries again every ten
minutes for a week, so `refundCanceled` speaks once per payment per
`OWNER_ALERT.refundCanceledRepeatMs` (a day). The settled alert goes out before
the reader's own notice, so a failure there cannot swallow it.

**A node is named, never located.** Alerts use `nodeLabel` — flag, country,
city — and never the panel URL, which carries a secret path, for the same reason
logs do not. A reconcile error is cut to `OWNER_ALERT.errorLength` characters and
escaped.
