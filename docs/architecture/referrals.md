# Referrals

Invite a friend, both get days. Code: `apps/server/src/modules/referrals/`, the
reward inside `SettlementService.settlePayment`, the bot's `/invite` in
`TelegramReferralService`, the account tab in
`apps/client/features/account/invite-friends`. A friend's code is one of three
kinds of promo code; campaign and gift codes, and the one endpoint that takes
all three, are in [promo-codes.md](promo-codes.md). The numbers live in
`REFERRAL_REWARDS` and `REFERRAL_POLICY` (`packages/schemas`), so the account
page, the bot and the server read one table. Part of the
[documentation index](../README.md).

## The reward is days, both ways, for the friend's first payment

What the big services do (NordVPN, Surfshark, ExpressVPN) and what the Russian
Telegram-bot sellers converged on: the inviter and the friend both get time on
the subscription, the trigger is the friend's first real payment, and the size
scales with the plan bought — a month gives the inviter 7 days and the friend 3,
half a year 15 and 7, a year 30 and 15.

**Days, not a balance.** A rouble balance means a ledger, refunds against it,
withdrawals and a tax question; days need none of it and cost us only capacity
that is already paid for.

**The first payment, not the sign-up.** A sign-up or a trial costs nothing, so a
reward for either is farmed with throwaway accounts. A payment costs real money,
which makes a fake friend more expensive than the days it earns. Only a
`subscription` payment counts — extra devices are not a first purchase.

**Once per friend.** Paying every renewal is an affiliate programme, and an
affiliate programme needs the balance we chose not to have.

**At most `REFERRAL_POLICY.capDays` per `capWindowDays` for the inviter.** A
cap the honest never reach, but it bounds what a cluster of self-invites paid
with one card can buy. Above it the referral is still marked rewarded, with
`referrer_days = 0`, and the friend still gets theirs.

## Attribution: first touch, a new account, before it pays

A friend is attributed when all of these hold, checked by
`ReferralService.isEligible`:

- the account has no `referral` row yet — first touch wins, and the row's
  `referred_id` is unique, so two claims racing each other leave one;
- it has no succeeded `subscription` payment;
- it was created within `REFERRAL_POLICY.claimWindowDays` — an old account that
  never paid is not a new customer someone brought in;
- the code is not the account's own (`REFERRAL_SELF`, and a `CHECK` constraint
  under it), and the two accounts are not inviting each other.

The eligibility check, the mutual check and the insert run in one serializable
transaction (`withSerializableRetry`), so a payment settling or a reverse invite
landing between the check and the insert cannot slip a referral past them; the
unique violation still maps to `REFERRAL_UNAVAILABLE`.

