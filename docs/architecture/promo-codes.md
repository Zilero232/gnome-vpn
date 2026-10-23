# Promo codes and gifts

One word for the reader, three kinds of code underneath: a friend's code, a
campaign code the owner creates, and a gift code someone bought. Code:
`apps/server/src/modules/promo-codes/`, the discount and the gift in
`modules/billing` (`CheckoutService`, `WebhookService.settlePayment`), the
shared format and pricing in `packages/schemas/src/promo-codes`, the client in
`features/account/invite-friends` (entering a code) and
`features/billing/gift-subscription` (buying and listing gifts). Referrals keep
their own rules — [referrals.md](referrals.md); payments and refunds —
[billing.md](billing.md). Part of the [documentation index](../README.md).

## Three kinds, told apart by shape

| Kind     | Who makes it             | Shape                                                      | Effect                                              |
| -------- | ------------------------ | ---------------------------------------------------------- | --------------------------------------------------- |
| friend   | every account, on demand | 8 of the `SHORT_CODE` alphabet (`ABCD2345`)                | the referral: days for the first payment, as before |
| gift     | a paid gift purchase     | 12 of the `SHORT_CODE` alphabet, shown as `ABCD-EFGH-JKMN` | the bought plan's length in days, once              |
| campaign | the owner                | 4–24 of `A–Z0–9`, never one of the two shapes above        | a percent off one next payment, or N days at once   |

`promoCodeOrigin` (`@gnomevpn/schemas`) decides the kind from the shape alone,
so the three namespaces cannot collide by construction: a campaign code shaped
like a friend or gift code is refused when it is created (`codeLikeFriend`,
`codeLikeGift`), and a gift code can never be 8 characters. That is the
"enforce at creation" rule — no lookup in another table is needed, and a
referral code minted later can never turn out to be somebody's campaign code.
The owner who wants `SUMMER25` (eight glyphs, all in the alphabet) adds a
character or uses one of `0 O 1 I L`, which the short-code alphabet leaves out.

**`-` is not part of any code.** `normalisePromoCode` trims, uppercases and
drops whitespace and dashes, so `blogger-20`, `BLOGGER 20` and `BLOGGER20` are
one code, and a gift shown grouped as `ABCD-EFGH-JKMN` works pasted either way.
Allowing `-` inside campaign codes would have made `BLOGGER-20` and `BLOGGER20`
two different codes that read the same — a support question waiting to happen.

Gift codes use the short-code alphabet for the same reason invite codes do:
they are retyped from screenshots and chats, and the alphabet has no `0/O`,
`1/I/l`. Twelve characters give 31¹² ≈ 8·10¹⁷ codes, so a gift cannot be
guessed; a campaign code is meant to be public and needs no such length.

## One entry point

`POST /promo-codes/redeem` takes any code (`redeemPromoCodeSchema`, throttled
to 10 a minute per address) and dispatches on the shape:

- **friend** → `ReferralService.attribute`, unchanged — the same eligibility,
  the same `REFERRAL_*` refusals;
- **campaign or gift** → `PromoRedemptionService`, below.

The answer is `{ kind, percent, days, currentPeriodEnd }`, and the client picks
its toast by `kind` (`redeemedMessage`): the referral message as before,
«Промокод применён — скидка 20% на следующую оплату», «+30 дней к подписке»,
«Подарок активирован». `POST /referrals/claim` is gone. The bot still
attributes its `ref_` start payloads directly and has no field for other codes
yet; `PromoRedemptionService` is exported for when it gets one.

