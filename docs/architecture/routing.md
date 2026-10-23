# Routing: Russian sites direct, ads blocked

Without routing, every connection of a link-based client leaves through a node
in the Netherlands or Finland, so Russian banks, Gosuslugi and marketplaces see a
foreign address and refuse, ask for a captcha, or lock the account. INCY can take
a routing profile with the subscription, and the feed sends one. Code, all under
`apps/server/src/modules/subscription-link/`: `lib/incy-routing/` (the profile),
`services/routing-settings.service.ts` (the switches), `lib/geo-list/`,
`services/geo-files.service.ts` and `geo-files.controller.ts` (the geo files we
serve); `apps/client/features/vpn/routing-settings/` is the card. Part of the
[documentation index](../README.md); the feed itself is
[subscription-feed.md](subscription-feed.md).

## Two switches, stored on the link

| Switch     | Default | What it does                                                  |
| ---------- | ------- | ------------------------------------------------------------- |
| `ruDirect` | on      | Russian domains and Russian addresses bypass the tunnel       |
| `blockAds` | off     | ad and tracking domains are dropped before they leave the app |

They are columns of `subscription_link` (`ru_direct`, `block_ads`, and
`routing_updated_at`, null until the first change), not a table of their own:
the feed already reads that row by token in the one query it makes, rotation
updates the row in place so the settings survive a new token, and no relation is
added to `User`. The defaults are the column defaults and live nowhere else.

`GET /subscription-link/routing` and `PATCH /subscription-link/routing` (session)
read and change them, with `routingSettingsSchema` and the partial
`updateRoutingSettingsSchema` from `@gnomevpn/schemas`. Both upsert the link row,
exactly like `GET /subscription-link`, so a user who opens the card before the
link exists still reads the column defaults. A PATCH that changes nothing does not
touch `routing_updated_at`, because that timestamp is what makes INCY take the
profile again (see below).

The account card (`RoutingCard`, under «По ссылке» on the «Подключение» tab)
updates optimistically and rolls back with an error toast; it invalidates only
after the last of several quick toggles has settled.

## INCY only, and only in the body

The profile travels as one more line of the base64 body, after the server URIs:

| `ruDirect` | `blockAds` | Line                                                           |
| ---------- | ---------- | -------------------------------------------------------------- |
| on         | off        | `incy://routing/onadd/<base64>` — direct lists, no block list  |
| on         | on         | `incy://routing/onadd/<base64>` — direct lists and block list  |
| off        | on         | `incy://routing/onadd/<base64>` — block list, no direct lists  |
| off        | off        | `incy://routing/off` — routing disabled, the profile kept      |

**Only INCY gets it.** `incyRouting` checks `identity.app === DEVICE_KEY.incyApp`,
the same `^INCY/<version>/<platform>` User-Agent match the device registry
already uses (`INCY/2.5.1/ios CFNetwork/…`). Any other client would read an
`incy://` line as a server it cannot parse.

