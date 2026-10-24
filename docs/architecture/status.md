# Server status and the connection check

The public `/status` page: which servers are up, what each one offers, how
available it has been for 30 days, and a button that answers "is my traffic
going through GnomeVPN right now". Code: `apps/server/src/modules/status`,
`packages/schemas/src/status`, and on the client `views/status`,
`entities/vpn/node-status`, `features/vpn/check-connection`. Part of the
[documentation index](../README.md).

## What is public, and why none of it locates a node

`GET /status` is anonymous. Per available node it returns exactly this, in
`displayOrder`:

| Field         | What                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------ |
| `countryCode` | the client shows the flag and the localized name (`countryName`)                           |
| `protocols`   | Hysteria2 always, VLESS when both Reality keys exist, WireGuard when `wgPublicKey` does    |
| `state`       | `up`, `degraded` or `down` — the rule is below                                             |
| `checkedAt`   | when node-health last probed it, or `null` before the first probe                          |
| `uptime`      | the share of checked minutes it was up over the 30-day window, or `null`                   |
| `days`        | 30 entries, oldest first, `{ date, uptime }` per UTC day; `null` for a day nothing checked |

**No id, host, port, server name, city, panel URL or key.** A status page is
read by whoever wants to block the service as much as by its users, and every
one of those fields either is an address or narrows the search for one. The node
id is an opaque UUID, but nothing on the page needs it — the list is keyed by
position. Two guards keep it that way: `nodeStatus` builds the view field by
field (its test hands it a row carrying a host and an API URL and checks neither
comes out), and `ServerStatusService` returns `serverStatusSchema.parse(...)`,
which strips any key the schema does not name, so a wider `select` added later
cannot leak through the response. `ZodResponse` alone would not do it: the app
registers no serializer interceptor, so it only documents the shape.

The response is cached for 30 seconds (`STATUS_PAGE.cacheTtlMs`, the same
`CacheInterceptor` the platforms route uses). The data moves once a minute, so
a page refreshed by many readers costs one query per half minute.

## Uptime accounting

`node-health` probes every available node each minute
([scheduler.md](scheduler.md)). At the end of every run it calls
`NodeUptimeService.record({ checkedAt, nodeIds })`, which in one transaction:

- upserts a `node_uptime` row per node for the current **UTC** day, adding one
  to `checked_minutes`, and one to `up_minutes` when the node passed;
- stamps `node.last_checked_at` with the run's start;
- deletes rows older than `STATUS_PAGE.uptimeRetentionDays` (90). The page shows 30; the
  rest is there for looking back at an incident. The table holds nodes × 90
  rows, and `day` is indexed, so the prune costs nothing on every run.

**"Passed" means this run stamped the node healthy** — `lastHealthyAt` at or
after the run's start (`passedCheck`). The probe writes `lastHealthyAt` only
when the panel answered and its inbound is enabled with Xray running, so an
unreachable panel, a disabled inbound and an error all count as a minute down.
Reading the stamp back keeps the job's own code as it was: the job gained a
start time, one field in its existing update and one call, nothing in how it
probes.

