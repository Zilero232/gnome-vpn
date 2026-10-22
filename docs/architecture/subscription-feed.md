# The subscription feed

How the VPN reaches a user: one URL, fetched by INCY or any other client, that
renders the server list and the subscription state. Code:
`apps/server/src/modules/subscription-link/`. Part of the
[documentation index](../README.md).

## The subscription is the product surface

`subscription-link/` is the whole delivery path. Three routes:

| Route                            | Auth     | Purpose                                             |
| -------------------------------- | -------- | --------------------------------------------------- |
| `GET /subscription-link`         | session  | the user's URL plus its `incy://crypt1/…` deep link |
| `POST /subscription-link/rotate` | session  | new token; every device on the old one is revoked   |
| `GET /sub/:token`                | **none** | what INCY (or any other client) fetches             |

**The token is the credential.** INCY cannot log in, so the URL is all the
authentication there is: 32 random bytes, `base64url`, one row per user. That is
why rotation exists — and why it revokes the keys of every device that fetched
the old link, not only the link ([devices.md](devices.md#revocation-converges-through-reconcile)) — and why the route sits on `/sub` rather than
`/subscription` — `/subscription/status` already lives there, and a token whose
value happened to be `status` would have shadowed it.

**The feed hands out servers only while the period is active.** The token
proves who is asking, not that they have paid: `SubscriptionLink` is created on
the first visit to the account page, before any trial or checkout, and issuing
would happily create an enabled client on every node for whoever holds it.
`SubscriptionFeedService.build` checks `isPeriodActive` first and answers an
empty list with the "no subscription" announce otherwise — the headers still go,
so INCY shows the state rather than an error. `expired-access` keeps its
six-hour grace (`WINDOW.configGraceHours`), but that grace is for a payer whose
renewal is late, not a substitute for this gate.

**`/sub/:token` is throttled tighter than the rest of the API, per token.** A
fetch from a new device issues keys on every node, so a leaked token in a loop
is an amplifier against the panels; `FEED.throttle` overrides the global limit
on that one route. The limit is counted per subscription token (`feedTracker`,
passed as the route's `getTracker`), not per IP: a mobile carrier's CGNAT puts
many subscribers behind one address, and counting by IP made them share ten
fetches a minute. An unknown token costs one indexed lookup and a `404`. INCY
itself refetches every `UPDATE_INTERVAL_HOURS` (12), which the
`profile-update-interval` header tells it.

**The feed sends no ETag and `cache-control: no-store`.** Express hashes the
body alone, and a renewal changes only `subscription-userinfo` — the server list
is the same peers as before. A client holding the old ETag got `304` and kept the
old `expire` for good, so a paid subscription stayed "expired" in INCY and in
Hiddify alike. `etag` is off app-wide in `main.ts`; nothing in the API relied on it.

`@incy/link-encoder` builds the deep link. Its AES key ships inside every INCY
client, so the encryption hides the URL from scanners, not from people.

## Issuing the peers

The feed first admits the requesting device ([devices.md](devices.md)); a device
over the account's limit gets an empty list and the device-limit announcement.
For an admitted one, `SubscriptionPeersService.ensureNode` ensures one
`kind: 'config'` peer per **device, node and protocol**, named
`devicePeerName(deviceId)` (`d-<12 hex>`), reusing `PeersService.issueAndPersist`; `SubscriptionFeedService` then renders each as a
`hysteria2://` or `vless://` URI. **A node that fails to issue is logged and
skipped** — one unreachable node must not empty the user's whole server list.

Issuing restarts no core: the panel pushes each new client into the running core
itself, which was verified against v3.10.2 before the restart was removed
([nodes-and-peers.md](nodes-and-peers.md#client-changes-apply-live-only-an-inbound-needs-a-restart)).
The peers are issued with `limitIp` from `deviceIpLimit` — 1 for an app that
sends no hardware id, 2 otherwise ([devices.md](devices.md#a-device-is-what-fetches-the-subscription)).

`protocolsFor` decides what a node advertises. Hysteria2 always; VLESS only when
the node carries `realityPublicKey` and `realityShortId`, which provisioning
writes. A node provisioned before Reality existed keeps serving Hysteria2 alone
rather than advertising a server the client can never reach.

**A Reality client is a UUID, not a password**, and needs `flow` alongside the
rest of the mandatory field set — `PanelClient.addVlessClient` writes all of it
for the same reason `addClient` does.

**`ensureVlessInbound` refuses to rewrite an inbound whose clients it cannot
read**, exactly like `updateInbound`. A re-provision that overwrote the client
list from the template would wipe every subscriber on that node.

`SubscriptionPeersService` owns the peer rows; `SubscriptionFeedService` owns
the response. Splitting them keeps the transaction and the retry out of the
path that only renders URIs.

`clientEnabledByEmail` must list **every** protocol the subscription issues.
It once listed Hysteria2 and WireGuard, and when WireGuard was removed a VLESS
client looked to `reconcile-peers` like a peer that had vanished from its node.

`lib/` under the module is split one folder per concern:

```text
lib/
├── announcement/      # the announce banner
├── client-fetch/      # whether the fetch is a VPN client, not a browser or a link preview
├── client-links/      # the third-party clients and their import links
├── client-platform/   # what the User-Agent says the caller is
├── incy-headers/      # the response headers, with header-value/ and userinfo/
├── incy-uri/          # the server list, with hysteria2/, vless/ and wireguard/ beside it
├── live-nodes/        # the nodes whose health probe is fresh, or all when none is
├── server-name/       # the flag-and-country label every protocol shares
├── subscription-token/
├── tls-mode/          # pin or skip verification, from the User-Agent
└── wireguard-conf/    # the .conf file and its name, for the official WireGuard apps
```

The URI builders were one file once, which hid that they share nothing but the
server label. Every entry of one country carries the same label; INCY tells them
apart by the protocol it reads from the scheme.

**A builder that cannot produce a URI returns `null`, never `''`.** `vlessUri`
returned an empty string for a node without reality keys, and the feed filters
on `isNonNullish` — so the empty string survived into the feed and a client
parsing the list hit a blank entry.

## Certificates: pin or skip

**A self-signed node is pinned, not trusted blindly.** `hysteria2Uri` emits
`pinSHA256` from the node's `certFingerprint`.

**`pinSHA256` is 64 lowercase hex characters, and `openssl` does not print it
that way.** `openssl x509 -fingerprint -sha256` returns `AA:BB:CC:…` — uppercase,
colon-separated — and that is what `certFingerprint` holds, because provisioning
stores the command's output verbatim. A core compares the pin as a string, so the
colons alone make every match fail; 3x-ui shipped the same bug by sending base64.
`pinnedFingerprint` normalises on read rather than in the column, so nodes
provisioned before this keep working without a re-provision. A value that is not
a sha-256 is not pinned at all, and since the tunnel config's `insecure` is off
(`TUNNEL.insecure`), such an entry carries neither parameter — an xray core will
refuse the self-signed certificate until the node is re-provisioned.

**sing-box does not implement `pinSHA256` at all**, so Hiddify ignores it and then
refuses the node's self-signed certificate. A pinned entry therefore connects in
INCY and fails in Hiddify — the fix for that is a certificate Hiddify already
trusts, not a wider `insecure`.

**The two cores cannot be served the same URI, so the feed picks per client.**
`tlsMode` reads the `user-agent`: a sing-box client (`SING_BOX_AGENTS` — Hiddify,
NekoBox, Clash, Streisand, Shadowrocket…) gets `insecure=1`, everything else gets
`pinSHA256`. Never both — an xray core refuses to start when `insecure` appears
(`The feature "allowInsecure" has been removed`), which is the regression that
introduced pinning in the first place.

This costs the sing-box clients their protection against a substituted server:
they verify nothing. It is the same position the subscription was in before
2026-09-17, and it holds only until the nodes have real certificates. The real
fix is a domain per node plus Let's Encrypt — then nobody pins and nobody skips
verification — and it needs DNS records that do not exist yet.

An unknown or absent `user-agent` pins. A client we have not heard of is more
likely to be an xray core than not, and a pin that a client ignores is a failed
connection, while an `insecure` it ignores is a core that will not boot.

## Headers, traffic and the announce banner

**Headers carry everything the app displays.** `subscription-userinfo` holds the
expiry, `profile-title` the name, `profile-web-page-url` the account link,
`support-url` the support link when `SUPPORT_URL` is set. Any non-ASCII value
must be sent as `base64:<…>` — HTTP headers cannot carry UTF-8: a raw Cyrillic
`profile-title` or `announce` does not merely render wrong, it breaks the whole
response. `headerValue` decides that per value, so nothing has to remember it at
the call site.

**`hide-url: 1` is set, and it costs the account-page button.** It keeps the
token out of INCY's Share/Copy/QR, which is the point; the same flag also
suppresses whatever `profile-web-page-url` would render, so the button that
opens the account page does nothing while it is on. The header stays because
not handing a user a one-tap way to forward their own credential is worth more
than the link. Do not "fix" the dead button by dropping the flag.

`subscription-userinfo` carries the expiry as a Unix timestamp in seconds. When
there is no period to report it must be the literal `0` — not "no traffic used",
but an instruction to hide the traffic block entirely, which is what a user
without a period should see.

`upload`/`download` are the bytes the nodes have counted for this user's peers,
summed over every node. The feed no longer asks the nodes: every fetch used to
list every inbound on every node just for these two numbers. `NodeHealthJob`
reads each healthy node's `clientStats` (`/panel/api/inbounds/list`) once a
minute into `NodeTrafficService`, an in-memory map of node → client → bytes, and
`SubscriptionPeersService.traffic` sums the user's peers from it. The numbers
are therefore up to a minute old; a node that stops answering keeps its last
counters; a node no longer available is dropped from the map; and right after a
server restart the map is empty until the first probe, so the header briefly
reads zero. `total` stays `0` — it is the traffic **quota**, and the
subscription has none.

`announce` is a banner the app shows on every fetch, and nobody writes it by
hand: `lib/announcement` derives it from what the request already knows. It
returns **one** message, because the header is one — the order is the priority.
A lapsed or missing subscription outranks everything, then the device limit, then
`hwidRequired` (INCY without a hardware id refused a slot), then a device whose
servers are still being prepared, then an expiry inside
`ANNOUNCE.expiryWarningDays`, then `hwidNudge` (an INCY install without a
hardware id that already holds a slot), then a node that has gone quiet, then a
node added inside `ANNOUNCE.freshNodeDays`. Nothing to say returns `null` and
the header is omitted rather than sent blank. The HWID rule itself is in
[devices.md](devices.md#a-device-is-what-fetches-the-subscription).

**A down node is found through `lastHealthyAt`, not `isAvailable`.** Nothing
clears `isAvailable` — provisioning is the only thing that ever writes it — so a
dead node keeps serving in the list. `node-health` stamps `lastHealthyAt` every
minute, and a stamp older than `ANNOUNCE.nodeStaleMinutes` is what "down" means here. A
node that has never reported counts as down rather than as new.

**A down node keeps the servers it already issued and issues no new ones.** A
fetch from a new device used to call the panel of every node in the list, and a
dead one held the whole response for `REQUEST_TIMEOUT_MS` per call — long
enough for an app's first import to time out — and the traffic headers asked
every node on every fetch the same way. A stale node is now skipped for issuing
(`ensureNode({ canIssue })`), and traffic comes from the cache above; the URIs a device already holds
for it are still served, so it works again the moment the node comes back.
When no node looks alive, `liveNodes` keeps them all: that means the health
probe itself is down, not every node at once, and skipping them all would leave
every new device with an empty list.

**An allowed device with no servers is told why.** When issuing failed on every
node, the device used to get an empty list and nothing else, which INCY shows as
"no servers". It now gets `ANNOUNCEMENTS.preparing`, asking for a refresh in a
minute, and the server logs a warning whenever a device is served fewer servers
than the healthy nodes offer.

The text is Russian, and only Russian: the subscription request carries no
`Accept-Language`, and INCY's User-Agent names the platform, not the locale.
Plurals and country lists go through `Intl.PluralRules` and `Intl.ListFormat`
rather than hand-rolled suffix rules.

The format is documented at <https://incy.gitbook.io/docs/docs-en> — the pages
that matter are `subscription-format` (headers, body) and `share-links`
(the exact `hysteria2://` query parameters).

## Any client, not only INCY

The feed is a standard base64 list, so Hiddify, v2rayNG, Streisand, NekoBox and
Clash Meta read it unchanged. `CLIENT_REGISTRY` in `packages/schemas/src/clients/`
is the single source: download URL, platforms, and an `import` entry where a
scheme is **documented** — `hiddify://import/<url>` takes the URL raw in the
path, `v2rayng://install-sub` and `clash://install-config` take it
percent-encoded in a query. Streisand and NekoBox publish no scheme, so they
carry `import: null` and the user pastes by hand; inventing a scheme yields a
button that opens nothing.

The server renders those into `clients` on `GET /subscription-link`
(`lib/client-links`), each with an `importUrl` — INCY's is the deep link —
and a `copyUrl`, the link to put on the clipboard: the deep link for INCY, the
plain URL for everyone else. The site's copy button and the bot's both read it. The
client only draws them — it holds icons and copy, never a URL.

**An import scheme only resolves on a touch device.** `hiddify://` and `clash://`
are registered by the mobile apps, so a desktop browser does nothing with them
and the button looks broken. The account's link steps (`LinkSteps`) offer the open-in-app button only behind
`(pointer: coarse)` and otherwise lead with copying the link — width is the wrong test,
because a tablet at any width resolves the scheme and a narrow desktop window
does not.

## Platform downloads

The INCY download links are `INCY_DOWNLOADS` in `packages/schemas`, and
`PLATFORMS` is built from it. The web client does not fetch them: `usePlatforms`
(`apps/client/entities/app/incy`) maps `PLATFORMS` straight from
`@gnomevpn/schemas`.

`GET /platforms` serves the same list for anyone else: anonymous, and cached for
a day (`PLATFORMS_CACHE_TTL_MS`) through `CacheInterceptor`, because it is a
constant rather than a query.

**The desktop URLs name a release tag, not `releases/latest`.** INCY publishes
Android and desktop builds as separate releases in one repository
(`android-v*`, `desktop-v*`), and `latest` is whichever came last. Once an
Android-only release went out, `latest/download/incy-windows-setup.exe` and the
macOS and Linux files answered 404 — every desktop download on the site was
dead. `INCY_DESKTOP_RELEASE` pins the desktop tag instead, and a test forbids
`latest` in those URLs. Moving to a newer desktop build means bumping that tag;
an old one still installs, and INCY updates itself from there.