Every place on the site that took a friend code takes any code now, through the
same cookie: the sign-up field (`optionalPromoCodeSchema`, mirrored into
`gnomevpn-ref` on every keystroke), links, and the Invite tab form, which is
shown to every account now — a friend's code is still refused after the first
payment, a campaign or gift code is not. A link carries a friend or a gift code
in `?ref=` (a shared gift is `?ref=ABCDEFGHJKMN`) and a campaign code in
`?promo=` (`?promo=BLOGGER20`; `REFERRAL_CODE.promoParam`). `?ref=` refuses
campaign-shaped values: other sites put their own referrer tags there
(`?ref=producthunt`, `?ref=habr`), which used to be stored as a code and greet
the reader with «Промокод не применился» for something they never typed.
`useClaimPendingPromoCode` keeps the referral semantics on the account page:
the cookie is deleted before the request and put back only after a transient
failure; a final refusal (`isFinalRefusal`: any `REFERRAL_*`,
`PROMO_CODE_INVALID`, `_EXPIRED`, `_USED_UP`, `_ALREADY_USED`,
`VALIDATION_FAILED`) leaves it deleted. A **gift** code from the cookie is never
redeemed on its own: the page asks «У вас есть подарочный код — активировать?»
and redeems it only on «Активировать» («Не сейчас» drops it). A buyer opening
their own link to check it would otherwise spend the one-time gift on
themselves, irreversibly.

**Campaign and gift codes need a confirmed email.** `redeem` refuses them with
`PROMO_EMAIL_UNVERIFIED` until the account's email is verified (a Telegram
account with a placeholder email counts as confirmed — the same rule as the
trial). Sign-up starts a session without verification, so without it a script
could sign up `a1@x.test`, `a2@x.test`, … and redeem `WELCOME 7d` on each, and
someone could squat a stranger's address on a code before its owner signs up.
The refusal is not final on the client, so a code that came with a link or the
sign-up field stays in the cookie and applies on the first account visit after
the email is confirmed.

## Redeeming a campaign or gift code

`PromoRedemptionService.redeem` runs in one serializable transaction
(`withSerializableRetry`), so two redemptions racing for the last use of a
limited code cannot both pass the count. The refusals, in this order
(`redemptionRefusal`):

