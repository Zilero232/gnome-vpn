# Billing

YooKassa checkout, automatic renewal, the trial, and what deleting an account
does to the nodes. Code: `apps/server/src/modules/billing/` and the billing jobs
in `apps/server/src/modules/scheduler/` (the full job list is in
[scheduler.md](scheduler.md)). Discount codes, bonus-day codes and gift
subscriptions — what a promo code does to a checkout and to a settlement — are
in [promo-codes.md](promo-codes.md). Part of the [documentation index](../README.md).

## Where things live

`modules/billing/` is split by the door a payment comes through, plus the core
every door shares. A feature folder holds its controller, services, helpers
(`*.helpers.ts`), constants, types and `_tests/`; it reaches a sibling only
through `shared/`, and Nest wiring stays in `billing.module.ts`.

| Folder        | Routes and jobs                                                     | What it holds                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkout/`   | `POST /billing/checkout`, `/gift`, `/extra-devices`, `GET /payment-methods` | `CheckoutService` (one private `openPayment`, `claimedExtraDevices`, payment reuse), `PaymentMethodsService`, `localizedReturnUrl`, `offeredMethods`                     |
| `webhook/`    | `POST /billing/webhook`                                             | `WebhookIpGuard` and `isAllowedWebhookIp`, `WebhookService` — a `ts-pattern` dispatch on the event name                                                                     |
| `auto-renew/` | `POST /billing/cancel`, `/resume`, `/bind-card`, `/unbind-card`; `recurring-charge` | `AutoRenewService` (`dueSubscriptions`, `chargeDue`, `wasAttempted`, `isPaidByHand`, `dropUnusableCard`), `renewalIdempotenceKey`, `AUTO_RENEW`                          |
| `shared/`     | —                                                                   | `SettlementService` (`settlePayment`, `cancel`), `SubscriptionGrantService` (`grant`, `revoke`, `activate`), `RefundService`, `CardService`, `PaymentNoticeService`, `PendingPaymentService`; the pure decisions in `settlement.helpers.ts` and `refund.helpers.ts`; `PAYMENT_SETTLE_SELECT` and the row types derived from it |

`shared/` is the payment core rather than a drawer of leftovers: the webhook,
the hourly charge and the `pending-payments` sweep all settle through
`SettlementService`, and both the webhook and the charge drop a card and tell
the reader through the same `CardService` and `PaymentNoticeService`. A payment
row is read with `PAYMENT_SETTLE_SELECT` and parsed once into a `Purchase`
(`purchaseOf`) — `extraDevices` with a quantity, or `gift` / `subscription` with
a plan — and every branch on it is an exhaustive `match`.

What a payment changes on the subscription row (a term, extra places, banked
days, a rewind) goes through `SubscriptionPeriodService` in
`modules/subscription`, the one read-modify-write of the period that billing,
gifts, referrals and promo codes share.

## Prices, flags and webhooks

**The site names the payment methods the shop actually accepts.** Checkout sends
no `payment_method_data`, so YooKassa's own page offers whatever is enabled for
the shop — cards, SBP, SberPay and so on are switched on in the YooKassa
dashboard, not in this code. `PaymentMethodsService` asks `GET /v3/me` which
methods those are (`payment_methods`), maps the ones we have a name for
(`offeredMethods`, `YOOKASSA_METHODS`) and caches the answer for an hour, so
enabling SBP in the dashboard shows up on the pricing page and under the pay
button (`PaymentMethodsNote`, from the anonymous `GET /billing/payment-methods`)
within the hour, with no release. If YooKassa does not answer, the list is
cards only and is asked again after five minutes rather than an hour: the
cache holds what YooKassa answered (`cache.wrap`, its TTL picked from that
answer), and an empty answer is read as cards only. The fixed
texts (pricing, FAQ) therefore never promise a method: they say "by card or any
other method the payment page offers".

Prices live in `PLANS` ([`packages/schemas`](../../packages/schemas)), not in the environment: the server charges from that list and the landing page renders from it, so an advertised price cannot drift from a billed one.

Two flags decide what auto-renewal does, and they are not the same thing:

- **`YOOKASSA_RECURRING`** — whether the shop _can_ charge recurrently at all. YooKassa enables this per shop by hand, on request to support; there is no dashboard toggle. Until they do, `save_payment_method` and `POST /v3/payment_methods` both answer `forbidden`, so checkout fails outright. It defaults to `false`.
- **`subscription.cancelAtPeriodEnd`** — whether _this user_ wants renewal. Theirs to flip.

Renewal also needs a card on file (`savedCardId`). Without one the job has nothing to charge, so `resumeAutoRenew` refuses rather than promising a renewal that never happens — the client offers `bindCard` instead.

Webhooks are the only thing that activates a subscription; the browser returning to `YOOKASSA_RETURN_URL` proves nothing. `handleWebhook` never trusts the request body either — it re-reads the payment or payment method from the API, because a webhook is just JSON somebody posted. It answers `200` even when it does nothing: any other status makes YooKassa retry for a day.

**`POST /billing/webhook` is not throttled; it is gated by source address.** It
carries `@SkipThrottle()`, so the global per-IP limit never applies to it;
`WebhookIpGuard` (`isAllowedWebhookIp`) refuses any caller outside
`WEBHOOK_ALLOWED_CIDRS`, YooKassa's address ranges, instead. The address is put
in canonical form first (`canonicalIp`), so an IPv4 caller seen as
`::ffff:185.71.76.1` is checked as `185.71.76.1`.

**Re-enabling access happens outside the claiming transaction, so it must be recoverable.** `settlePayment` claims the payment row and grants the subscription atomically, then calls `setEnabledAll` — a separate write that can fail, or never run at all if the process dies right after the commit. That used to leave a paying user with every peer `disabled` and nothing in the system able to turn them back on: `expired-access` only ever revoked. It now sweeps both ways — its restore half re-enables `disabled` config peers whose owner has a live period (`activeSince`) — so the post-commit call is an optimisation and the job is the guarantee. Do not make `setEnabledAll` the only path back.

**Checkout returns the reader to where they started.** `YOOKASSA_RETURN_URL` is
the account page of the default locale (`/account`); the site sends its
`locale` with `POST /billing/checkout`, `/billing/gift` and
`/billing/extra-devices`, and
`localizedReturnUrl` prefixes the path for any other locale (`/en/account`),
matching next-intl's `as-needed` prefixing. A caller that is not the site — the
bot — passes its own `returnUrl` (`CreateCheckoutServiceInput`,
`BuyExtraDevicesServiceInput`), which wins over both.

**A second click reuses the first payment.** Checkout used to open a new
YooKassa payment on every click, so a reader who went back and pressed "Pay"
again left a trail of pending rows (and, for extra devices, pending places that
counted against `MAX_EXTRA_DEVICES`). `reusablePayment` now looks for a manual
pending payment of the same user, kind and plan (or quantity) created within
`CHECKOUT_REUSE.windowMinutes`, re-reads it from YooKassa and returns its
confirmation URL when it is still `pending` and goes back to the same return
URL. Anything else — settled, canceled, a different return URL, YooKassa not
answering — opens a new payment, so reuse can only save a payment, never block
one.

**The webhook accepts any event name and ignores the ones it does not handle.**
`WebhookEventDto` does not reject an event it has no branch for: an unknown
event is answered `200` and dropped. YooKassa retries anything non-2xx for a day,
so a validation error on an event we never asked about would have been replayed
for a day for nothing.

## Refunds

Refunds are a person's decision — made in the YooKassa dashboard, or with
«Вернуть платёж» in the web admin panel, which asks YooKassa for a full refund
and changes nothing itself ([admin.md](admin.md#refunds-go-through-the-webhook)) —
and the system follows them. `refund.succeeded` (subscribe to it in the shop's HTTP
notification settings beside the payment events) reaches `handleRefund`, which
re-reads the refund and its payment from the API like every other webhook, and
acts only on a payment that is `succeeded` here and refunded **in full** at
YooKassa (`refunded_amount` equals the amount). A partial refund is logged for a
person to review: there is no honest way to turn half the money into a number
of days.

The reversal runs in one serializable transaction and claims the row
`succeeded` → `refunded` first, so a replayed webhook does nothing:

- a **gift** payment disables its gift code and, if it was redeemed, takes its
  days back from the redeemer's period, never before now
  ([promo-codes.md](promo-codes.md#the-gift-lifecycle)); this runs even when the
  buyer's account is gone;
- a **subscription** payment moves `currentPeriodEnd` back by the plan's months
  (`rewindPeriod`, never before now — a refund cannot reach back into time
  already used), and takes back the referral days granted for that payment
  (`ReferralRewardService.revoke`): the friend's days come off their period,
  the inviter's off their banked `bonus_days` first and their period after, and
  the referral keeps `rewarded_at` but records zero days, so the friend cannot
  be rewarded twice and the inviter's cap window is freed; the referral row
  outlives either account, so a deleted side is simply skipped
  ([referrals.md](referrals.md#a-referral-outlives-either-account)) — and auto-renewal is
  switched off (`cancelAtPeriodEnd: true`), since a person who asked for their
  money back should not be charged again at the rewound end;
- an **extraDevices** payment decrements `extraDevices` (not below zero); the
  device-slot job then enforces the smaller limit.

**A payment refunded before it settled is never granted.** YooKassa keeps a
refunded payment `succeeded`, and a `refund.succeeded` arriving while the row is
still `pending` finds nothing to take back. So `settlePayment` checks
`refunded_amount` on the re-read payment and marks the row `refunded` instead of
granting it — this closes an automatic refund whose HTTP call timed out after
YooKassa had already made it, and a dashboard refund made before the webhook.

**Payments we cannot honour are refunded automatically** — through
`YooKassaClient.createRefund`, with the idempotence key `refund-<payment row
id>`, so the sweep retrying the same payment asks for the same refund:

- extra devices whose payment settles after the period has lapsed beyond the
  config grace (`hasLapsedBeyondGrace`, `PERIOD_GRACE.hours`): the places would
  be wiped by the next `activate` anyway, so granting them would be selling
  nothing;
- any payment whose account was deleted while it was pending (`userId` is null);
- a payment priced with a promo discount that another payment of the same
  account has already used (`discountUsed`): a discount pays for one payment,
  and the settling transaction that finds it consumed rolls back and refunds
  instead ([promo-codes.md](promo-codes.md#the-discount-lifecycle)).

The row goes `pending` → `refunded` and `settlePayment` returns `'refunded'`
(it now returns a `SettleResult` for every call), so a caller can tell the
reader; the `refund.succeeded` webhook that follows finds the row already
refunded and does nothing. A refund YooKassa cancels is logged as an error and
left `pending` for a person.

## Automatic renewal

`recurring-charge` charges the saved card in the last `AUTO_RENEW.windowHours` of a
period — never during a trial — and makes **one attempt per period**: an
auto-charge row created inside the renewal window, pending or canceled, means
the period was already tried, and the reader renews by hand. "Tried" means
tried **with this card**: every auto-charge row stores the `payment_method_id`
it charged, and `wasAttempted` only counts rows for the card on file now (rows
written before the column existed have it null and still count), so a reader
who binds a new card after a decline gets one more attempt with it.

The job returns at once when `YOOKASSA_RECURRING` is off, and it skips a reader
who has a manual subscription payment pending from the last
`AUTO_RENEW.manualHoldMinutes`: someone who is paying by hand on the YooKassa page
right now must not be charged by the job in the same hour as well. A declined card is
canceled synchronously, and retrying with the same idempotence key only replays
that cancellation from YooKassa — so the old hourly retry re-announced the same
failure every hour until the key expired. Everything after the charge goes
through `SettlementService.settlePayment`, which is the only place a payment
changes state.

**The idempotence key is a hash of the whole charge** (`renewalIdempotenceKey`) —
user, period end, card and amount. It used to be `renew-<user>-<period end>`: a
card re-bound after a failed attempt reused the key with a different body, and
YooKassa refused it every hour until the period ran out. The hash also keeps it
inside YooKassa's 64-character limit, which the old key missed by one.

**A pending payment is re-read, not waited on.** A recurring charge can come
back `pending` and settle by webhook seconds later — sometimes before the row
recording it exists, and the webhook for an unknown payment is dropped with a 200. The card is charged, the period is not extended, and the attempt blocks a
retry. `pending-payments` runs every 10 minutes and calls
`SettlementService.settlePayment` for each payment row still `pending` after
`PENDING.settleAfterMinutes`, looking back `PENDING.lookbackDays`; settling is
idempotent, so a webhook that did arrive costs nothing. The
`20261006120000_lookup_indexes` migration adds the `payment(status, created_at)`
index this sweep filters on — the per-user index cannot serve it.

**A cancellation is claimed once and answered once — in `SettlementService.cancel`,
not in the job.** `cancel` flips the row `pending` → `canceled` with
`updateMany`, and only the call that wins the claim speaks: it unbinds the card
when the reason is one of `CARD_LOST_REASONS` (retrying a revoked permission next
month only fails again) and tells the reader their charge failed. The job, the
`pending-payments` sweep and the webhook all reach a cancellation through it, so
none of them can announce the same decline a second time. `AutoRenewService`
keeps `dropUnusableCard` only for a charge that **threw**: a thrown error is
logged rather than announced, because it is not proof the card was declined, and
the card is dropped only on a definite "no" from `isPaymentMethodUsable`.

**Only a card YooKassa saved is a card.** Every settled payment carries a `payment_method.id`, saved or not — a checkout with recurring off, a gift or extra places (both `save_payment_method: false`), a method YooKassa could not save. `settlePayment` used to store any of them as `savedCardId`, and the charge then failed hourly with `This payment_method_id doesn't exist`. `getPayment` now returns the id only when `payment_method.saved` is true. For rows written before that, a failed charge asks `isPaymentMethodUsable`; a definite "no" unbinds the card and tells the reader once, while an unknown answer (network, 5xx) leaves it alone.

