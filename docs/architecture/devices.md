# Devices

How an account's device limit is enforced. Code: `apps/server/src/modules/devices`,
the feed in `modules/subscription-link`, the sweeps in `modules/scheduler`.

## Why the panel's IP limit was not enough

The limit used to be `limitIp` on each 3x-ui client, and every user had one client
per node **and per protocol**: Hysteria2 and VLESS on each node, each allowing
`deviceLimit` IPs. Two nodes made a two-device subscription an eight-device one,
and a home Wi-Fi counted as one device however many phones sat behind it. On top
of that, 3x-ui does not refuse the surplus connection: its job notices a third IP
every ten seconds and has fail2ban ban the _oldest_ one for 30 minutes — an IP
that may be a mobile carrier's CGNAT address shared by other customers on that
node.

Nothing in that scheme knows what a device is. The registry does.

## A device is what fetches the subscription

INCY sends a hardware id with every subscription request when HWID sending is on
(`x-hwid`, `X-Device-ID` on Android, plus `x-device-os`, `x-ver-os`,
`x-device-model`). The id survives a reinstall — Keychain on iOS, encrypted
preferences on Android — so it identifies the device, not the install.
`deviceIdentity` reads those headers and turns them into a key:

- `hwid:<UUID>` when a hardware id is present;
- `app:<name>` otherwise — another client (Hiddify, v2rayNG…), or INCY with HWID
  sending switched off, which the user can do. Every such install of one app on
  one account shares a key, so it is **one** device.

The second rule is what keeps the limit from being a toggle: switching HWID off
does not make a device invisible, it makes all of that user's HWID-less INCY
installs share one slot.

**INCY without a hardware id cannot take a new slot.** Sharing one slot was
still a bypass: every phone of a household (or of whoever got the link) running
INCY with HWID sending off was the same `app:incy` device, so a two-device
subscription served any number of INCY installs. The feed now admits that key
with `canRegister: false` (`isKeylessIncy`): an account that already holds an
`app:incy` device keeps it and is served as before, but gets the `hwidNudge`
announcement asking to switch HWID sending on; an account without one is not
given a slot at all — an empty list and the `hwidRequired` announcement, and no
`deviceBlocked` notice, since nothing hit the limit. Once HWID sending is on,
the install fetches as `hwid:<UUID>` and registers like any device; the old
`app:incy` entry keeps its slot until it is removed. Removing that entry is
therefore final for every HWID-less INCY install of the account.