1. `PROMO_CODE_INVALID` — no such code, or an automatic one ([below](#automatic-codes));
2. `PROMO_CODE_ALREADY_USED` — this account has redeemed it already;
3. `PROMO_CODE_EXPIRED` — `expires_at` has come;
4. `PROMO_CODE_USED_UP` — `max_uses` redemptions exist (a gift has `max_uses = 1`).

**"This account" means its identities, not only its row.** Each redemption
stores the hashes of the account's email and Telegram id — the same
`trialIdentities` hashes the trial uses ([billing.md](billing.md#the-trial)) —
and a code already redeemed under any of them is refused. Without that, deleting
the account and signing up again with the same address would redeem a 30-day
code every month. Redemption rows outlive the account (`user_id` is set to null
on deletion), so they also keep counting against `max_uses`.

### Days and gifts extend access at once

The new end is `max(now, current end) + N days` (`accessExtension`). A period
that lapsed beyond the config grace (`PERIOD_GRACE.hours`) loses its paid extra
devices, exactly as `activate` does on a late renewal — a free code must not
revive last year's extras. The subscription row is created when there is none.

A period extended this way is a paid period to `periodKind` (it runs past
`trialStartedAt + TRIAL_DAYS`), which is what it should be: it is a gift or a
reward, not a taster. Two consequences, both deliberate: an account that never
had a period stops being offered the trial (it has days already), and a trial
extended by a code becomes a paid period, whose end `recurring-charge` will not
charge without a saved card. A bot-born account that holds a redemption is no
longer "untouched", so linking it is refused instead of merging it away with
its days (`isUntouchedTelegramUser` counts `promoRedemptions`).

Access is restored the way a payment restores it: `setEnabledAll` right after
the commit is best-effort, and the restore half of `expired-access` — which
reads only `current_period_end` — is the guarantee
([pitfalls](pitfalls.md), [billing.md](billing.md#prices-flags-and-webhooks)).

## The discount lifecycle

1. **Redeemed.** A discount code writes a redemption and nothing else; it waits
   as the account's pending discount (`consumed_at` and `replaced_at` null).
   `GET /promo-codes/discount` returns it.
2. **Replaced.** Redeeming another discount code marks the pending one
   `replaced_at`. One pending discount at a time keeps the checkout honest about
   which one applies, and the newest is the one the reader just typed. A
   replaced discount is never offered to a new checkout, and the code's one
   redemption for that account is spent. One exception, on purpose: a payment
   already opened at the older discount still settles with it if the reader
   pays that page after all — they paid exactly the price they were shown, and
   refunding it would cost them the access they bought. Each code is still
   used once per account, so the most a reader gets this way is both codes,
   each once.
3. **Priced.** `CheckoutService.createCheckout` (site and bot) quotes
   `discountedPriceRub`: `round(price × (100 − p) / 100)`, never below 1 ₽. The
   payment row records `promo_code_id` and `discount_percent`; the YooKassa
   amount is the discounted one. A reused pending payment must carry the same
   discount and amount, so a payment opened before the code was redeemed is not
   handed back at the full price. The account page shows the struck-through
   price and «Ваша скидка −20% уже в цене» with «Промокод BLOGGER20» under it
   — the code comes second because an automatic discount carries one the
   reader never typed; the bot's checkout message names the code and the full
   price.
4. **Consumed** — only when that payment succeeds, inside the settling
   transaction (`PromoDiscountService.consume`, a compare-and-set on
   `consumed_at`). A cancelled or abandoned payment leaves the discount pending.
   If the discount was already consumed by another payment — two checkouts
   opened with one discount and both paid — the claim fails, the transaction
   rolls back, and the second payment is refunded automatically
   (`discountUsed`, [billing.md](billing.md#refunds)), so a discount pays for
   exactly one payment.

A discount never applies to an automatic renewal (`recurring-charge` records
the plan's full price), to extra devices or to a gift. So a reader whose
auto-renewal is on still sees the plan picker while a discount is pending —
otherwise the account page hid it and the discount waited forever for a manual
payment nobody could start — and the toast says the discount is for one
subscription payment, not for auto-renewal. It stacks with the
referral: the friend's first payment is still rewarded, discounted or not. A
refund of a discounted payment does not give the discount back. An expiry stops
new redemptions; a discount already redeemed stays until it is used or replaced.
The shop sends no fiscal receipts with payments today; if it starts, the item
amount must be the charged amount, not the plan price.

## The gift lifecycle

1. **Bought.** «Подарить подписку» on the Subscription tab → `POST /billing/gift`
   → a payment of kind `gift` at the plan's full price, with
   `save_payment_method: false`. It never renews anything, is not a first
   payment for referrals, does not block or count as the reader's own renewal,
   and is left out of the status's `lastPayment`.
2. **Issued exactly once.** The webhook and the `pending-payments` sweep both
   reach `settlePayment`, which claims the payment row `pending → succeeded`;
   only the claimant issues the gift, in the same transaction
   (`GiftCodeService.issue`). `promo_code.payment_id` is unique as a second net,
   and `giftToIssue` returns nothing for a payment that already has its gift.
   A random code colliding with an existing one aborts the transaction; the
   payment stays pending and the next sweep tries again with a fresh code.
3. **Announced.** The buyer gets `giftPurchased` in Telegram and by email
   (the code, and in the bot the days). The Subscription tab lists every gift —
   the code (tap to copy), plan, purchase date, «Не активирован» or «Активирован
   <date>», and a share button that sends a `?ref=<code>` link. While a gift
   payment from the last `GIFT.pendingMinutes` is pending, the list says so and
   polls.
4. **Redeemed** by anyone, the buyer included, once, with no expiry: the
   plan's length in days, `round(months × 365 / 12)` — 30, 183, 365
   (`giftDays`), stored on the code when it is issued.

A gift survives its buyer: deleting the account sets `buyer_id` to null, since
the code may already be in someone else's hands. A gift payment still pending
when the buyer's account is deleted is refunded automatically (`orphan`). A gift
refunded in the YooKassa dashboard is disabled (`expires_at = now`), and if it
was redeemed, its days come off the redeemer's period — never before now, as
with any refund.

## Creating campaign codes

The owner creates codes in two places that call the same service: the
«Промокоды» tab of the web admin panel ([admin.md](admin.md#promo-codes)), and
`/promo` in the bot's admin chat — `/promo BLOGGER20 20% uses=500 until=2026-12-31`,
`/promo WELCOME 7d`, `/promo off CODE` to stop one, `/promo` alone for the syntax
and the latest codes with their use counts
([telegram-bot.md](telegram-bot.md#owner-commands)). The service both call:

```ts
PromoCampaignService.create({
  code: 'BLOGGER20',
  kind: 'discount', percent: 20, // or kind: 'days', days: 30
  maxUses: 500,                  // optional, null or absent = unlimited
  expiresAt: new Date('2026-12-31T21:00:00Z') // optional
}): Promise<PromoCampaign>
```

`campaignProblem` validates strictly — the format, the two forbidden shapes, a
whole percent of 1–90 (`PROMO_DISCOUNT`) or whole days of 1–365 (`PROMO_DAYS`),
`maxUses` ≥ 1, an expiry in the future — and refuses with `VALIDATION_FAILED`
and an English message for any caller; the bot runs the same check first and
answers in the admin's language. A code that exists already is
`PROMO_CODE_TAKEN`. The code is stored normalised. `latest()` lists the newest
campaign codes with their redemption counts, and `stop({ code, now })` sets the
expiry of a live one to now — redemptions stop, a discount already redeemed is
kept.

## Automatic codes

A campaign code with `is_automatic` set is granted by the server, never typed:
the win-back job's two system codes, `WELCOMEBACK` for lapsed payers and
`AFTERTRIAL` for trials that were never paid ([scheduler.md](scheduler.md#win-back)).
They are ordinary `discount` codes otherwise, so the discount lifecycle above
applies unchanged — the grant is a redemption, checkout prices it, a succeeded
payment consumes it, a cancelled one leaves it pending.

- **Created idempotently.** `AutoDiscountService.ensure` creates the code on
  the job's first run (a race on the unique code re-reads the winner), and
  keeps its percent equal to `WIN_BACK.percent`. A code of that name that
  exists and is not automatic — an owner's own campaign — is never taken over:
  the job logs an error and skips that audience.
- **Not redeemable by typing.** `PromoRedemptionService.redeem` answers
  `PROMO_CODE_INVALID` for an automatic code, exactly as for a code that does
  not exist, so `?promo=WELCOMEBACK` or the Invite tab form give nothing away.
  A friend- or gift-shaped name could never be one: a test runs both names
  through `campaignProblem`.
- **Granted once, never over another discount.** `AutoDiscountService.offer`
  answers `held` when the account already has a pending discount (any code —
  it is never replaced), `used` when the account or any of its identities has
  ever redeemed an automatic code, and otherwise writes the redemption with the
  identity hashes and answers `granted`.
- **Visible like any campaign.** The admin campaigns list and `/promo` show
  them with their uses, the payments discounted with them and the revenue
  (`campaignView` needs nothing special: they are `discount` codes). Stopping
  one there (`expires_at = now`) pauses that win-back audience; a discount
  already granted stays, as with any stopped code. The reader sees the code's
  name beside the discount at checkout («−20% по промокоду WELCOMEBACK»), which
  is why the names read as greetings rather than internal labels.
- **Ignored when a bot account is merged.** `isUntouchedTelegramUser` counts
  only manual redemptions, so a trial-only Telegram account that was offered
  `AFTERTRIAL` can still be merged into the site account its owner links;
  the unspent grant goes with the deleted bot account.

## Data

- `promo_code` — `code` (unique), `kind` (`discount` | `days` | `gift`),
  `percent` or `days` (a check constraint ties them to the kind), `max_uses`,
  `expires_at`, `is_automatic`; for a gift also `plan`, `buyer_id`, `payment_id` (unique).
- `promo_redemption` — one row per account and code (`unique(promo_code_id,
  user_id)`), the identity hashes, and for a discount `replaced_at`,
  `consumed_at` and the consuming `payment_id` (unique).
- `payment` — `promo_code_id` and `discount_percent` on a discounted payment;
  the `gift` payment kind.

Migrations: `20261023130000_promo_codes_and_gifts`; `is_automatic` came with
`20261025100000_win_back`; `20261026100000_drop_write_only_columns_and_indexes`
indexes `payment(promo_code_id)`, which campaign revenue groups by, and
`promo_code(kind, created_at)`, which the admin lists of one kind read.