`period-reminder` warns before the period ends, once per period — a `periodReminder` row in the notice log, keyed by the period end it was sent for ([scheduler.md](scheduler.md#the-notice-log)), so a renewal that moves the end re-arms it. Three messages: a trial gets `trialEndingSoon` in its last `WINDOW.trialRemindHours`, a period that will not auto-charge gets `endingSoon` within `WINDOW.remindHours`, and one that will gets `renewSoon` with the amount and card — only before the charge window opens, because after it `recurring-charge` speaks for itself.

## Abandoned checkouts

`checkout-reminder` writes once to someone who opened a subscription or gift
checkout — on the site or in the bot, never an automatic charge — and did not
pay it. A payment row qualifies when it is `pending` or `canceled`,
`CHECKOUT_REMINDER.afterMinutes` (an hour) old and younger than
`lookbackHours`, and its account can be reached (a chat that has not blocked the
bot, or a confirmed real email — `REACHABLE_USER`, as for win-back). Only the
newest such checkout of an account is considered (`abandonedCheckouts`).

In one serializable transaction it then skips the account if any payment
created at or after that checkout is not `canceled` — the reader paid after
all, or is paying a newer checkout right now — if the checkout is no longer
`pending` or `canceled`, or if the account was reminded in the last
`userGapHours`, and otherwise claims a `checkoutReminder` row in the notice log
keyed by the payment id ([scheduler.md](scheduler.md#the-notice-log)). So a
payment is reminded about at most once, an account at most once a day, and two
overlapping runs serialize on the same rows. A reader with a live paid period
who abandoned a renewal is reminded too: it is still money left on the table.

**It never fights `pending-payments`.** The reminder only reads statuses and
writes its own log row; settling and cancelling stay with
`SettlementService.settlePayment`. By the time a checkout is an hour old the sweep
has re-read it from YooKassa at least five times, so a payment that went
through is `succeeded` and fails the claim; one that settles in the same
instant loses the serializable race to one side or the other.

The notice is `checkoutAbandoned` (a button to the plan picker in the bot) or
`giftCheckoutAbandoned` (the one-time sign-in to the site, where gifts are
bought); the email's button opens the account's Subscription tab
(`/account#subscription`). Admin analytics counts the reminders sent in its
range and those whose account paid a subscription within seven days
([admin.md](admin.md#growth)).

## The trial

**`trialStartedAt` outlives the period it granted.** A trial is given once and
never again, so clearing the flag when the period expires would hand out a
second one; `trialState` reads the flag, not the period.

**The trial is remembered by identity, not by account.** The flag lives on the
subscription row, which cascades away with the user: deleting the account
(site or `/delete` in the bot) and signing up again used to hand out a new trial
every time. `trial_grant` has no foreign key to `user`: one row per identity
hash — sha256 of `email:<normalised email>` and of `telegram:<id>`
(`trialIdentities`; the email is lowercased, a `+tag` dropped, and the dots of a
Gmail address removed, with `googlemail.com` folded into `gmail.com`; a
Telegram placeholder email is no identity, the Telegram id already is). The
hash keeps no readable email after the account is gone.

- `TrialService.grant` writes the grants in the same transaction as the trial
  period, strictly: an identity that already holds a grant rolls the trial back
  with `TRIAL_ALREADY_USED`.
- `standing`, `claim` and the status contract's `isTrialAvailable` answer
  "used" when any current identity of the account — its email and its linked
  Telegram — has a grant (`TrialGrantService.isGranted`; the status endpoint
  only asks when the row itself would still offer a trial).
- Account deletion calls `TrialService.remember` first, which records the
  identities the account has _now_ — so a Telegram linked after the trial is
  covered too.
- `20261021120000_trial_grants_refunds_and_orphan_payments` backfills the
  grants of every account that already has `trial_started_at`, hashing in SQL
  exactly as `trialIdentities` does.

A new email address is still a new identity; this closes the free loop of
delete-and-return, not every way of making a second account.

**A Telegram-born trial can follow the reader into their site account.**
`TrialService.transfer({ fromUserId, toUserId, db })` is the helper for the
bot-account merge in the Telegram module: called inside the merge transaction
before the bot account is deleted, it records the bot account's identities and,
when the site account has never had a period, moves `trialStartedAt` and the
trial's `currentPeriodEnd` over. A site account that already has a period keeps
it; the grants alone make sure no second trial follows. The merge is meant for
a bot account that holds nothing but a trial — no succeeded or pending
payments, no bonus days, no referrals made; checking that is the Telegram
module's job.

**A trial is not a plan, so buying during one is a first purchase.** The trial
row carries `plan: monthly` only because the column is not nullable. Checkout
used to read that as a running paid month: six and twelve months were refused
with `PLAN_CHANGE_LOCKED`, the account page showed no plan picker at all, and a
purchase kept the `cancelAtPeriodEnd: true` the trial was granted with, so the
card it saved never renewed. A trial is never charged, so it no longer stores a
renewal preference at all; `20261011120000_trial_flag_and_lapsed_extras` cleared
the flag on the trial rows that had it. `periodKind` (beside `trialState`) answers `none`, `trial` or `paid`
from the row, and every decision reads it: checkout, `activate`, extra devices,
`recurring-charge` and `period-reminder`. The status contract carries it as
`period`, so the account page and the bot branch on the same word instead of
re-deriving "active and not a trial" each in their own way.
A purchase during the trial takes the chosen plan and starts when the trial
ends (`extendPeriod` builds on the active end), so the hours left are not
lost. There is no "cancel the trial" action: it costs nothing and charges
nothing, so cancelling would only take hours away.

**The page polls fast only while a payment is on its way.** An active account
polls once a minute. A trial also shows the plan picker, so someone back from
YooKassa could stare at it for up to a minute after paying — long enough to pay
twice. Polling every trial every three seconds for its whole day would cost a
thousand requests an hour per open tab, so instead `useSettlePayment` stamps
`checkoutStartedAt` in session storage before it redirects, and
`useSubscriptionStatus` polls at the fast interval for `PENDING_CHECKOUT.windowMs`
after that stamp. The same covers extra devices bought on a paid period.

**Any plan can be bought at any time, and the term stacks.** Checkout used to
refuse a different plan inside a paid period (`PLAN_CHANGE_LOCKED`), which kept
a monthly reader from moving to a year until the month ran out — the moment
they were most likely to go elsewhere instead. Now the new term starts where
the running one ends (`extendPeriod`), so nothing paid for is lost, and
`activate` writes the payment's plan, so the next automatic charge bills the
plan last bought. The error code is gone from `@gnomevpn/schemas` and from
the client's error messages.

**The status carries the last payment.** `lastPayment` (`status`, `kind`,
`isAutoCharge`, `createdAt`, or `null`) is the newest payment row of the
account other than a gift purchase (a gift says nothing about the reader's own
subscription, and would hide a failed renewal behind it), read in parallel with the subscription row through the
`payment(user_id, created_at)` index, so the account page can say "the last
automatic charge failed" without another request.

**Auto-renewal on a fresh period follows the method the payment saved.**
`createCheckout` sends `save_payment_method: YOOKASSA_RECURRING`, and YooKassa
reads `true` as unconditional: there is no "remember card" box to untick — the
payment page tells the payer that confirming authorises automatic charges, and
the method (a card, SberPay, T-Pay, SBP, ЮMoney) is saved when the payment
succeeds. So outside a running paid period — the first purchase, a purchase
during the trial, one after a lapse — `activate` turns renewal on
(`isConsentGiven`): confirming that page is the consent, and the account page
says so above the button (`account.plans.renewalNote`). Inside a paid period
the saved method is replaced but the stored preference stands, so a reader who
turned renewal off stays off; an account whose period came only from promo or
gift days never stored a preference (`cancelAtPeriodEnd` defaults to `false`),
so a payment there turns it on as well. A payment that saved nothing keeps
renewal off (`activationData` needs a method). Binding a card in the
account (`CardService.bindCard`, or `confirmPending` once YooKassa activates it) and the "Turn on auto-renewal" toggle
(`resumeAutoRenew`, which needs a saved method) turn it on; unbinding turns it
off. The renewal charges `findPlan(subscription.plan).priceRub` — the plan last
paid for at today's price, and the monthly plan on a row a trial or a code
created — never with a discount.

**Extra devices need a paid period, and last as long as it does.** A trial day
is a taster; extras bought on it would be paid for a few hours, so checkout
refuses them and neither the account page nor the bot offers them. Once bought,
they work "while the subscription is active", as the account page promises: a
renewal — automatic or by hand, before the end — keeps them, and a lapse ends
them. `activate` resets `extraDevices` when the period had already lapsed — beyond the
config grace, `PERIOD_GRACE.hours`, the same six hours `expired-access` waits
before it disables configs (`WINDOW.configGraceHours` reads it) — at the moment
the payment was created (`orderedAt`, the payment row's `createdAt`), not at
the moment it settled: a renewal paid just before the end whose webhook arrives
just after it keeps the extras, and so does one paid within the grace, while
the reader's configs were still live. Before this, a reader who let the subscription run out and came back months
later got last year's extras back for free. The same migration zeroed the
extras on rows that had already lapsed.

The migration deliberately does not switch renewal back on for readers who
bought during a trial under the old code and ended up with
`cancelAtPeriodEnd: true` beside a saved card: the column cannot tell them from
a reader who turned renewal off by hand, and charging someone who said no is
worse than asking someone to press "Turn auto-renewal on".

**Auto-renewal is not offered on a trial.** The bot answers the auto-renew
button with `autoRenewTrial`, because `recurring-charge` never charges a trial
and "renewal on" would be a promise nothing keeps.

**The trial is a day, not an hour or a week.** A day is long enough to install
the app, connect and judge the speed on the reader's own network, which is the
only way a VPN can be judged at all.

**Periods are counted in calendar months from the period end, so they drift
at month ends.** A period started on the 31st ends on the 28th of February and
then on the 28th forever. An anchor day was considered and left out: referral
days, bonus days and refunds all move the end by days, so any stored anchor
would disagree with the end it is supposed to describe after the first bonus,
and a reader loses at most three days once.

## Deleting an account frees the nodes before it frees the row

`AccountService.remove` reads the user's peers first, hands them to
`PeersService.releaseDetached`, and only then deletes the `User`. The order is
the whole point: the rows name which client to remove on which node, and once
they cascade away nothing knows what to clean up.

Removal on the node is best-effort — `releaseDetached` deletes the rows, then
fires the node calls detached — so a node that is down when someone deletes
their account keeps a client nobody owns. The weekly orphan collection in
`reconcile-peers` (`collectOrphans`) is the guarantee: it already deletes any
server-owned client whose owner id no longer resolves to a `User`, which is
exactly what a deleted account leaves behind. It skips a client the core reports
online, so a live session ends when it drops rather than mid-stream.

**A payment's plan is the plan it bought, and extra places buy none.**
`payment.plan` is null exactly on `extraDevices` payments — a check constraint
(`payment_plan_kind`) says so — and set on every subscription and gift payment.
It used to default to `monthly`, which stamped every purchase of extra places as
a monthly subscription for the admin's plan filter and revenue-by-plan chart;
`20261026110000_payment_plan_and_referral_survivors` cleared it on the existing
rows. Code that needs the plan of a subscription or gift payment reads it
through `paymentPlan` (`common/lib`), which throws on a null rather than guess
one — billing calls it once, in `purchaseOf`, when it reads the row — so a
malformed row fails instead of granting a month.

**Payments outlive the account.** `payment.user_id` is nullable with
`ON DELETE SET NULL`: the rows are the shop's record of money taken, and a
refund for a deleted account still has to find its payment. Deletion is refused
with `ACCOUNT_PAYMENT_PENDING` while the account has a payment `pending` from
the last `ACCOUNT_DELETION.pendingLookbackDays` — the same window the
`pending-payments` sweep settles — because a payment settling after the account
is gone has nothing to grant to; if one slips through anyway it is refunded
automatically (above).

Deletion is offered in both places for the same reason linking is: the account
page has a confirm dialog, `/delete` in the bot has the same confirmation on an
inline keyboard. Neither refunds the remaining period, and both say so before
asking.
