# Referrals

Invite a friend, both get days. Code: `apps/server/src/modules/referrals/`, the
reward inside `WebhookService.settlePayment`, the bot's `/invite` in
`TelegramReferralService`, the account tab in
`apps/client/features/account/invite-friends`. The numbers live in
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

**The site keeps the code in a cookie, the account page claims it.** The API
lives on another origin, so a cookie set by the site never reaches it. The
client's `proxy.ts` therefore stores `?ref=<code>` from any page as
`gnomevpn-ref` for 30 days — only when none is stored yet — and
`useClaimPendingReferral` on the account page posts it to `/referrals/claim`
after sign-up or sign-in. It deletes the cookie on success and on a final
refusal (`isFinalRefusal`: a `REFERRAL_*` code or a malformed code), which would
only be refused again on every visit — but keeps it after a network error or a
`401` from a session that was not up yet, which used to lose the invite for
good. A friend who lost the link can
type the code on the Invite tab instead, for as long as the account is eligible.

**The bot reads it from the start payload.** `t.me/<bot>?start=ref_<code>` —
`referralCodeFromStart` strips the prefix, so the payload can never be mistaken
for a link code (those have no underscore). `/start` from an unknown chat creates
the account first, then attributes it, then greets with a line on what the invite
gives or why it did not apply.

**A Telegram-born account that is merged keeps its invite.** When `consumeCode`
deletes an untouched bot account in favour of the site account the code came
from, `ReferralService.adopt` moves the unrewarded referral onto the site account
first, if that account is itself still eligible. Without it the invite would
cascade away with the row it pointed at.

The code is random (`REFERRAL_CODE`, the link-code alphabet without `0/O`,
`1/I/l`), not a Telegram id or a user id: a guessable code lets anyone list who
invited whom.

## The reward is settled with the payment, in the same transaction

`ReferralRewardService.reward` runs inside the serializable transaction that
claims the payment and calls `activate`. It claims the referral row with
`updateMany … where rewardedAt is null`, so a webhook and the `pending-payments`
sweep settling the same payment twice still pay once, and a second payment finds
the row already rewarded. Both periods are extended with `extendPeriod` — on top
of a running period, or from now when it had lapsed — and a lapsed period loses
its extra devices, exactly as `activate` does.

Re-enabling the inviter's peers happens after the commit, like the payer's, and
is best-effort for the same reason: `expired-access` restores any `disabled`
config of an owner with a live period, so the sweep is the guarantee.

**The inviter's days wait for a paid period.** They used to extend whatever the
row held, and on a trial, a lapsed period or no period at all that minted a
"paid" period: `periodKind` calls any period past `trialStartedAt + TRIAL_DAYS`
paid, and the row carried the default `monthly`. So the inviter could no longer
buy six or twelve months (`PLAN_CHANGE_LOCKED`) until the bonus ran out, lost
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

## What it does not do yet

There is no hold period: YooKassa refunds are manual, so a refunded payment
leaves its days in place. When refunds become a flow, they should take the
referral's days back with the payment.