**The site keeps the code in a cookie, the account page claims it.** The API
lives on another origin, so a cookie set by the site never reaches it. The
client's `proxy.ts` therefore stores `?ref=<code>` from any page as
`gnomevpn-ref` for 30 days — only when none is stored yet — and
`useClaimPendingPromoCode` on the account page posts it to `/promo-codes/redeem`
after sign-up or sign-in, which hands a friend's code to `ReferralService.attribute`
unchanged ([promo-codes.md](promo-codes.md#one-entry-point)). It deletes the cookie before the request and puts it
back only after a network error or a `401` from a session that was not up yet,
which used to lose the invite for good; a final refusal (`isFinalRefusal`: a
`REFERRAL_*` or `PROMO_CODE_*` refusal, or a malformed code) leaves it deleted, since it would only be
refused again on every visit. Deleting first is what keeps one code to one
request — a StrictMode double mount or a remount while the claim is in flight
finds no cookie, where a second request would lose the unique-row race and
toast a refusal right after the success. A friend who lost the link can
type the code on the Invite tab instead, for as long as the account is eligible;
the form is shown to every account now, since a campaign or gift code applies
after the first payment too.

**The code is a promo code, and sign-up takes one.** People pass codes around
in chats more than links, so the UI calls it a promo code everywhere and shows
it first on the Invite tab (`InviteCode`, one tap to copy), with the links
below as the way to apply it without typing; the bot's `/invite` prints it
too. The sign-up form has an optional promo code field behind «Есть
промокод?» — open and filled in when the visitor came by a link, so they can
see the code that will apply. It is checked by `signUpSchema` through
`optionalPromoCodeSchema`, the general promo format (4–24 letters and digits)
that also lets an empty field through, so a campaign or gift code typed there
is carried the same way. Every keystroke mirrors the field into the same
`gnomevpn-ref` cookie the `?ref=` link uses (`syncPendingPromoCode`): anything
shaped like a code (4–24 letters and digits — a campaign code can be that
short) replaces what a link stored, and an erased field or fewer than four
characters deletes it. The
cookie is the one place the code lives, so the Telegram button above the form
claims a typed code exactly as the email form does, and erasing a prefilled
code really opts out. The account page then claims it through the path above,
so a typed code gets the same toast, retries and final-refusal handling as a
link, and sign-up itself never fails over a code.

**The bot reads it from the start payload.** `t.me/<bot>?start=ref_<code>` —
`referralCodeFromStart` strips the prefix, so the payload can never be mistaken
for a link code (those have no underscore). Any payload carrying the prefix
(`isReferralStart`) takes the referral path, a malformed code included: it gets
the "invite not found" line instead of a bare greeting that ignores the link the
friend followed. `/start` from an unknown chat creates
the account first, then attributes it, then greets with a line on what the invite
gives or why it did not apply.

**A Telegram-born account that is merged keeps its invite.** When `consumeCode`
deletes an untouched bot account in favour of the site account the code came
from, `ReferralService.adopt` moves the unrewarded referral onto the site account
first, if that account is itself still eligible. Without it the invite would
cascade away with the row it pointed at.

The code is random (`generateShortCode`, the `SHORT_CODE` alphabet in
`packages/schemas` without `0/O`, `1/I/l`, shared with the Telegram link code),
not a Telegram id or a user id: a guessable code lets anyone list who invited
whom.

## The reward is settled with the payment, in the same transaction

`ReferralRewardService.reward` runs inside the serializable transaction that
claims the payment and calls `activate`. It claims the referral row with
`updateMany … where rewardedAt is null`, so a webhook and the `pending-payments`
sweep settling the same payment twice still pay once, and a second payment finds
the row already rewarded. Both periods are extended with `extendPeriod`, on top
of a period that is always running: the friend's was just made paid by
`activate`, and the inviter's days are applied only to a running paid period
(below). So no period is created or revived here, and nothing needs re-enabling
afterwards — the inviter's peers are already live.

**The inviter's days wait for a paid period.** They used to extend whatever the
row held, and on a trial, a lapsed period or no period at all that minted a
"paid" period: `periodKind` calls any period past `trialStartedAt + TRIAL_DAYS`
paid, and the row carried the default `monthly`. So the inviter lost
the trial for good, and a Telegram-born account stopped being "untouched", which
broke merging it into a site account. Now `creditReferrer` extends only a
running paid period; otherwise the days go to `subscription.bonus_days`, and
`activate` adds them on top of the next paid period and zeroes the bank — a
renewal by card included. That is what NordVPN and ExpressVPN do as well: the
inviter's days land on a paid cycle. The friend's days are always applied at
once, because the payment that earned them has just made their period paid.

The friend is told by `referralBonus`, the inviter by `referralRewarded`, or by
`referralBanked` when the days were banked. The first two carry the Invite
button, because someone who was just paid in days is the person most likely to
send the link on; the banked one carries Subscribe, which is what releases them.
For the same reason a payment (`paid`) and the account's first device ever end
with one line of the rewards and the Invite button
([telegram-bot.md](telegram-bot.md#telegram-is-a-second-door-to-the-same-account)).

## A refund takes the days back

A refund made in the YooKassa dashboard reaches `refund.succeeded`
([billing.md](billing.md#refunds)), and for a fully refunded subscription
payment `ReferralRewardService.revoke` takes back what that payment earned, as
far as it still can: the friend's days come off their period, the inviter's off
their banked `bonus_days` first and their period after — never before now, so
days already used stay used. The referral keeps `rewarded_at`, so a later
payment by the same friend does not reward a second time, and records zero
days, which frees the inviter's cap window. There is no hold period: a refund
is rare and manual, and holding every reward for weeks would make the honest
wait for nothing.

## A referral outlives either account

`referrer_id` and `referred_id` are nullable with `ON DELETE SET NULL`
(`20261026110000_payment_plan_and_referral_survivors`); both used to cascade.
Deleting the friend took the row with it, which freed the inviter's cap window
— a self-invite deleted after its payment bought days that no longer counted —
and left a later refund of that payment (payments outlive the account) nothing
to take back. Deleting the inviter did the same on the other side: a refund of
the friend's payment found no row and the friend kept the days.

Both sides stay for the same reason, the refund: the row is the record of
which payment earned which days. A side that is null is skipped — `reward`
gives a friend whose inviter is gone their own days and credits nobody,
`revoke` takes back from whichever account remains, `adopt` skips the mutual
check — and a friend whose inviter is gone is still invited, so first touch
still wins. The admin card lists only the people who still have an account,
since there is nobody else to link to.

## What the friend sees

`GET /referrals` carries `isReferralRewarded` and `referralRewardedDays` (the
friend's days from their own referral, `0` when there is none or it was taken
back by a refund), so the Invite tab stops promising "days on your first
payment" once that payment has happened.

## Where the programme is shown

The Invite tab is the full surface; three more places point at it, and every
number in them comes from `REFERRAL_REWARDS` (through `referralReward` and
`MAX_REFERRER_DAYS`), so a change to the table reaches all of them. The copy
describes the product and the reward — days, both ways — and never the
connection as a way around anything ([legal.md](legal.md#copy-describes-the-product-never-bypassing-blocks)).

**Right after a payment, on the Subscription tab.** Someone who has just paid
is among the likeliest to pass the link on — the reasoning that puts the
Invite button on the bot's reward messages. `InvitePrompt` (`invite-friends`) sits
under the subscription hero while the status's `lastPayment` is a succeeded,
manual `subscription` payment from the last three days (`INVITE_PROMPT`,
`invitePrompt` in the slice's `lib/`) and the period is paid. That covers the
moment `usePendingCheckout` celebrates the settled checkout and a later visit
the same week, and leaves out automatic renewals, extra devices and gifts. The
card names the plan just bought and what a friend taking the same plan earns
both sides, then reuses the tab's own pieces: `InviteLink` (the site link with
its copy button), `ShareMenu` (the native share sheet on a touch device, a
menu of Telegram, WhatsApp, VK and email elsewhere, both through
`shared/lib/share`) and a link to `#invite`. `GET /referrals` is asked only
once the card is due.

Hiding it is a per-viewer convenience: the payment's `createdAt` goes to
`localStorage` (`STORAGE_KEYS.invitePromptDismissed`), so that payment never
shows it again and the next manual payment does. The key is read after mount,
and the card waits for that read, so a hidden card does not flash on load.
Storage that throws or is empty (a private window) only means the card shows
and can be hidden again for the session.

**On `/pricing`, under the plans.** `ReferralSection` (`views/pricing`) says
what a friend and the inviter get, with the inviter's "up to" taken from
`MAX_REFERRER_DAYS`, renders `InviteRewards` — the same per-plan table as the
Invite tab — and links to `/account#invite`; a signed-out reader is sent
through sign-in with the hash kept ([web-client.md](web-client.md#deep-links-survive-signing-in)).

**In the FAQ.** «Есть ли бонус за приглашение друзей?» lists the days for each
plan through ICU arguments (`<plan>ReferrerDays` and `<plan>FriendDays` in
`FAQ_ANSWER_VALUES`), the way the price answer takes `PLANS`, and ends with a
link to the Invite tab (`FAQ_LINKS`). The FAQ test checks that every reward
reaches the answer in both locales. It is not one of `FAQ_HIGHLIGHTS`: the
landing's questions are the ones a visitor asks before signing up, and the
programme is for people who already pay.
