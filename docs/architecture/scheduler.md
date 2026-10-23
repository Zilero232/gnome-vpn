# The scheduler

`apps/server/src/modules/scheduler` holds every cron job. The billing jobs are
argued in [billing.md](billing.md); the peer jobs lean on
[nodes-and-peers.md](nodes-and-peers.md). Part of the
[documentation index](../README.md).

## Cron jobs

`modules/scheduler/jobs` holds twelve jobs: node health, peer reconciliation,
expired access, recurring charges, pending payments, period reminders, device
slots, support threads, expired records, geo files, win-back and checkout
reminders. `reconcile-peers` runs on two schedules, so there are thirteen crons
in all.
Intervals that have no `CronExpression` constant live in `SCHEDULE`
(`config/schedule.config.ts`).

| Job                           | Runs                                      | Does                                                                              |
| ----------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| `node-health`                 | every minute                              | probes every available node, stamps `lastHealthyAt` and uptime, warns on load     |
| `reconcile-peers` (`run`)     | `SCHEDULE.reconcileCron`, every 5 minutes | deletes revoked clients, syncs peer rows with the panels, restores lost ones      |
| `reconcile-peers` (`collect`) | `SCHEDULE.collectOrphansCron`, weekly     | the same pass plus orphan collection, idle shared `incy` peers and feed WireGuard |
| `expired-access`              | every 5 minutes                           | revokes lapsed access and restores access left disabled on a live period          |
| `recurring-charge`            | every hour                                | charges the saved card once in the last `WINDOW.renewHours` of a period           |
| `pending-payments`            | every 10 minutes                          | settles payments still `pending` after `PENDING.settleAfterMinutes`               |
| `device-slots`                | every 10 minutes                          | revokes the keys of devices over their account's limit ([devices.md](devices.md)) |
| `period-reminder`             | every hour                                | warns once per period before it ends                                              |
| `support-threads`             | daily at 04:00                            | forgets support-desk messages older than `RETENTION.supportMessageDays`           |
| `expired-records`             | `SCHEDULE.expiredRecordsCron`, daily 04:35 | deletes expired sessions, verification tokens and the bot's one-time codes ([below](#expired-records)) |
| `geo-files`                   | `SCHEDULE.geoFilesCron`, weekly           | rebuilds the trimmed geo files INCY's routing downloads ([routing.md](routing.md)) |
| `win-back`                    | `SCHEDULE.winBackCron`, hourly 10–20 MSK  | two touches after a lapse, with a personal discount ([below](#win-back))          |
| `checkout-reminder`           | every 10 minutes                          | reminds once of a checkout left unpaid ([billing.md](billing.md#abandoned-checkouts)) |

`reconcile-peers` waits out `SCHEDULE.bootGraceMs` after a boot, and its passes
never overlap: a regular run is skipped while a pass is in flight, and the weekly
orphan collection waits for the running pass to finish rather than being
skipped. A node that fails `ALERT.reconcileFailureStreak` passes in a row is
logged as an error rather than a warning, and posted to the owner's admin chat.

`node-health` probes every available node each minute, and never two runs at once (`waitForCompletion`): an overlapping run used to move `lastCheckedAt` backwards and could credit one run's success to the other's uptime minute. A node whose panel token is missing from the environment counts as a failed probe like any other — building its client is inside the guarded probe — so a lost `.env.nodes` raises the down alert instead of a lone log line. `health()` returns the
inbound's state together with the panel's own `cpu`, memory ratio and TCP count,
so a node crossing `ALERT.nodeCpuPercent` or `ALERT.nodeMemoryRatio` is logged
as a warning before it starts dropping tunnels. Every probe — up or down — is
also reported to `TelegramAlertService`, which decides whether the owner hears
about it: a node going quiet, coming back, or running hot
([telegram-bot.md](telegram-bot.md#operational-alerts)). The job only reports;
the thresholds and the de-duplication live there.

`support-threads` deletes the rows that let an admin's reply find its way back
to a user (`telegram_support_message`) once they are
`RETENTION.supportMessageDays` old. Nobody answers a three-month-old question,
and the table holds Telegram ids, so it is not kept longer than it is useful.

Every run also feeds the public status page ([status.md](status.md)): a healthy
probe writes `isOverloaded` (the same two thresholds) beside `lastHealthyAt`,
and after the probes `NodeUptimeService.record` adds a checked minute — and an
up minute for each node this run stamped healthy — to the node's `node_uptime`
row for the UTC day, stamps `lastCheckedAt`, and prunes rows past 90 days. A
failure there is logged and never fails the run.

`expired-access` sweeps `kind: 'config'` peers in both directions — it disables
the peers of a subscriber whose period lapsed more than `WINDOW.configGraceHours`
ago (`lapsedBefore`), and restores peers left `disabled` while the period is
live (`activeSince`). Both halves go through `SubscriptionAccessService.setEnabledAll`.
The two predicates are complements and are tested as such; a gap between them
either strands a paying user or keeps serving an expired one.

It announces only the subscribers whose peers it actually turned off (it
selects `state: 'active'`). Without that filter every lapsed account was
"disabled" again on each five-minute sweep and told its subscription had ended
every time.

Use a raw cron string when the interval has no `CronExpression` constant. Inventing one that doesn't exist crashes the server at boot, and only at boot — nothing catches it earlier.

## Expired records

`expired-records` deletes what has expired and can never be used again: a
better-auth session `RETENTION.expiredSessionDays` (7) after its `expires_at`
— the row carries the address and user agent it was opened from, which the
product never reads — and a verification token, a Telegram link code or a
one-time sign-in link `RETENTION.expiredCodeDays` (1) after theirs. The four
deletes run in one transaction; each filters on an `expires_at` index
(`20261026140000_expiry_indexes`). Nothing is dropped from better-auth's
schema; the rows just stop outliving their use.

## Win-back

`win-back` writes to the people who left: a lapsed payer — the last period was
not a trial (`isTrialPeriod`, the rule `periodKind` uses; a period from a code
or a gift counts, as it does everywhere else) — gets touch 1 three days after
`currentPeriodEnd` and touch 2 after fourteen; an account whose only period was
the trial and that never paid gets them one day and seven days after the trial
ended. The offsets, the percent and the codes live in `WIN_BACK`
(`config/win-back.config.ts`); who is due which touch at a given moment is
`winBackDue`, tested apart from the job.

**Each lapse gets each touch at most once.** A touch is a row in the notice
log ([below](#the-notice-log)): `winBackTouch1` or `winBackTouch2`, with the
lapsed period end as its `ref`, so a new period re-arms them, exactly as it
does for `period-reminder`. `sentTouches` reads the last touch claimed for this
lapse. The touch is claimed inside the serializable transaction that grants the
discount, after checking that the period end and the touches already claimed
are still what the run saw — so a restart or two overlapping runs never send
twice, a touch 1 cannot follow a touch 2 that won the race, and a payment
landing in between makes the claim miss. A touch that is late is
still sent up to `WIN_BACK.lateDays` after its day — touch 1 until touch 2 is
due, touch 2 for a week — and never after, so deploying the job does not write
to everyone who left a year ago. A missed touch 1 is skipped for touch 2.

**The offer is a pending discount, not a code to type.** Touch 1 grants
`WIN_BACK.percent` off the next subscription payment through the existing
pending-discount mechanism — a `promo_redemption` of one of two automatic
system codes, `WELCOMEBACK` for lapsed payers and `AFTERTRIAL` for trials,
which checkout prices and consumes like any discount
([promo-codes.md](promo-codes.md#automatic-codes)). `AutoDiscountService.offer`
never replaces a discount the reader already holds — they are reminded of that
one instead (`winBackReminder`, with its percent) — and grants a win-back
discount at most once per account ever, counted across the account's identity
hashes like any redemption. Touch 2 therefore reminds of the pending discount,
or grants it when touch 1 could not; a reader who already had their win-back
discount on an earlier lapse and holds none now is not written to at all (the
touch is still claimed).

**Only people who asked for offers.** A win-back message is advertising, so it
goes only to an account whose latest marketing consent is granted
(`ConsentService.marketingAudience`, [legal.md](legal.md#consents)); everyone
else is skipped before anything is claimed or granted, and gets the touch if
they opt in while it is still due. `TelegramNotifyService.tell` checks the
same consent again for every promotional notice, so no other caller can send
one by accident.

**Only people a notice can reach.** Accounts with a live period are outside the
window by construction; deleted accounts have no subscription row. The query
also requires a chat that has not blocked the bot or a confirmed, real email
(`REACHABLE_USER`): a Telegram placeholder address delivers nothing, and a
blocked chat answers 403. `telegram_account.blocked_at` is what says "blocked":
Telegram's `my_chat_member` update in the private chat sets and clears it
(`botBlockChange`), a 403 on any notice or broadcast sets it, and any later
press or a delivered notice clears it.

The messages are `winBackOffer`, `trialWinBackOffer` and `winBackReminder`, in
the bot and by email ([telegram-bot.md](telegram-bot.md)). The job runs hourly
between 10:00 and 20:00 Moscow time (`@Cron` with `timeZone`), so nobody gets
an offer at three in the morning. Stopping either code in the admin panel or
with `/promo off` pauses that audience: no touch is sent while the code is
expired, and a discount already granted stays.

## The notice log

A job that must say something once used to mark that on the row the notice was
about — `subscription.reminder_sent_for`, `win_back_for` and `win_back_touch`,
`first_device_at`, `payment.reminded_at`. `20261026120000_notice_log` moved
all of it to one table, `notice_log`, keyed by `(user_id, notice, ref)`:
`notice` names the claim (`NOTICE_CLAIM` in `core/notice-log`) and `ref` what
it was about.

| Claim               | `ref`                         | Written by                                   |
| ------------------- | ----------------------------- | -------------------------------------------- |
| `periodReminder`    | the period end, `toISOString` | `period-reminder` — one reminder per period   |
| `winBackTouch1`/`2` | the lapsed period end         | `win-back`                                   |
| `checkoutReminder`  | the payment id                | `checkout-reminder`; its `sent_at` is the per-account 24-hour gap and the admin's growth metric |
| `firstDevice`       | `ever`                        | `FeedNoticeService` — the first-device invite |

**Inserting the row is the claim.** `claimNotice` is a `createMany` with
`skipDuplicates` (`INSERT … ON CONFLICT DO NOTHING`); a count of one means
this run owns the send, a count of zero that another run already did. Where the
claim depends on other state — the checkout still unpaid, no newer checkout,
the lapse unchanged — it runs inside the same serializable transaction that
checks it. The rows cascade away with their account. The migration backfilled
the log from the old columns, writing a moment as JavaScript's `toISOString`
does, and then dropped them.
