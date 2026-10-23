# The scheduler

`apps/server/src/modules/scheduler` holds every cron job. The billing jobs are
argued in [billing.md](billing.md); the peer jobs lean on
[nodes-and-peers.md](nodes-and-peers.md). Part of the
[documentation index](../README.md).

## Cron jobs

`modules/scheduler/jobs` holds nine jobs: node health, peer reconciliation,
expired access, recurring charges, pending payments, period reminders, device
slots, support threads, geo files. `reconcile-peers` runs on two schedules, so
there are ten crons in all.
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
| `geo-files`                   | `SCHEDULE.geoFilesCron`, weekly           | rebuilds the trimmed geo files INCY's routing downloads ([routing.md](routing.md)) |

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
