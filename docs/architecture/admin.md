# The web admin panel

`/admin` is the owner's surface on the site: who signed up, who pays, what the
promo codes earn, how the nodes are doing, and the handful of actions support
needs. Before it the owner had only the bot's `/stats`, `/broadcast` and
`/promo` ([telegram-bot.md](telegram-bot.md#owner-commands)), which stay. Code:
`apps/server/src/modules/admin`, `packages/schemas/src/admin`, and on the client
`views/admin`, `features/admin/*` (`overview`, `manage-users`,
`manage-payments`, `manage-promo-codes`, `manage-nodes`), `entities/admin/*`
(`access`, `navigation`, `records`) and the chart pieces in `ui-kit`. Part of
the [documentation index](../README.md).

## Who is an admin

An admin is a signed-in account whose email is in `ADMIN_EMAILS` **and**
confirmed. `ADMIN_EMAILS` is an optional server variable, a comma-separated
list, matched case-insensitively; `config/env/auth.env.ts` trims, lowercases and dedupes
it and refuses to boot on an entry that is not an email. Empty — the default —
means nobody: every `/admin` route answers 404. Setting it is in
[deploy.md](../ops/deploy.md).

The confirmed email is the half that matters. Sign-up does not require
confirmation, so a list entry alone would hand the panel to whoever registered
the owner's address first; a verified address proves the mailbox. The check
reads the user row on every request (`AdminAccessService.adminOf`), not the
session's copy of the user, so removing an address from the list or changing
the account's email takes effect on the next request, after a restart for the
list.

### Everyone else gets the 404 of a route that does not exist

`AdminGuard` sits on every admin controller, which are all `@OptionalAuth()`
so an anonymous request reaches the guard instead of the global 401. Anyone who
is not an admin — anonymous included — gets
`NotFoundException("Cannot <METHOD> <url>")`, byte for byte what Nest answers
for an unmatched route (`routes-resolver.js`), so the status and the body say
"no such route", not "you may not". A 403 would confirm that an admin API exists
and invite guessing at what unlocks it. This hides the panel from casual
probing, not from a determined scanner: a matched route still passes the global
`ThrottlerGuard`, whose rate-limit headers an unmatched route does not carry.
The protection is the email list and the confirmed mailbox; the 404 only keeps
the routes from announcing themselves.

The guard runs before validation, so a non-admin never learns which parameters
a route takes either. Every route is throttled per address (`ADMIN_THROTTLE`):
120 reads, 20 writes and 6 CSV exports a minute — generous for one person
clicking through tabs, tight enough that a stolen session cannot dump the user
table through the list endpoint quickly.

## On the site

`/admin` is a private route in the `(account)` group: in `ROUTES`, not in
`PUBLIC_ROUTES` or `INDEXED_ROUTES`, disallowed in `robots.ts`, `index: false`,
absent from the sitemap. A signed-out visitor is sent to sign in like on
`/account`; a signed-in non-admin gets the site's regular not-found view —
`AdminPage` asks `GET /admin/me` (`useAdminAccess`) and calls `notFound()` when
it fails. While the session or that answer is on its way the page shows a
loading block, which is also what the build prerenders, so the static
`/ru/admin` is never a 404 page. The account page header shows «Админка» only
when the same query succeeds; for everyone else that query is one 404 per
account page view.

The page reuses the account page's pieces: the tab navigation, moved from
`views/account` into `ui-kit` as `PageTabs` with a `layout='bar'` that keeps the
tab row horizontal at every width so tables get the full card, the card
surface, `ConfirmDialog`, the toasts, `LoadingBlock`/`ErrorBlock` (through
`QueryBlock`). Every list is `DataTable`, a real table from the `2xl`
breakpoint and one card per row below it, so the panel works at 360 px.
Data comes through TanStack Query with keys under `QUERY_KEYS.admin()`;
every mutation invalidates that prefix, so a refund, an extension or a stopped
code shows up in the lists, the card and the overview together.

**The `admin` messages ride only with `/admin`.** It is the largest namespace
and almost nobody opens the page, so it is a route namespace
(`ROUTE_MESSAGES`): the bundle every page carries leaves it out and the admin
page wraps its view in its own provider with `routeMessages`
([web-client.md](web-client.md)). The strings are not a secret — anyone can
fetch `/admin` and read them — but shipping them to every visitor of the
landing page was weight for nothing.

The selected user lives in the URL (`/admin?user=<id>#users`), so a card can be
bookmarked and the browser's back button closes it. `useAdminNavigationState`
pushes the history entry and announces a `hashchange`, which is what
`PageTabs` listens to, so a link to a user from the overview's referrer table
also switches to the Users tab. `UserLink` is a real link, so a modified click
opens the card in a new tab. «Ко всем пользователям» steps back through history
when the card was opened from the list, and the list stays mounted behind the
card, so its search, filters and page are where they were.

### Lists, filters and the URL

Every list — users, payments, campaign codes, gifts — follows one pattern,
the one Polaris, Pajamas and Carbon describe for index pages:

- **Filters live in the URL**, through [nuqs](https://nuqs.dev) rather than
  hand-written `useState` and query builders. A feature only declares its
  parsers (`USER_FILTERS`, `PAYMENT_FILTERS`, `CAMPAIGN_FILTERS`,
  `GIFT_FILTERS`); `useListFilters` in `entities/admin/records` keys them by
  the list (`users.access=paid`, `payments.status=refunded`) so tabs never read
  each other's filters, writes with `replace` so Back is not flooded, drops a
  value equal to its default from the URL, sends page 1 on every change, and
  hands over `query` (the set values only), `isFiltered` and `reset`. A
  filtered list survives a reload and can be sent as a link. The one `as` in
  the hook types the URL-key map: `Object.fromEntries` loses the key type, and
  every parser key is mapped. `NuqsAdapter` wraps only `AdminPage`, the one
  page that uses it.
- **Selects apply at once, and so does search**: the users search box has no
  button — the text is in the URL immediately and the request follows 300 ms
  after typing stops (`useDebounceValue`), so search and selects behave the
  same way.
- **One filter row**: `FilterBar` lays every `FilterSelect` on the same grid,
  so a select is the same width on every tab; `FilterSelect` adds the «Любой»
  option itself when given `anyLabel`.
- **Count and clear-all**: a filtered list shows «Найдено: N» and «Сбросить
  фильтры» (`FilterSummary`), and its empty state says nothing matches the
  filters instead of «nothing yet».

The users list filters by access (paid, free day, none), plan, auto-renewal,
Telegram, email (confirmed, unconfirmed, Telegram-only) and sign-up period.
Access is decided exactly as the badge decides it: a free day is a period that
ends within `TRIAL_DAYS` of its start, a comparison of two columns Prisma
cannot express, so the service reads the few active subscriptions started in
the last `TRIAL_DAYS` and classifies them with `periodKind`; "paid" excludes
those ids, and "none" matches an account without a subscription row as well —
a `NOT` over the relation would drop those rows on SQL's `NULL`. Plan and
auto-renewal narrow paid access only. Campaign codes filter by state and kind,
gifts by state; a campaign's "used up" compares its redemptions with its limit,
so the service computes the state per code with `campaignState` and pages the
result in memory — campaign codes are created by hand and stay few.

Controls in a row share one height: inputs and selects are 46 px, and a button
beside them takes `size='field'` (46 px) instead of `md` (42 px), placed in the
same `FormField` as the input so the hint or error sits under the whole row.
`SectionHead` centres its actions against the title.

## Overview

**The tiles and `/stats` are one collection.** `AdminStatsService.collect` is
what `TelegramStatsService` used to do inline; the bot now only formats it, so
the two can never disagree: users in total and new in the last 24 hours and 7
days (`STATS_WINDOW`), live paid periods by plan and live trials (`periodKind`),
paid periods that renew automatically (a saved card and no `cancelAtPeriodEnd`),
succeeded payments and their sum over the last 30 days (refunded ones are no
longer `succeeded`), devices, linked Telegram chats, and the nodes.

Nodes are counted with the status module's own `nodeStatus(...).state` — up,
degraded or down, the rule `/status` publishes ([status.md](status.md#up-degraded-down))
— and `off` for a node out of rotation. The bot's node lines keep the alert rule
(`OWNER_ALERT.nodeDownAfterMinutes`, the same three minutes), so `/stats` never
contradicts an alert; the panel shows "degraded" where the bot only knows "up".

Two sparklines ride on the tiles: sign-ups and revenue per day for the last 14
UTC days (`ADMIN_OVERVIEW.trendDays`). Devices by platform and by app are bar
lists of the current device table, the six largest values and the rest folded
into «Остальные»; a device that never reported a platform or app is
«Не сообщили», not dropped.

### Trends

One period switch, 30 or 90 days, scopes everything under it. Days are UTC
calendar days ending today, filled with zeros where nothing happened, bucketed
in SQL (`date_trunc('day', … AT TIME ZONE 'UTC')`, `AdminSeriesService`):

| Chart                                    | Form            | What is counted                                                                                                                  |
| ---------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Выручка по дням                          | columns         | sum of `succeeded` payments by `created_at` — the date the payment was opened; a refunded one drops out, since its status changes |
| Оплаты по дням                           | columns         | the number of those payments                                                                                                     |
| Регистрации по дням                      | columns         | `user.created_at`                                                                                                                |
| Новые платные и пробные дни              | two lines       | accounts whose **first** succeeded subscription payment fell on the day, against `subscription.trial_started_at`                 |
| Из пробного дня в оплату                 | stat tile       | trials started in the period, and how many of those accounts have a succeeded subscription payment at or after the trial start  |
| Выручка                                  | share bars      | one card switched between «По тарифам» (succeeded subscription payments per plan) and «По типам» (succeeded payments per kind); the total above the bars |
| Приглашения                              | tiles + table   | referrals created in the period: invited, rewarded, days granted to inviters and to friends, the ten inviters with the most      |
| Рост                                     | three tiles     | `growth`: succeeded subscription payments by referred accounts (count and sum); automatic win-back discounts granted, the payments made with one and their sum; checkout reminders sent and how many of those reminded then paid for a subscription |

Revenue and payment count are two charts, not one with two axes — two scales
on one plot invent a correlation.

**«Рост» is three stat tiles, one per lever** (`GrowthBlock`): «Оплаты по
приглашениям» as payments · sum, «Возврат ушедших: предложено / использовано /
выручка» and «Напоминания об оплате: отправлено / вернулись», each value
written in the order its label names, with a one-line hint under it saying
what is counted. The parts of a tile share it rather than each getting a tile:
an offer count without its redemptions, or reminders without the ones that
came back, invites the wrong reading. The block follows the same rules as the
others — a caption with the period, and one line instead of three zero tiles
when nothing happened.

**Every block says what it counts and over which period, and an empty period
is one line, never a list of zeros.** Each card carries a caption («Успешные
оплаты по дню создания за 30 дн., без возвратов»); a chart whose period has
nothing in it is replaced by «За этот период оплат не было» (or the block's own
wording), the revenue card hides its bars, the referral block its tiles and
table, the payment totals hide on an empty filter, and a sparkline of zeros is
not drawn. The owner's first look at the panel was a period without payments,
and the revenue breakdown then read as «1 месяц / 0 оплат / 0 ₽ …» — the empty
states exist because of it.

**Breakdowns are share bars.** `BarList` draws each row as the label, a bar
whose length is the row's share of the total (its percent is in the row's
accessible text and the bar's tooltip), and the numbers right-aligned in
tabular figures — «12 оплат · 11 880 ₽». The rows share one grid, so bars start
and numbers end on the same line in every row; below the `md` breakpoint the
bar takes the full width and the label and numbers sit under it. The revenue
card shows its total above the bars as a figure, and the plan view's caption
says it leaves out extra devices and gifts, so the two views' totals are not
expected to match. Device breakdowns and the promo-code blocks use the same
bars inside the same `Panel`, which matches the account page's inner cards
(padding, radius, title size). Accounts that were deleted are invisible to
the trial and first-payment series (their rows are gone or their payments have
no user), and a trial started yesterday has had no time to convert, which the
conversion tile says.

**Active paid subscriptions over time is not drawn**, on purpose. Nothing
stores period history: the subscription row holds only the current end, which
renewals, bonus days, referral rewards, promo days and refunds all move.
Rebuilding it from payments would miss every day granted without a payment and
every refund rewind, so the curve would look precise and be wrong. A daily
snapshot table would make it honest; until then the tile shows today's number
and the trend charts show what is actually recorded.

### Growth

`growth` in `GET /admin/analytics` (`adminGrowthSchema`) is computed by
`AdminAnalyticsService.growth` over the same range as everything else:

- **`referredPayments`** — succeeded `subscription` payments created in the
  range by accounts that are the friend in a `referral` row, counted and
  summed. A friend's renewals count too: this is what referred accounts pay,
  not only the first payment the reward was for.
- **`winBack.offered`** — redemptions of automatic codes created in the range,
  i.e. win-back discounts granted ([promo-codes.md](promo-codes.md#automatic-codes));
  **`redeemed`** and **`revenue`** — succeeded payments created in the range
  that were priced with an automatic code, and their sum. A discount pays for
  exactly one payment, so the count is the number of discounts consumed; a
  refunded payment drops out, as everywhere.
- **`checkoutReminders.sent`** — `checkoutReminder` rows of the notice log
  whose `sent_at` falls in the range ([billing.md](billing.md#abandoned-checkouts),
  [scheduler.md](scheduler.md#the-notice-log)); **`recovered`** — those
  whose account has a succeeded `subscription` payment created within
  `GROWTH.checkoutRecoveryDays` (seven) after the reminder, in one SQL pass
  with `count(*) FILTER (WHERE EXISTS …)`.

### The charts themselves

Small inline-SVG components in `ui-kit` — `ColumnChart`, `LineChart`,
`BarList`, `Sparkline`, `StatTile`, `ChartFrame` — rather than a charting
dependency: five chart forms, one light theme and server rendering did not
justify a library's weight and its theming layer. They follow the data-viz
method the repository uses: the form by the job (a stat tile for one number,
columns for daily magnitudes, lines for two series over time, a bar list for
nominal categories), thin marks with rounded data ends, hairline grids, compact
ticks, one hue for a single series, and a categorical order validated for
colour-blind separation on the white card (`--chart-series-1..3` in
`globals.scss`; the third slot is below 3:1 contrast, so it only ever appears
with a table view or labels). The app has one paper theme, so there is no dark
variant to validate.

Every chart has a text alternative: `ChartFrame` carries a one-line summary
(total and peak) and a «График / Таблица» switch to a real `<table>` of the same
numbers; a `BarList` is an ordered list with the value at each bar, so it is its
own text. Columns and the line chart answer the keyboard (arrows move between
days), every mark has a tooltip, and a refetch dims the frame rather than
swapping it for a skeleton.

## Users

The list is newest first, 25 to a page (`ADMIN_PAGE`), with email, sign-up
date, access (none, free day or paid) and its end, plan, devices and Telegram.
The search box takes one string (`parseUserSearch`, tested): a UUID is a user
id, digits are a Telegram id (and an email fragment), `@name` is a Telegram
username, anything else matches the email, the name or the username in part,
case-insensitively, and the user id exactly — the id better-auth issues is a
32-character string, not a UUID, so it lands in this branch. «Скачать CSV»
exports the same filtered list.

The card gathers what support asks about: profile and Telegram, the
subscription (period kind, end, auto-renewal and the card's title, extra
devices, banked bonus days, the trial), the subscription link's metadata,
devices, payments (the latest 50), who invited them and whom they invited (the
latest 50 and the total), promo codes they redeemed and gifts they bought.
Every person in it is a link to their own card.

**Never shown:** the subscription token or link, a saved card's id, passwords,
sessions, a peer's credential; gift codes appear masked to their last four
characters everywhere, because a gift code is a bearer secret that belongs to
whoever holds it.

Every action is behind a confirmation dialog and reuses the path the rest of
the server already trusts:

| Action                         | What runs                                                                                                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Продлить на N дней (1–365)     | the promo-code bonus-days rule (`accessExtension`: `max(now, end) + N`, extras reset past the grace, a row created when there is none), in a serializable transaction, then `setEnabledAll` best-effort — the `expired-access` sweep is the guarantee, as for a payment |
| Выключить автопродление        | `AutoRenewService.cancelAutoRenew`; the card stays linked                                                                                                                                                   |
| Удалить устройство             | `DevicesService.remove`, the account page's own path; the keys leave the nodes on the next reconcile                                                                                                       |
| Вернуть платёж                 | below                                                                                                                                                                                                       |
| Написать в Telegram            | `TelegramNotifyService.message`: plain text, HTML-escaped (the bot sends with `parse_mode: HTML`); the answer says sent, not linked, blocked the bot, bot off or failed                                     |
| Отметить почту подтверждённой  | `emailVerified = true`, refused for a Telegram placeholder address; for support cases where the letter never arrives                                                                                       |
| Обновить ссылку подписки       | `SubscriptionLinkService.rotate`, which also revokes every device that fetched the old link; the new link is not returned to the panel                                                                     |

### Refunds go through the webhook

«Вернуть» exists only on a `succeeded` payment. It asks YooKassa for a **full**
refund with the idempotence key `admin-refund-<payment row id>`, so a double
click or a retry asks for the same refund, then stamps
`payment.refund_requested_at` and changes nothing else. Access, referral days
and gifts are taken back by the existing `refund.succeeded` path
([billing.md](billing.md#refunds)) — the same code a dashboard refund goes
through — so there is one reversal to keep correct, not two. Until the webhook
lands, the payment reads «Возврат запрошен»; afterwards `refunded` wins. This
needs `refund.succeeded` subscribed in the shop's notification settings, which
billing already requires.

A YooKassa error or a refund it cancels on the spot answers `PAYMENT_FAILED` and
stamps nothing; the panel says to check the shop balance or refund in the
dashboard. A refund YooKassa accepts and cancels later leaves the stamp with no
webhook to clear it — rare, and visible as a payment stuck in «Возврат
запрошен», to be checked in the dashboard.

## Payments

Filters for status, kind, plan and a period (7, 30, 90, 365 days or all), newest
first, 25 to a page. A plan is a subscription's or a gift's; an extra-places
payment has none (`plan` is null), so filtering by plan never counts one
([billing.md](billing.md#prices-flags-and-webhooks)). The totals cover the whole filtered set, not the page: the
count takes every status, and the money is split into what was paid
(`succeeded`) and what was refunded. A single sum over every status once added
canceled and refunded payments to the paid ones and answered no question
anybody asks. A payment of a deleted account keeps its row and says so. The
CSV export takes the same filters.

Route ids are plain strings capped at 64 characters, not UUIDs: the database
issues UUIDs for its own rows, but better-auth writes a user's id itself as a
32-character random string, and a `z.uuid()` param refused every real user.

## Promo codes

Campaign codes, newest first, with their use count against the limit, the
number of succeeded payments discounted with each and their sum, the expiry and
a state (active, stopped or expired, used up). Two bar lists above the table
show which codes on the page are redeemed and which earn. Creating a code goes
through `PromoCampaignService.create` — `campaignProblem` is the final judge —
and the form runs the same ranges first (`adminCampaignFormSchema`); the last
day ends at 23:59:59 Moscow time, as with `/promo`. «Остановить» calls
`PromoCampaignService.stop`: new redemptions end, a discount already redeemed is
kept. The paginated list is the admin module's own query; `latest()` stays the
bot's.

Gifts are read-only: buyer, plan, purchase date, who redeemed it and when, and
a state — waiting for a recipient, redeemed, or revoked by a refund. A paid
gift belongs to its buyer, and only a refund disables it.

Confirmation buttons name what they do: «Вернуть 990 ₽» / «Не возвращать»,
«Остановить BONUSWEEK» / «Оставить».

## Nodes

Every node, the ones out of rotation too, in display order: country and city,
`host:port`, protocols, state, last healthy and last checked, overload, and the
30-day uptime strip. State and uptime are the status module's computation
(`nodeStatus` over `node_uptime`), the strip is the status page's own
`UptimeStrip`. The host is shown because the owner needs it to reach the
machine; `apiUrl` (it embeds the panel's secret path), the token env var name, the
server name and keys are never selected, and the response is
parsed through `adminNodeListSchema`, so a wider select added later still cannot
leak them — a test hands the view a row carrying them.

«Вывести из ротации» sets `isAvailable = false`: the node leaves the
subscriptions on their next refresh, the public status page (after its
30-second cache) and the minute health checks. Peers on the node are not
touched, so open connections do not drop at once and putting it back needs no
re-provisioning. Re-provisioning leaves the flag as the owner set it:
provisioning and the production node sync write `is_available` only when they
insert a new row ([provisioning.md](provisioning.md#re-running-it-is-safe)).
Every run used to put a node taken out of rotation back in.

## Contracts

Every request and response is a Zod schema in `packages/schemas/src/admin`; the
DTOs wrap them and every route carries `@ZodResponse`. `ZodResponse` alone does
not strip unknown keys — the app registers no serializer interceptor
([status.md](status.md)) — so every service returns `<schema>.parse(...)`. List
endpoints take only the query parameters that are set: an empty `status=` is a
validation error, which is why the client drops a filter left on «Любой»
(`paymentFilterQuery`).

CSV exports are JSON `{ filename, content, rows, isTruncated }`, capped at
10 000 rows (`ADMIN_EXPORT`), written by `csv-stringify` (`toCsv`, options in
`ADMIN_CSV`): UTF-8 with a BOM so Excel reads Cyrillic, CRLF, RFC 4180 quoting
(a lone `\n` is quoted too — `quote_record_delimiter`, which the library turns
off once a record delimiter is set), flags written as `true`/`false`, and a text
cell starting with `=`, `+`, `-`, `@`, a tab or a carriage return (or their
full-width forms) prefixed with `'` (`escape_formulas`), so an email like
`=HYPERLINK(...)` cannot become a formula in the owner's spreadsheet. A negative
number stays a number.

## Logging

Every action writes one line with the admin's email and the target's id —
`admin <email> extended <userId> by <N> days to <date>`, `… refunded payment
<id> in full (<amount> RUB, refund <id> <status>)`, `… took node out of
rotation: <nodeId>` and so on. A message sent in Telegram is logged by its length
and outcome, never its text, and a node by its id, never its URL
([logging.md](logging.md)).

Every write is also one row in `admin_action` (`AdminAuditService.record`,
`20261026130000_admin_action_and_consent`): the admin's email, the action
(`ADMIN_ACTION` — extend, cancelAutoRenew, removeDevice, message, verifyEmail,
rotateLink, refund, createCampaign, stopCampaign, setNodeAvailability), the
target account's id and a small JSON of details — the days and new end, the
device, the message's length and outcome (never its text), the payment, the
refund and its status, the code, the node and its new state. It is written
after the action succeeded and best-effort, like the log line: a failed write
is logged as an error and never fails the action that already happened. The
target is a plain id, not a foreign key, so the record outlives the account.
Nothing reads the table yet; it is there so the next question about who did
what has an answer that is not a log search.

## Data

`payment.refund_requested_at` (`20261024120000_admin_refund_request`) is the
panel's own schema change, and so is `admin_action`. The growth metrics read
what the growth jobs write: `promo_code.is_automatic`
(`20261025100000_win_back`) and the notice log's `checkoutReminder` rows
(`20261026120000_notice_log`). Everything else the panel shows was already
stored.