A minute nobody checked is not counted at all — a deploy or a crashed API is
not the node's downtime, and a day with no checks shows as "no data", never as
an outage. The 30-day figure is weighted by minutes (`minuteRatio` over all the
window's rows), so a node added this afternoon is not dragged down or propped
up by a whole empty day.

## Up, degraded, down

`nodeState` reads three stamps on the node row:

- **down** — never seen healthy, or `NODE_DOWN.statusPage.failedChecks` (3) recorded checks
  in a row have failed since the last healthy one: `lastCheckedAt` is more than
  two check intervals after `lastHealthyAt`. The rule counts checks that
  happened, not minutes on the wall clock, so it never says "down" a few
  seconds before the third probe has actually failed — and when the checks
  themselves stop (the API is restarting, the scheduler stalled), every node
  keeps its last known state instead of turning red for everyone; a crashed
  API is not the node's downtime, as the uptime accounting already says. Shorter
  than the feed's 10-minute `NODE_DOWN.feed.staleMinutes`, on purpose — the two
  rules sit side by side in `NODE_DOWN` (`status/lib/node-status`) so neither
  changes without the other in view: the feed must not
  drop a node from INCY over a blip, while a status page that says "working"
  for ten minutes of a full outage is lying.
- **degraded** — reachable within that window, but either the latest probe
  failed (`lastCheckedAt` after `lastHealthyAt`) or the node is over the alert
  thresholds. `node.is_overloaded` is written by node-health on every healthy
  probe from `isOverloaded(health)`: CPU at `ALERT.nodeCpuPercent` or memory at
  `ALERT.nodeMemoryRatio` — the same thresholds that log a warning, because a
  node that hot is already the one users feel. A failed probe leaves the flag
  as it was; the failure decides the state then anyway.
- **up** — otherwise.

So an outage reads up → degraded → down over three minutes, and recovery is
immediate: the first healthy probe returns the node to up.

## The connection check

1. On a click, the **browser** fetches `https://api.ipify.org?format=json`
   (a CORS-enabled IP echo) with a 5-second timeout and parses the answer
   with `connectionCheckSchema`.
2. It posts that address to `POST /status/check` as `{ ip }`.
3. The server answers `{ viaGnome, countryCode? }`.

**Why the browser asks a third party** instead of the server reading the
request's own address: the request to our API does not necessarily travel the
same way as the rest of the reader's traffic. INCY can route Russian
destinations around the tunnel, and the API itself may be reached directly; the
address a neutral foreign echo sees is the one the rest of the web sees.

`getPublicIp` uses plain `axios`, **not** the shared `api` instance: that one
attaches the reader's bearer token to every request, which must never reach a
third party. ipify receives the request and the address it comes from, nothing
else, and only after the click — the privacy page says so in both languages.

**The server never returns or logs the address list.** `ConnectionCheckService`
resolves every available node's `host` — an IP literal is used as is, a name
through a `node:dns` `Resolver` with a 2-second timeout and one try, A and AAAA
both — and keeps the list in the cache manager for five minutes
— or for 30 seconds when some node did not resolve, so a passing DNS failure
is retried soon rather than hiding that node from the check for five minutes
(`cache.wrap` with a TTL computed from the lookup, which also lets concurrent
misses share one lookup).
An IPv4 address that arrives mapped into IPv6 (`::ffff:203.0.113.10`, in
either notation) is unmapped before the comparison. The answer is a boolean and a country code. Both sides are put in
canonical form before comparing (`canonicalIp` in `common/lib`: `node:net`
`isIP` decides what is an address, `ipaddr.js` writes it — IPv6 in RFC 5952
form), so an IPv6 address written with different case or zero compression still
matches. The YooKassa webhook guard reads its caller through the same function. A host that does not
resolve is logged by node id only. The posted address is not stored.

**It is an oracle for one address at a time**: anyone can ask whether a given
address is one of ours. That tells nothing a trial account's subscription feed
does not already list in full, but it should not become a scanner, so the
route carries `@Throttle({ default: CONNECTION_CHECK.throttle })` — 20 requests
a minute per client address, counted by the global `ThrottlerGuard`'s own
per-IP tracker (`trust proxy` is set, so it is the address Caddy saw). Twenty
rather than ten because every reader on one node reaches the API from that
node's address when the tunnel is on. The schema accepts a single IPv4 or IPv6
address and nothing else — no hostname for the server to resolve on the
caller's behalf, no range.

## The page

`/status` is an indexed marketing page (route, `INDEXED_ROUTES`, sitemap
`daily` at 0.4, `LLMS_PAGES`, the footer's service group), namespace `status`.
The server render paints the intro, the check card and a loading block; the
node list arrives through `useServerStatus` (TanStack Query, refetched every
minute) and the check through a mutation, so nothing reads the clock or
`window` during the prerender and the page renders with no API behind it, which
the Playwright spec relies on. Each node card shows the flag and localized
country name (`useCountryName` from `entities/app/country`, the one hook the
WireGuard picker uses too), a state badge (the ui-kit `Badge` gained a
`warning` tone for "degraded"), the protocols, "checked N minutes ago" from
`useNow` on its own line under the name and the badge, and the 30-day strip.

The strip is `UptimeStrip` in `entities/vpn/node-status`, not part of the view,
because the admin panel shows the same strip per node; it takes the node's
`days` and `uptime` and nothing page-specific. One bar per day is coloured by
`uptimeTone` (≥ 99 % good, ≥ 95 % fair, below that poor, empty for no data).
The summary counts only the days that have data — a node added a week ago reads
"99.9 % over 7 days", not "over 30 days" — and says "No data yet" when there
are none. A screen reader gets one list, labelled "Availability by day" and
described by that summary, with one name per bar: the visually hidden
"date: percent". The tooltip with the same text sits on an `aria-hidden` bar so
it is not read a second time, and the days with no data are hidden from the
list — thirty "no data" items said nothing the summary does not.