Other apps never send a hardware id, so `app:<name>` stays one shared slot for
them, but their clients get `limitIp` 1 instead of 2 (`deviceIpLimit`): the
shared keys work from one network at a time. INCY's announcement texts are
Russian only, like every announcement ([subscription-feed.md](subscription-feed.md#headers-traffic-and-the-announce-banner)).

**A fetch that is not a VPN client is not a device.** The second rule used to
take anything: opening the link in a browser registered `app:mozilla`, and
sending it to oneself in Telegram registered `app:telegrambot` — the messenger
fetches every link for its preview. Each held one of the two slots for good, so
the owner's real phone was then refused with an empty list, and each was issued
keys on every node, which restarted every core and dropped every session on it.
`isClientFetch` (`subscription-link/lib/client-fetch`) now turns away a
link-preview agent and a browser asking for a page (`Mozilla/…` with
`Accept: text/html`); such a fetch gets the headers and no servers, registers
nothing and does not touch `lastSeenAt`. A hardware id always counts as a
client, and so does an app that borrows a browser user agent without asking for
HTML. `20261018120000_referrals_and_device_cleanup` removed the slots those fetches
had already taken and revoked their keys; reconcile releases them on the nodes.

## A WireGuard config is a device too

The official WireGuard apps and routers cannot read a subscription; they import
a `.conf`. The WireGuard side of the account page's Connect tab makes one: `POST /wireguard/configs`
(behind `SubscriptionGuard`) registers a device with the key
`wg:<random uuid>`, the name the person typed as its model and `WireGuard` as
its app, admits it through the same `DevicesService.admit` — so it takes a slot
and is refused at the limit with `DEVICE_LIMIT_REACHED` — and issues only the
WireGuard peer on the chosen node (`ensureNode({ protocols: [wireguard] })`).
The response is the `.conf` and its file name: the name the person typed,
transliterated by `slugify`, then four hex of the device id and the country —
`Ноутбук` on NL becomes `noutbuk-3f2a-nl.conf`. The apps take the file name as
the tunnel name, so it must fit the 15 characters a tunnel name may have on
Windows and Linux and must differ between two configs called the same; the id
does the second, and the name is cut to what is left. A name with nothing left
to keep becomes `gnome-<4 hex>-<country>`. The client
saves it as `application/octet-stream` and revokes the blob URL only after the
download started: as `text/plain` mobile browsers saved it as `.txt`, and a URL
revoked in the same tick made some browsers fall back to a random name.
`GET /wireguard/configs/:id` renders the same file again from the stored key
and address, and `GET /wireguard` lists the WireGuard nodes and the configs.

Such a device never fetches the feed, so only its tunnel moves `lastSeenAt`
(below), and it behaves like every other device otherwise: it appears on the Devices tab,
removing it there revokes its key, a lapsed subscription disables it and a
renewal brings it back, and a shrinking limit releases the newest devices first —
except that a released WireGuard config is removed outright (below), since it
cannot come back on its own.
If the node will not take the peer, the device is removed again so the slot is
not lost to a config that does not exist.

**The tab knows which servers are down.** `GET /wireguard` marks each node and
each config's node with `isDown`, by the rule the feed uses: `liveNodes` over the
available nodes (a stale `lastHealthyAt`, unless every node looks stale, which
means the probe itself is down). The form shows a down country disabled and
picks the first live one; the list marks a config whose server is down, so a
config that does not connect is not taken for a broken one. `POST
/wireguard/configs` refuses a down node with `NODE_UNAVAILABLE` rather than
waiting out the panel's timeout. Country names come from `Intl.DisplayNames`
on the node's `countryCode` in the reader's locale; the server's `country` is
only the fallback.

**A node-sync change removes the configs it breaks.** `bun run provision:nodes`
writes the production node rows with `buildNodeSync`. When a node's port, SNI or
WireGuard key changes, its WireGuard configs no longer match the server, so the
`wg:` devices whose WireGuard peers sit on it are deleted, and the node's peers
are revoked (`revoked_at = now()`, `state = 'disabled'`; only the WireGuard
ones for a key change) rather than deleted, so `releaseRevoked` removes their
clients from the panel; the feed devices get fresh keys on their next fetch.
When a node is pruned, its `wg:` devices are deleted before the node row, whose
cascade then takes the peers — a config whose server is gone must not hold a
slot.

A peer is issued per `(device, node, protocol)` and named `d-<12 hex of the
device id>`, so its panel email is unique to the device. Removing a device
revokes exactly its keys; the other devices keep theirs. `limitIp` on a device's
client is `DEVICE_PEER.ipsPerClient` (2) — no longer the seat count, only a net
against one device's config being copied to a third network.

## Last activity is the tunnel, not the feed

`lastSeenAt` used to move only when an app fetched the subscription, which INCY
does on start and every few hours — connecting or disconnecting changed
nothing, so the Devices tab looked frozen. `NodeHealthJob` now also reads the
panel's `POST /panel/api/clients/lastOnline` every minute: the panel stamps a
client whenever its core reports traffic or a live connection (every 5 s), for
Hysteria2, VLESS and WireGuard alike. `deviceActivity` maps each client name
back to its peer's device and keeps the latest moment, and the device row is
moved forward only — `lastSeenAt < at` — so a feed fetch is never undone. The
account polls the device list every minute and shows "Active now" within three
minutes of the last activity.

## Admission happens in the feed

`DevicesService.admit` runs inside a serializable transaction, because two new
devices fetching at once would otherwise both see a free slot:

1. a known key refreshes its metadata and `lastSeenAt`, and is allowed when it
   holds one of the first `deviceLimit` slots by `createdAt` (ties by id, so the
   answer never flips);
2. an unknown key is registered only while the account has fewer than
   `deviceLimit` devices.

A refused device gets an empty list and the `deviceLimit` announcement naming the
account page and `/devices`; the `subscription-userinfo` headers still go, so
INCY shows the state rather than an error. Devices register only while the
period is active, so a lapsed account does not fill its slots.

Slots are not reclaimed automatically. A device that has gone quiet still holds
its slot until the user removes it — in the account page or with `/devices` —
because quietly evicting the oldest device would let the next phone in a
household take a slot from the owner's.

## Revocation converges through reconcile

Removing a device sets `revokedAt` and `state: disabled` on its peers and deletes
the device row; the peers keep their names so the node can still be told which
clients to delete. `reconcile-peers` runs `releaseRevoked` before everything
else: it deletes each revoked client the node still holds, and only then the
rows — so a node that is down when someone removes a device gets the deletion on
its next pass instead of keeping a key nobody can revoke. Each deletion settles
on its own (`deleteNodeClients`): one the node refuses is logged and keeps its
row for the next pass, while the rows whose client is gone — deleted now, or
never on the node — are dropped; the weekly `releaseLegacy` follows the same
rule. 3x-ui v3.10.2 deletes the last client of an inbound like any other (the
list becomes `[]`), so there is no case to refuse. `restoreMissing` and
`syncEnabled` see only live peers, and the access sweeps (`setEnabledAll`,
`expired-access`) never touch a revoked one, or the restore half would re-enable
it.

A live session on a revoked key keeps going until it reconnects: Xray cannot end
one without restarting the core (see [pitfalls.md](pitfalls.md)). Measured on
v3.10.2: a disabled or deleted VLESS or WireGuard client stops carrying traffic
at once, while a Hysteria2 QUIC connection opened before the delete keeps
working until the app reconnects ([nodes-and-peers.md](nodes-and-peers.md#client-changes-apply-live-only-an-inbound-needs-a-restart)).

**Rotating the link revokes every device that fetched it.** A new token alone
did not cut anyone off: devices that had fetched the old link kept their keys on
every node and kept connecting. `SubscriptionLinkService.rotate` (the account
page and the bot's `/rotate`) now, in one transaction, revokes the peers of
every device that is not a `wg:` config, plus the account's shared legacy keys
(`deviceId` null), deletes those device rows, writes the new token and clears
the blocked-notice state. Reconcile deletes the clients within five minutes.
WireGuard configs never used the link, so they stay. Every app has to import the
new link and takes a slot again on its first fetch; a phone still holding the
old link gets `404`.

## Shrinking limits and the old shared keys

**Over the limit.** `device-slots` runs every ten minutes. When the limit
shrinks — paid extras end when the subscription lapses, a renewal keeps them
([billing.md](billing.md)) — the devices past it lose their keys. A device that
fetches the feed stays registered and comes back on the next fetch once there is
room again. A `wg:` device never fetches the feed, so nothing would ever bring it
back, and it would hold a slot for good while serving nothing: `revokeOverLimit`
deletes it instead, its peers revoked and its row deleted in one transaction, as
removing it by hand does.

**The paid extras outlive the period by the config grace.** `revokeOverLimit`
used `activeDeviceLimit`, which drops to the default the moment the period
ends, so a renewal paid a few minutes late had already cost the account its
extra WireGuard configs — deleted for good. It now uses `graceDeviceLimit`: the
paid limit until `WINDOW.configGraceHours` (6) after `currentPeriodEnd`, the
same grace `expired-access` gives the keys themselves.

The `devicesShrunk` notice names only the devices whose keys this pass revoked
or removed, not every device still past the limit, so a device is named once.
It is skipped when the account no longer has an active period: the `expired`
notice already told the owner, and a shrink after the grace is a consequence of
it.

**The shared `incy` peers retire in the weekly garbage collection.** Before the
registry every account had one set of `incy` peers shared by all its devices.
`releaseLegacy` deletes them in the `collect` pass of `reconcile-peers` — Sunday
04:17, the pass that already asks the node who is online and already restarts
the core — and only when both hold:

- the account has a device registered more than `LEGACY_PEER.graceHours` (48)
  ago, so its installs have had several 12-hour refreshes to pick up keys of
  their own;
- the node does not report that client online. A shared key carrying a session
  right now waits for next week rather than cutting it mid-stream, the same rule
  orphan collection follows.

Doing it there rather than on its own schedule costs no extra core restart — a
restart drops every tunnel on the node — and lands it at night. A device that
never refreshed loses the shared key then and connects again after one manual
refresh in the app.

## The owner hears about every change in Telegram

A linked chat is told, through `TelegramNotifyService.tell`, whenever the
registry changes under it — the feed never waits on any of it:

- **`deviceAdded`** — a new device registered: its title (`deviceTitle`: model
  or platform, then app), `N of LIMIT`, and what to do if it wasn't them
  (`/devices`, then `/rotate`). Registration happens once per device, so this
  needs no de-duplication; it doubles as a warning that the link has leaked.
- **`deviceBlocked`** — a device was refused at the limit. INCY retries on its
  own, so `FeedNoticeService` claims the notice on the link row and says it once
  per device per `DEVICE_NOTICE.blockedRepeatHours` (24). The row held one key,
  so two blocked devices taking turns overwrote each other and repeated the
  notice on every refresh; `blockedKey` now holds the keys already told in the
  window (`|`-separated, at most 16), `blockedNoticeAt` the window's start, and
  the claim is a compare-and-set on both (`claimBlockedNotice`).
- **`devicesShrunk`** — `device-slots` revoked devices past a smaller limit; it
  names the ones this pass revoked, and only while the period is active.
- **`legacyRetired`** — the weekly pass removed the last shared `incy` key of the
  account: if some device stopped connecting, refresh the subscription in the
  app. Sent only once no shared key is left on any node.

The site shows the same rule on the Devices tab of the account page, and tells a
user whose INCY sends no HWID that every such install counts as one device and a
new one gets no servers until HWID sending is switched on in INCY's subscription
settings. Removing a device asks with copy that fits it (`removalKind`): a
WireGuard config is deleted for good and frees its place; INCY without HWID
cannot take a place again until HWID sending is on; any other app takes the
place again on its next refresh unless the subscription is deleted in the app
first.

## What it does not stop

A user who exports a device's server configuration by hand and imports it
elsewhere shares that device's keys; the per-client IP limit is the only check
left there. `hide-url` keeps the subscription URL itself out of INCY's share
sheet ([subscription-feed.md](subscription-feed.md)).