**Not the `routing` header.** INCY reads one, but Happ reads a header of the same
name in its own format (3x-ui #6062, #6273), and a header cannot be aimed at one
app the way a body line gated on the User-Agent can. INCY's autorouting page
documents the precedence: the `autorouting` header, then a body line with a URL,
then the `routing` header, then a body line with base64 — we send only the last,
so nothing outranks it.

**`onadd`, not `add`.** `incy://routing/off` disables routing but keeps the stored
profile, and INCY's docs name `onadd` as the way back. `add` would also wait for
the geo files before activating a first profile.

**Only to an admitted device.** A device over the limit, a keyless INCY refused a
slot, or an account without an active period gets no servers and no profile —
there is no reason to start a geo download on a device that cannot connect.

The switches in the account are the source of truth: with both off, every refresh
sends `off` again, so turning routing back on inside INCY lasts until the next
fetch.

## The profile

`routingProfile` builds it; every field is a string except `useChunkFiles`:

- `Name: "GnomeVPN"` for every combination. INCY updates a profile with the same
  name instead of adding another, so turning ads on does not leave two profiles.
- `GlobalProxy: "true"`: whatever no rule matches goes through the tunnel.
- `DirectSites`: always `geosite:private`; with «Российские сайты — напрямую» also
  `domain:ru`, `domain:su`, `domain:xn--p1ai` (`.рф` — Xray sees the punycode),
  `geosite:category-ru`, `geosite:category-gov-ru`.
- `DirectIp`: always `geoip:private`; with the switch also `geoip:ru`. The local
  network goes direct in every profile (`ROUTING_RULES.local`), including the
  ads-only one: a router page, a printer or casting to a TV must never be sent
  into the tunnel just because the reader turned Russian sites off.
- `BlockSites`: `geosite:category-ads`.
- `Geositeurl`, `Geoipurl`: our own trimmed files, `${API_URL}/routing/geo/…` (below).
- `DomainStrategy: "IPIfNonMatch"`: a name no domain rule matches is resolved and
  checked against `geoip:ru`, which catches Russian services on `.com` and `.net`
  that no list names.
- `useChunkFiles: false`. The flag makes Android and iOS cut the downloaded files
  down to the tags the rules use; ours already hold nothing else, so the cut
  would only burn CPU on a file that cannot get smaller (desktop ignores the flag
  anyway).
- **Every list is always sent**, empty when its switch is off. An update that
  turned `ruDirect` off by omitting the lists would rely on INCY replacing rather
  than merging fields, which its docs do not say.

**`domain:` entries, never bare strings.** In Xray `domain:ru` matches `ru` and
every subdomain; a bare `ru` is a substring match and would send
`truecaller.com` direct. INCY's docs mention categories, plain domains and CIDRs
and say nothing about prefixes; the lists go into Xray rules verbatim — 3x-ui's
reimplementation of this profile format (`internal/sub/json_routing.go`) copies
them unchanged into `domain` and `ip`, community INCY profiles use `domain:`
entries, and Loyalsoldier's own `category-ru` carries `domain:ru`, `domain:su`
and `domain:xn--p1ai`. A test forbids a bare entry. The three suffix rules repeat
what `category-ru` holds on purpose: they work from the profile alone.

**The rule order is INCY's.** The profile format names no order, and 3x-ui's copy
of it evaluates block, then direct, then proxy. That is why nothing goes in
`ProxySites`: a blocked `.ru` site would need a proxy rule that outranks the direct
one, and nothing documents that it would.

## Ad blocking: a short list plus a filtering resolver

With `blockAds` on, two things change:

- `BlockSites` is `geosite:category-ads` — 844 entries — not `category-ads-all`.
  The big list is about 200 000 domains, and Xray holds every rule it loads in
  memory. On iOS the tunnel runs inside a network extension with a hard memory
  budget, and a list that size is the classic way to get the extension killed —
  the VPN silently drops. The short list covers the big ad networks by domain.
- The **remote** resolver — the one for names that go through the tunnel — is
  AdGuard DNS (`https://dns.adguard-dns.com/dns-query`, pinned in `DnsHosts` to
  `94.140.14.14`, one of the two addresses AdGuard publishes and the host resolves
  to). It answers ad and tracker names with nothing, so the long tail is blocked
  where it costs no memory on the phone. Without `blockAds` the remote resolver
  stays Cloudflare.

The **domestic** resolver does not change. Russian names keep resolving at
Yandex directly from the device, so they never depend on a foreign resolver being
reachable from a Russian network. Both remote resolvers (`1.1.1.1`,
`94.140.14.14`) were checked to be outside `geoip:ru`, so their queries leave
through the tunnel; `77.88.8.8` is inside it and goes direct.

AdGuard DNS sees the names a user looks up through the tunnel, from the node's
address, only while ad blocking is on — the privacy page says so, next to the
default resolvers.

## Our own geo files

INCY downloads `Geositeurl` and `Geoipurl` itself. Pointing them at Loyalsoldier's
releases meant about 28 MB per device — 11.4 MB of geosite, 16.6 MB of geoip — on
the first import, on every `LastUpdated` bump, and on every scheduled check,
because Loyalsoldier publishes `.sha256sum` files and INCY looks for `.sha256`.
At `routing-geo-update-interval: 24` that was 28 MB per device per day.

So the server serves its own:

| Route                                    | Body                                                     |
| ---------------------------------------- | -------------------------------------------------------- |
| `GET /routing/geo/geosite.dat`           | upstream geosite, cut to the tags the profile names      |
| `GET /routing/geo/geosite.dat.sha256`    | the file's SHA-256 as 64 lowercase hex digits, no newline |
| `GET /routing/geo/geoip.dat`             | upstream geoip, cut the same way                         |
| `GET /routing/geo/geoip.dat.sha256`      | its SHA-256                                              |

Measured against release `202610222206`: geosite 11 381 894 B → **56 924 B**
(`category-ru` 1161, `category-gov-ru` 145, `private` 133, `category-ads` 844
entries), geoip 16 569 543 B → **397 238 B** (`ru` 25 107, `private` 18 networks).
About 454 KB instead of 28 MB, 1.6 % of the old download. Cutting both takes
about 10 ms.

**The sidecar.** Before every download — first import, `LastUpdated` bump,
manual or scheduled refresh — INCY fetches `<file URL>.sha256`, and if the hash
matches the file it already has, it skips the download. Its docs specify the
body as only the 64-character hex digest; we send the bare lowercase digest
with no trailing newline. The daily check therefore costs two ~64-byte requests
until the files actually change, and then about half a megabyte.

**How a file is cut.** `trimGeoList` reads the protobuf without decoding it:
`GeoSiteList` and `GeoIPList` are `repeated entry = 1`, and an entry's
`country_code` is its field 1. It walks the records with `BinaryReader` from
`@bufbuild/protobuf/wire` — tags, lengths and skips, no schema. A top-level
record whose code is wanted is copied byte for byte; everything else is
dropped, and nothing is re-encoded. A file cut short or malformed throws
(`premature EOF`, an illegal tag), so a truncated download fails the build
instead of shipping half an entry. Upstream
stores codes upper-case while profiles name tags in lower case and Xray finds
them regardless, so the match ignores case too. The wanted tags come from `routingGeoTags()`, derived from the
profile's own rule lists, so a tag added to a rule is in the next build without
a second edit. If upstream lacks a wanted tag, the build fails rather than ship a
file a rule cannot load. INCY's own `useChunkFiles` produces exactly this kind of
file on the phone, which is the evidence that INCY runs fine on a geo file that
holds only the profile's tags.

**Building and refreshing.** `GeoFilesService` keeps the last good pair in
memory. The first request builds it (concurrent requests share the one build);
`GeoFilesJob` rebuilds it weekly (`SCHEDULE.geoFilesCron`, Mondays at 03:43 server time). A failed
build keeps the previous pair and logs a warning. Upstream fetches carry a
three-minute `AbortSignal.timeout`, because the upstream files are tens of
megabytes. When nothing has ever been built — the first fetch after a deploy
failed — the route answers `503 GEO_FILES_UNAVAILABLE` and INCY retries on its
own backoff; the server does not try upstream again for
`GEO_FILES.retryCooldownMs` (10 minutes), so a crowd of clients cannot turn into
a crowd of 28 MB downloads. Nothing is stored on disk: a restart rebuilds on the
first request.

**Headers.** `.dat` is `application/octet-stream`, `.sha256` is
`text/plain; charset=utf-8`. Both are `cache-control: no-cache` with an `ETag` of
the file's hash and `Last-Modified` of the build, so a client cache revalidates
(a `304`) rather than holding a file whose sidecar has moved on — INCY fails an
update whose file does not match its sidecar. The route is anonymous (INCY
downloads without a session) and stays under the global throttle.

Changing the source is `GEO_FILES.upstream`; the files are verified tag by tag
on every build, so a source missing a tag fails loudly instead of serving a
broken file.

## `LastUpdated`

INCY replaces a stored profile only when `LastUpdated` is greater than the stored
one, and a newer profile also makes it fetch the geo files again — now a
sidecar check and, at most, half a megabyte. The number moves only when the
content does, and it must move for **either** kind of change:

```text
LastUpdated = ROUTING_PROFILE.revision + max(0, routing_updated_at − ROUTING_PROFILE.epoch)   (unix seconds)
```

`ROUTING_PROFILE.revision` is the unix time of the last change to the rules, the
DNS or the URLs — bump it by hand in the same commit (it was bumped when the geo
URLs moved to our own server); `epoch` is fixed, from before the first toggle
was possible. A sum grows when either side grows. The first version took
`max(revision, routing_updated_at)`, which lost one of them: a reader who
toggled after the rules were written but before the deploy kept a value above
the new revision and never received the new rules, and a revision set in the
future swallowed every toggle until it passed. The sum stays far below 2³¹ for
decades, which a test pins.

`routing_updated_at` moves only when a PATCH changes a value, and always by at
least a whole second (`nextRoutingStamp`), so two toggles inside one second
still give INCY a larger number. A PATCH writes only the fields it carries:
reading both switches and writing both back lost the first of two quick
toggles. The request time, a renewal or a rotated token never move the value,
and a test pins that it does not follow the clock. `off` carries no profile and
so no `LastUpdated`.

## The daily geo check

With a profile the feed also sends `routing-geo-update-interval: 24`, and INCY
rechecks the files once a day. With the sidecar that check is two tiny requests
until the weekly rebuild changes a hash. With `off` the header is not sent —
INCY reads an absent value as no periodic checks.

## DNS

- **Remote** (names that go through the tunnel): DoH to Cloudflare,
  `https://cloudflare-dns.com/dns-query` pinned to `1.1.1.1` in `DnsHosts` so the
  resolver needs no lookup of its own — or AdGuard DNS while ad blocking is on.
  The queries leave through the tunnel, so the provider sees none of them, and
  the answers are European — which keeps the Russian nodes of foreign CDNs
  (Google's caches inside Russian networks, for one) out of `geoip:ru` under
  `IPIfNonMatch`.
- **Domestic** (names that go direct): plain DNS to Yandex, `77.88.8.8`, in every
  combination. Only direct names are resolved there, and their connection goes
  direct anyway, so an encrypted lookup would hide nothing the provider does not
  already see in the TLS handshake. A Russian resolver hands back the Russian
  nodes of Yandex, VK and the marketplaces, and plain UDP needs no bootstrap.
- `FakeDNS: "false"`: the rules see real addresses, as in INCY's own example
  profile.

## Other apps and WireGuard

Hiddify, v2rayNG, Streisand, NekoBox and Clash get the plain server list and no
profile. Each has its own region or "Russia direct" setting, and the account card
and the FAQ send the user there rather than pretending the switches reach them.

A WireGuard config routes everything: `AllowedIPs = 0.0.0.0/0, ::/0`. Leaving
Russia out would mean the complement of 25 000 networks written into every
`.conf`, which routers and phone apps handle badly; apps such as AmneziaVPN offer
split tunnelling by site on their own side.
