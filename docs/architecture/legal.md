# The public offer

`/terms` — «Публичная оферта», "Terms of Service" in English — is the contract a
paying reader enters into. YooKassa asks for one before it enables automatic
payments, and a shop that charges cards without its terms in writing has
nothing to point to when a charge is disputed. Code: `views/terms` and the
`terms` message namespace in `apps/client`; the layout it shares with the
privacy policy and the personal data consent is `widgets/site/legal-document`.
The consent on `/consent` has [its own section](#consent-to-personal-data-processing)
below. Part of the [documentation index](../README.md).

## What it covers

Sixteen numbered sections: definitions, subject, acceptance, the service and
how it is delivered, the user's obligations and prohibited use, prices and
payment, automatic renewal, the trial, refunds, bonuses, promo codes and
gifts, the end of a subscription and termination, liability, personal data,
changes to the offer, governing law and disputes, contacts — then the seller's
requisites when they are set (below). Clause numbers (`4.6.`) are generated from the position, so a
clause added to a section renumbers the rest without anyone editing numbers by
hand; the text never refers to a clause by number, only to a section by name.

Each section is `sections.<key>.title` and an array `sections.<key>.clauses`.
`TERMS_SECTIONS` (`views/terms/config`) lists the keys in page order with each
section's clause count, and a test checks the counts against both locales, so a
clause added in one language and not the other fails `bun run test`.

The Russian text is the contract; the English one says it is a translation and
that the Russian prevails.

## The text describes the code, so it moves with the code

Every promise in the offer was taken from what the server does, not from what a
VPN offer usually says. When a billing rule changes, the offer changes in the
same pull request and `TERMS_UPDATED` moves:

| Offer                                                                 | Where it comes from                                                                                                   |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| trial length, device limit, max extra places, gift days               | `TRIAL_DAYS`, `DEFAULT_DEVICE_LIMIT`, `MAX_EXTRA_DEVICES`, `giftDays(plan)` — interpolated through `TERMS_VALUES`     |
| prices                                                                | not in the text at all: «цена на странице «Тарифы» в момент оплаты»                                                   |
| charge in the last 24 hours, one attempt per payment method           | `WINDOW.renewHours`, `wasAttempted` in `recurring-charge` ([billing.md](billing.md))                                  |
| renewal amount: the last plan bought at today's price, else monthly   | `findPlan(subscription.plan).priceRub` in `recurring-charge`; `activate` writes the plan, a code or trial row `DEFAULT_PLAN_ID` |
| no discount on a renewal, extra places or a gift                      | `recurring-charge` and `buyExtraDevices`/`buyGift` price without `PromoDiscountService.quote`                         |
| reminder "usually three days before", email and bot                   | `WINDOW.remindHours`, `renewSoon` in `period-reminder`, `NoticeEmailService`                                          |
| paying outside a paid period saves the method and turns renewal on    | `save_payment_method: isRecurringEnabled()` in `CheckoutService`; `activate`'s `isConsentGiven` ([billing.md](billing.md#automatic-renewal)) |
| paying inside one keeps the choice; card binding and the toggle turn it on | `resolveCancelAtPeriodEnd`, `attachPaymentMethod`, `AutoRenewService.resumeAutoRenew`; unbinding: `unbindCard`  |
| only the card mask is kept                                            | `describeCard` (type and last 4) into `savedCardTitle`                                                                |
| an unusable card is unbound                                           | `CARD_LOST_REASONS`, `dropUnusableCard`                                                                               |
| refund rewinds the period, takes referral days back                   | `handleRefund`, `ReferralRewardService.revoke` ([billing.md](billing.md#refunds))                                     |
| a refunded gift is disabled and its days taken back                   | `GiftCodeService.revoke` ([promo-codes.md](promo-codes.md#the-gift-lifecycle))                                        |
| automatic refunds                                                     | lapsed extra places (`lapsed`), a payment of a deleted account (`orphan`), a discount already used (`discountUsed`)  |
| a campaign code: one discount or days, one pending discount, once per identity, email confirmed | `PromoRedemptionService`, `PromoDiscountService` ([promo-codes.md](promo-codes.md#the-discount-lifecycle)) |
| a gift: single use, no expiry, survives the buyer, not a renewal      | `GIFT.maxUses`, `buyer_id` set null, `save_payment_method: false` in `buyGift`                                        |
| extra places end 6 hours after a lapse                                | `activate` resets `extraDevices` past `PERIOD_GRACE`; `graceDeviceLimit` in the device-slot sweep                     |
| a shrinking limit cuts the newest devices, deletes WireGuard configs  | `DeviceLimitService.revokeOverLimit` (`device-slots` job), `slotHolders`                                                 |
| a WireGuard config goes with its node or the node's new settings      | `buildNodeSync` in `scripts/provision/node/node-sync`                                                                 |
| trial once per email and Telegram identity, never after any access    | `trial_grant` ([billing.md](billing.md#the-trial)); `trialState.isTrialAvailable` needs no `currentPeriodEnd`        |
| no deletion while a payment is pending                                | `ACCOUNT_PAYMENT_PENDING`                                                                                             |

A number that has no constant on the client is written out in both languages:
the 14 days of the refund promise (the same figure the pricing page, the FAQ
and the landing page already make), the last 24 hours of a period, "usually
three days", the 10 days to answer a claim, the 6 hours of `PERIOD_GRACE`
after which extra places end, the 1-month plan a code-only account renews on,
and the age of 14 (the privacy policy says the same). Search the two
`terms.json` files for them when one of those changes. The privacy policy
writes out its own: the 30 days a session lasts (`SESSION.expiresIn`), the 90
days a support thread is remembered (`RETENTION.supportMessageDays`), the 7
days after which an expired session goes and the 1 day for verification codes
and one-time sign-in links (`RETENTION.expiredSessionDays`,
`RETENTION.expiredCodeDays`, the `expired-records` job), the 30
days within which a deleted account leaves the backups (retention is fixed in
`docker-compose.yml` so the oldest dump is at most 22 days old —
[ops/backups.md](../ops/backups.md)), and the 10
working days, extendable by 5, to answer a data request (152-ФЗ).

**Referral bonuses are worded generally; promo codes and gifts are not.** The
referral numbers live in `REFERRAL_REWARDS` and are shown in the account and
the bot; the offer only says that bonuses follow the rules shown in the service
at the time and have no cash value. Campaign codes and gifts are spelled out
because they decide what a payment buys: a discount is one payment's, never a
renewal's; a gift is a paid product with its own refund consequences, and the
person who activates it is not the person who paid. Both follow
[promo-codes.md](promo-codes.md); a change there is a change to the
«Бонусы, промокоды и подарки» section in the same pull request.

## Refunds: the promise and the statute side by side

The site has always promised a refund of the unused period within 14 days, no
questions asked, and the offer keeps that promise: the unused part is counted
in whole days of the term that payment bought, and a term that has not started
yet (bought on top of a running one) is refunded in full.

It does not make 14 days a cut-off. Under Article 32 of the consumer protection
law a consumer may withdraw from a services contract at any time, paying only
the provider's actual costs, and a clause that narrows a consumer's statutory
right is void and finable (КоАП 14.8). So the 14 days stay a promise and the
last clause of the section says the statute is not limited by it. For the same
reason the disputes section asks for a claim by email but does not make it a
precondition for going to court, and the liability cap applies only "to the
extent the law allows".

Only full refunds are automated (`handleRefund`); a partial one is logged and
alerted for a person, who adjusts the period by hand — and the refund the offer
promises, the unused part of a term, is usually partial. The offer promises the
refund within 10 days of the request — the term the consumer law sets for
refund demands.

## The seller's requisites are build-time variables

The offer must name the seller, and the seller may be an individual
entrepreneur (ИП: ИНН and ОГРНИП) or self-employed (самозанятый: ИНН only). The
values are not invented anywhere in the repository; they come from five
optional variables validated in `shared/config/client-env.ts` and grouped as
`SELLER` in `shared/config/seller.ts`:

| Variable                     | Format                                                  |
| ---------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SELLER_NAME`    | any text; empty hides the requisites section            |
| `NEXT_PUBLIC_SELLER_STATUS`  | `entrepreneur` or `selfEmployed`, shown as a translated label |
| `NEXT_PUBLIC_SELLER_INN`     | 12 digits                                               |
| `NEXT_PUBLIC_SELLER_OGRNIP`  | 15 digits                                               |
| `NEXT_PUBLIC_SELLER_ADDRESS` | any text                                                |

An empty value counts as unset, so a missing repository variable is an empty
build arg and never fails the build; a malformed one fails it. `sellerRows`
prints only the fields that are set, in that order, and the support email
always closes the list. Both live in the legal-document widget
(`SellerRequisites`, labels under `common.legal.seller`), because the offer's
«Реквизиты исполнителя» and the consent's «Оператор» render the same list. The page is prerendered, so the values are read at
build time: `deploy.yml` passes them from the repository variables `vars.SELLER_*`
through the Dockerfile's build args, the same way `NEXT_PUBLIC_API_URL` goes in,
and changing them needs a redeploy. The variables are listed in
[ops/deploy.md](../ops/deploy.md#secrets).

Until `SELLER_NAME` is set the offer names no seller and the consent names no
operator. Set it before taking real payments.

## Where the offer is accepted

Acceptance is creating an account, starting the trial or paying, so the link
sits wherever one of those happens:

- the sign-up form: «Создавая аккаунт, вы принимаете условия оферты и политику
  конфиденциальности», both linked;
- wherever a button leads to YooKassa: `OfferNote` at the foot of the
  Subscription tab, beside the payment-methods note and so under the plan
  picker, the renewal panel and the gift purchase, and again under extra
  places — "by paying you accept";
  under «Привязать карту» and «Включить автопродление» the `autoRenew` variant,
  which names automatic charges;
- the bot's payment messages (`checkoutIntro`, `devicesIntro`) end with a link
  to the offer in the reader's language (`TelegramSharedService.termsUrl`);
- the pricing page, the footer's legal group beside the privacy policy, and a
  footnote on the privacy policy itself.

The bot creates an account on `/start` without showing the offer; using the
service is acceptance by conduct, and the first payment in the bot shows the
link before YooKassa does. The consent to personal data is stated where the
press happens — the bot's description and its first message — and recorded
([consents](#consents)).

`OfferNote` reads `terms.notes`, the only part of the namespace sent to the
browser (`CLIENT_MESSAGES`); the offer itself is server-rendered and stays out
of the client bundle, which the client-messages test asserts.

## Copy describes the product, never bypassing blocks

Russian law fines advertising and popularising ways to get around blocked
resources, and the people who sell VPN access are the ones it is aimed at. So
the site, the bot and the blog describe what the product does — a private,
stable connection; protocols that keep working on networks that drop UDP or
filter traffic — and never call it a way around blocks, never say a protocol
"bypasses blocking", and never say what the state blocks. A protocol that is
unreliable is described by how it behaves for the reader ("easy to recognise,
often fails on mobile networks"), which is what they need to choose. Technical
statements about a network — a hotel Wi-Fi that drops UDP, an office filter
that passes only 443 — are not that, and stay. Two more shapes are out: naming
the services a reader may want to reach — not even as a list of what people do
with them: «Видео в 4K, игры и звонки без лагов» went from the bot's greeting
and description, since video, games and calls are what gets slowed or
restricted, and they now say «Защищённое соединение в любой сети» and
«Серверы в нескольких странах» — and presenting a protocol as a disguise. Reality
"carries the TLS handshake of a real site, so it works where only HTTPS on 443
is open" — never "looks like ordinary HTTPS" or "only active probing can tell
it apart"; WireGuard is "easy to recognise by its handshake", not
"undisguised". New copy follows the same rule; the docs in English are
internal and may name things as they are.

The October 2026 pass over every namespace, the metadata, `llms.txt` and the
blog took out the shapes that had slipped back in, and they are worth naming
so they stay out:

- **No market in the title.** The landing title was "быстрый VPN на Hysteria2
  для России"; a VPN sold "for Russia" reads as a VPN for what Russia
  restricts. The title says what the product is, and the routing setting
  («Российские сайты — напрямую») is the only place Russia is named.
- **No reaching a service as a reason to pick a server.** "Pick the nearest
  country unless a location is what you need for a service" and the FAQ's
  "do streaming services work — if one does not open, try another country"
  were both a way to reach something by changing country. The rule is now just
  "the nearest country", and the streaming question became `videoCalls`
  — speed, lag, the nearest server for a lower ping.
- **No disguise by comparison.** "Like ordinary HTTPS" went from the servers
  table and the posts: VLESS "runs over TCP on port 443, the port HTTPS sites
  use". The post on Reality no longer names an example site whose handshake it
  borrows.
- **No unexplained instability.** "The connection drops a few minutes after
  data starts flowing, and changing port or server helps only briefly" (about)
  and "sometimes nodes have to change" describe interference without naming
  it; the copy now talks about packet loss, which is what the protocol choice
  is actually about.
- **Lawful use is said where it is asked.** The torrents answer says to
  download only what is distributed lawfully.

## Consent to personal data processing

Since 1 September 2025 consent to personal data processing has to be a
document of its own (152-ФЗ, article 9 as amended): a clause in the offer or a
line in the privacy policy no longer counts. `/consent` — «Согласие на
обработку персональных данных» — is that document. Code: `views/consent`, the
`consent` namespace, `CONSENT_SECTIONS` in `views/consent/config` with the
number of list items each section has (a test checks both locales, as the
offer's clause counts are checked).

It is written in the first person, the way a consent is given, and holds what
article 9 asks of one: the operator (the seller's requisites through
`SellerRequisites`, the support address always), the data, the purposes, the
actions, transfer to third parties including cross-border (Telegram,
Cloudflare, the VPN nodes abroad that see the device's IP address), the term,
how to withdraw it and how it is given. The list of data is the privacy
policy's list, which was taken from the Prisma schema; a field added to the
schema that stores something about a person is a line in both. It names no
dissemination («распространение») — that would need a consent of its own
(article 10.1). The English text says it is a translation.

**How it is given on the site:**

- the email sign-up form has an unticked checkbox «Я даю согласие на обработку
  персональных данных», linked to `/consent`, and the form does not submit
  without it. The field, `isConsentGiven`, exists only in the client:
  `signUpFormSchema` (`features/auth/sign-up/lib/sign-up-form`) extends the
  shared `signUpSchema`, the sign-up request still carries only email and
  password, and the consent is recorded by a separate call once the account
  exists ([below](#where-the-client-collects-them)). The line about the offer
  and the privacy policy stays under the button;
- the Telegram sign-in widget on `/auth` carries «Входя через Telegram, вы
  даёте согласие на обработку персональных данных», linked. The line is part
  of `TelegramLoginButton`, so it disappears with the widget when the bot is
  not configured or Telegram is unreachable.

`/telegram` (a one-time link from the bot) only signs in to an account that
already exists, so it carries no line. Accounts the bot creates on `/start`
are told by the bot itself, before and after the press, and the server records
their consent ([below](#consents)). Recording a consent given on the site is
the server's job as well, through `POST /consents/personal-data`.

The page is indexed like `/privacy` and `/terms`: `INDEXED_ROUTES`, the
sitemap, `llms.txt`, the footer's legal group. The privacy policy's footnote
and its rights section, and the offer's personal data section, point to it.

**Backups follow the 30 days.** Article 21(5) gives an operator 30 days to
destroy data after consent is withdrawn, so the backup rotation was shortened
to keep no dump older than 22 days, and the policy and the consent say deleted
data leaves the backups within 30 days.

## Consents

`consent` (`20261026130000_admin_action_and_consent`) is the record of what
each account agreed to: `kind` (`personalData`, `marketing`), the `version` of
the text, `granted`, `source` (`signup`, `telegram`, `account`, `bot`, `email`)
and when. It is append-only — the latest row of a kind is the current state,
the rows before it are the history a regulator or a dispute asks for — and it
cascades away with the account, like the rest of its data. A write that would
not change the state is skipped, so repeating a request adds no rows. Code:
`modules/consents`; the contracts are in `packages/schemas/src/consents`.

**Versions.** `PERSONAL_DATA_CONSENT_VERSION` (`@gnomevpn/schemas`) is the date
of the `/consent` text in force; it moves with that page, and a consent recorded
for an older version is the reader's agreement to the older text. Nothing asks
again automatically when the version moves: a material change to `/consent`
means bumping the constant and deciding then whether to ask existing accounts.
`MARKETING_CONSENT_VERSION` names the wording of
the offers checkbox the same way.

**Where each is recorded.**

| Consent       | Recorded                                                                                           | Source     |
| ------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| personal data | sign-up on the site: the client posts `POST /consents/personal-data { version, source: 'signup' }`; idempotent for one version | `signup`   |
| personal data | an account created through Telegram — `/start`, a `ref_` arrival, the site's login widget (`TelegramLinkService.ensureChat`) | `telegram` |
| marketing     | `PUT /consents/marketing { granted, source }` from the sign-up form or the account page               | `signup`, `account` |
| marketing     | «Не присылать предложения» / «Присылать предложения» and `/offers` in the bot                       | `bot`      |
| marketing     | the unsubscribe link in a promotional email (`GET /consents/unsubscribe?token=`, anonymous)          | `email`    |

`GET /consents` answers `{ personalData: { granted, version, at } | null,
marketing: { granted, at } | null }`. Nothing is backfilled: an account created
before the table existed has no recorded consent, so it is offered nothing
until it opts in.

**Offers need the marketing consent; service messages do not.** The law on
advertising (38-ФЗ, art. 18) allows advertising by email and messenger only
with the recipient's prior consent and requires stopping on request. The
promotional notices are the ones that offer something — the three win-back
messages with a discount (`isPromotional` in `NOTICES`). `win-back` skips an
account whose latest marketing consent is not granted before it claims or
grants anything, and `TelegramNotifyService.tell` refuses a promotional notice
for such an account on both channels, failing closed when the consent cannot
be read ([telegram-bot.md](telegram-bot.md)). Payments, renewals and their
advance notice, declined cards, period endings, device changes, an unfinished
checkout, a bought gift and referral rewards are service messages about the
reader's own account and order, and are sent regardless; so is the one-line
invite on a payment and the first device, which describes the account's own
referral rewards.

**Unsubscribing.** A promotional email ends with an unsubscribe link,
`${CLIENT_URL}/unsubscribe?token=…` (`/en/unsubscribe` in English), and
carries it as `List-Unsubscribe`. The token is the account id and an HMAC-SHA256
of it under `BETTER_AUTH_SECRET` with its own purpose label
(`signUnsubscribe`), so it needs no table, never expires and cannot be forged
for another account; rotating that secret invalidates the links already sent.
The client's page calls `GET /consents/unsubscribe?token=`, which records the
withdrawal and answers `{ outcome: 'unsubscribed' }`, or `invalid` for a token
that does not verify; it is throttled per address. A promotional bot message
carries «🔕 Не присылать предложения», which does the same in one press.

### Where the client collects them

- **Sign-up form** (`features/auth/sign-up`): the required «Я даю согласие на
  обработку персональных данных» and an optional, unticked «Присылать
  персональные скидки и предложения» (`isMarketingConsentGiven`, client-only
  like `isConsentGiven`). After the account is created `useSignUp` posts
  `POST /consents/personal-data` with `PERSONAL_DATA_CONSENT_VERSION` and,
  only when the second box is ticked, `PUT /consents/marketing { granted: true,
  source: 'signup' }`. Neither call can fail the sign-up: a rejection is logged
  and the reader lands in the account as usual.
- **The missing personal-data record is retried, and only for the reader who
  ticked the box.** Before posting, the form stores `{ userId, version }` in
  `localStorage` (`STORAGE_KEYS.pendingConsent`, `shared/lib/pending-consent`)
  and clears it when the post succeeds. `useRecordPendingConsent`
  (`features/account/manage-consents`, called by the account page) posts it
  once per visit when `GET /consents` has no personal-data record and the
  stored `userId` is the signed-in account; with no stored entry — an account
  from before the checkbox, another browser, a Telegram account — nothing is
  posted, because the client has no evidence that this person agreed.
- **Settings tab**: «Рассылка» holds the switch «Присылать скидки и акции»
  with the line that payment and expiry reminders arrive either way. The
  section is not called «Уведомления»: that read as an off switch for every
  message, while the switch covers promotional messages only. It reads
  `GET /consents` (`QUERY_KEYS.consents`) and writes `PUT /consents/marketing`
  with `source: 'account'`, optimistically, rolling back with a toast on an
  error.
- **Subscription tab, once**: an account whose `marketing` is `null` — never
  asked — sees «Присылать персональные скидки?» with «Да» and «Нет» under the
  tab's main content, only while it has access, so it never sits beside the
  free-day or verify-email hero, which only an account without access sees.
  Both answers are a `PUT` (`granted: true` / `false`), so «Нет» is recorded
  too and the question does not come back on any device.
- **`/unsubscribe`** — the page the email link opens ([web-client.md](web-client.md#unsubscribe)).

## What the offer promises that a person has to do

- **Receipts.** The offer says a receipt is provided as the law requires. The
  checkout sends YooKassa no `receipt` object, so 54-ФЗ receipts (or «Мой
  налог» for a self-employed seller) are the owner's job until that is wired.
- **Refunds** are made in the YooKassa dashboard within 10 days of the request.
- **A partial refund changes nothing by itself.** `handleRefund` acts only on a
  payment refunded in full; for a partial one the period, auto-renewal and the
  referral days all stay as they were, while the offer promises the period is
  shortened, renewal turned off and bonus days taken back. The owner does that
  by hand — the admin panel has «Выключить автопродление» and day grants.
- **Turning off renewal by email** for someone locked out of the account.
- **Telling users about material changes** by email or through the bot — the
  bot's `/broadcast` reaches every linked chat, there is no tooling for a mass
  email; bump `TERMS_UPDATED` at least.
- **Keeping `/broadcast` to service messages.** The offer calls what the bot
  and the emails send service messages and promises advertising only where the
  law allows; under the advertising law that means the reader's prior consent.
  The product now records that consent ([above](#consents)) and gates its own
  offers on it, but `/broadcast` copies the owner's message to every chat in
  the chosen audience without asking: a promotion sent with it is the owner's
  call and the owner's risk.

The text was written from the product's behaviour, not by a lawyer. Have it
read by one before relying on it in a dispute.
