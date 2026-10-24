# Nodes and peers

How the server talks to a node's 3x-ui panel, how a peer becomes a panel client,
and how device limits and liveness are enforced. Code:
`apps/server/src/lib/xray/` and `apps/server/src/modules/peers/`.
Part of the [documentation index](../README.md).

## One module talks to the panel

`peers` owns everything that talks to the node's panel on a peer's behalf —
creating a client, releasing it, building the tunnel config.
`subscription-link` sits on top and never touches `XrayClient` directly: it
calls `PeersService.issueAndPersist`, which is where the "create → persist →
roll back on failure" dance is written once.

The only peers issued today are `kind: 'config'` peers named
`devicePeerName(deviceId)` (`d-<12 hex>`), one per device, node and protocol:
the subscription feed issues the Hysteria2 and VLESS ones, and
`WireguardConfigService` the WireGuard one for a config's own `wg:` device
([devices.md](devices.md)). The shared `incy` peer of the days before the device
registry (`LEGACY_PEER`) is only ever retired now. `PeerKind` still has a
`session` value and `peerClientName` still knows its prefix, but nothing in the
server creates a session peer any more.

**Issuing a peer restarts nothing.** `SubscriptionPeersService.ensureNode`
issues every missing peer on a node and is done: the panel pushes each new
client into the running core itself (below), so no other session on the node is
touched.

`lib/xray` splits by who calls it and by protocol:

```text
lib/xray/
├── xray.ts              # XrayClient — what the server does to a node's clients: issue, delete, enable, read state and health
├── xray-inbounds.ts     # XrayInbounds — what provisioning does to a node: create, update or ensure an inbound, restart the core
├── panel-client.ts      # the 3x-ui HTTP API, every answer parsed with zod, and nothing above it
├── protocol-clients.ts  # Hysteria2 and VLESS clients of one inbound: list and create, one instance per protocol
├── wireguard-clients.ts # WireGuard clients: keys, addresses, re-enable by delete and add
├── key-lock.ts          # serializeByKey (one write at a time per node) and coalesceByKey (one core restart at a time)
├── node-access.ts       # xrayClientForNode and the node selects it needs
├── xray.schemas.ts      # what the panel answers, as zod schemas
└── xray.{types,constants,helpers}.ts
```

Hysteria2 and VLESS differ only in the inbound they live in, the field that
holds the credential (`auth` or `id`) and the fields a new client carries, so
they are two `ProtocolClients` instances configured side by side in the
`XrayClient` constructor rather than two pass-through classes. `XrayInbounds` is
the provisioning half: the server never creates an inbound or restarts a core,
so `XrayClient` has no method that could.

The name is historical and misleads: `XrayClient` talks to the **3x-ui panel**,
not to Xray-core. The panel runs the core; Hysteria2 is an inbound inside it,
which is why a fix released for the standalone `apernet/hysteria` server does not
reach these nodes.

It was one 300-line class holding every protocol, and the rules that differ by
protocol (WireGuard's re-enable by delete and add, below) were easy to miss with
the paths interleaved. Splitting by protocol makes each rule visible where it
applies.

Every protocol's clients are ordinary panel clients, deleted by email, so one
`XrayClient.deleteClient` removes any of them.
A peer has exactly one client name, `peerClientName`. It used to answer a second,
"pre-protocol" name too — a leftover of WireGuard, whose clients predated the
`-wg` suffix. For VLESS that second name is the Hysteria2 client of the same
device, so a VLESS client lost from a node counted as present: `restoreMissing`
never put it back, and the TCP fallback was dead for exactly the readers whose
UDP is blocked. No VLESS client was ever issued without its suffix — the panel
refused the duplicate email — so there is nothing the fallback could find.

**Every write path parses settings strictly.** `readSettings` and `readClients`
return `null` on malformed JSON, and the caller refuses rather than rewriting:
`XrayInbounds` will not rewrite an inbound whose clients it cannot read, and
`ProtocolClients` and `WireguardClients` will not read one whose settings they
cannot parse. Both parse with zod: the inbound settings as a loose object, so a
rewrite carries every client field the panel stored back untouched, and each
client against its protocol's schema. `PanelClient` parses every answer the same
way and throws `NODE_UNAVAILABLE` on a shape it does not expect, rather than
casting it. A tolerant
parse is what once erased a node's clients: it produced an empty settings object,
which was then written back over the real one.

## Device limits

A subscription covers `DEFAULT_DEVICE_LIMIT` (2) devices, plus whatever
`extraDevices` the user has bought; `activeDeviceLimit` in `common/lib/period`
is the one place that reads it off a subscription, and it returns the default
whenever the period has lapsed. **The limit is enforced by the device registry,
not by the panel** — each device fetching the feed is registered and issued keys
of its own, and a device past the limit is refused in the feed. The whole
mechanism, and why the panel's per-client `limitIp` could not do it, is in
[devices.md](devices.md).

`limitIp` is still set on every client, from `deviceIpLimit`: 2
(`DEVICE_PEER.ipsPerClient`) for a device with a hardware id or a WireGuard
config, 1 (`ipsPerKeylessClient`) for an app that sends none — every install of
such an app on the account shares the keys, so one network at a time is all one
"device" gets. It is a net against a config being copied elsewhere, not a seat
count. 3x-ui counts the IPs through Xray's online-stats API — no access log is
involved since v3.x, the panel says so at boot (`using connection-based onlines
and access-log-free IP limit`), and the generated core config carries
`"access": "none"` — and has fail2ban drop the oldest IP over the limit, which
needs `XUI_ENABLE_FAIL2BAN=true` (`infra/xray/docker-compose.yml` sets it). It
bans the address for 30 minutes; it does not refuse the new connection. A limit
is written when a client is created, so existing keyless-app clients keep the 2
they were issued with until they are issued again.

**A restored peer gets the limit it was issued with.** `restoreMissing` recreates
a client the node has lost: a device's peer with `deviceIpLimit` of its device
key (`RECONCILE_PEER_SELECT` pulls `device.key`), a shared legacy `incy` peer
with its owner's `activeDeviceLimit` — which is why it still pulls
`user.subscription`. Revoked peers are never restored; `releaseRevoked` deletes
them first.

**Liveness comes from the Xray core.** `onlineEmails()` reads
`/panel/api/clients/onlines` — the sessions the core itself proxies. A node that
does not answer returns `null` rather than an empty set, which is the difference
between _unknown_ and _idle_: `collectOrphans` only reaps a client the node
positively reports as offline, never one it has no evidence about. Orphans are
collected by the weekly `reconcile-peers` pass only (see
[scheduler.md](scheduler.md)); the five-minute pass does not ask for onlines.

**An orphan is any server-named client with no row, owner or not.** It used to
be only a client whose owner was gone from the database, so a client leaked by
a detached release, a failed persist or a node-sync change sat on the node for
good as long as its owner had an account. `collectOrphans` now deletes every
client whose name carries a server prefix and an owner id, that the node
reports offline and that no peer row names. The pass's snapshot of the rows may
be minutes old, so it re-reads the node's rows right before deleting and spares
any client a row now names — a peer the feed issued meanwhile. A client with a
row is never touched, and neither is one that is online.

**The client email is scoped by protocol, and it has to be.** The database is
unique on `(userId, kind, name, nodeId, protocol)` — five fields — while the
email was built from four. One user issuing two protocols under the same name on
the same node therefore produced two rows and one email, and
`clientEnabledByEmail` merges every protocol into a single map keyed on it: one
client overwrote the other, and `syncEnabled` then disabled a live config against
the wrong client's state.

**A revoked peer is re-read before its client is deleted.** `releaseRevoked`
works from the pass's snapshot, and the feed may have issued the same peer again
since (a device past a shrunken limit that got its place back, a node-sync
revocation): the upsert clears `revokedAt` and re-enables the panel client. The
release now re-reads `revokedAt` for its candidates and deletes only the clients
whose rows are still revoked, so it does not delete a key the feed has just
handed out. The window that remains — between the panel add and the row write —
is milliseconds, and `restoreMissing` puts such a client back on the next pass.

**Releasing a peer deletes the row first and the panel client afterwards.**
Deleting a client is an HTTP call to the node, so waiting for it means a slow or
unreachable panel holds up the response. `releaseDetached` removes the rows, then
fires the panel calls detached; a leaked client is collected by `collectOrphans`
on the next weekly sweep anyway, while a stuck release would be visible
immediately.

## WireGuard clients

`lib/xray/wireguard-clients.ts` holds them. A WireGuard
peer is an ordinary panel client of the `GnomeVPN WireGuard` inbound — email,
`privateKey`, `publicKey`, `allowedIPs`, `keepAlive` — added through the same
`/panel/api/clients/add`, and since 3x-ui v3.4.2 the panel turns those clients
into xray peers itself, so the per-client traffic, online list and deletion
work as for the other two protocols.

**The server generates the key pair; the panel picks the address.** The device
needs its private key in the `.conf`, so `PeersService.issue` mints it
(`generateWireguardKeys` in `peers/lib/x25519-keys`, which also mints the
Reality pair — x25519 through `@noble/curves`, standard base64 for WireGuard and
base64url for Reality) and stores it as the
peer's `nodeCredential`. The address is left to the panel, which allocates the
next free one in the inbound's `10.9.0.0/16`; `WireguardClients.create` reads
it back and the peer row keeps it as `tunnel_address`, unique per node. A
restore sends both back, so a config already on a phone keeps working.
`allowedIPs` is always a single `/32` — since v3.9.0 the panel rejects
overlapping ranges, and a wider one would capture other clients' traffic.

**Adding a WireGuard client needs no core restart**, like every other client
(below). The panel applies it live through xray's `AlterInbound`.

**Re-enabling a WireGuard client is a delete and an add, never `bulkEnable`.**
The panel's `bulkEnable` calls xray's `AddUser` without the key and the
address; for WireGuard that fails, the panel flags a restart, and its own
30-second job restarts the whole core — every Hysteria2 and VLESS session on
the node with it. `XrayClient.setClientsEnabled` therefore splits the emails:
the others go through `bulkEnable`, the WireGuard ones are deleted and added
back with the same keys and address, both of which apply live. Disabling goes
through `bulkDisable` for everyone, which removes the peer live.

Re-adding a client drops its traffic counter on the panel, so the usage a
device reports starts over after a renewal that had disabled it; access is not
affected.

## Client changes apply live; only an inbound needs a restart

**3x-ui v3.10.2 pushes every client change into the running core.**
`/panel/api/clients/add` ends in xray's `AlterInbound` → `AddUser`, and the
panel's `buildUserAccount` has a case for `hysteria`, `vless` and `wireguard`
alike; `del`, `bulkDisable` and `bulkEnable` go through `RemoveUser`/`AddUser`
the same way. A delete or disable restarts the core only when
`restartXrayOnClientDisable` is on, and provisioning turns it off. The panel
flags `needRestart` only when an API apply fails, and its own 30-second job
then restarts — so a flag is never something to rely on, and never something to
raise by accident (`bulkEnable` on a WireGuard client does exactly that, above).

The server therefore restarts nothing for a client: not after issuing peers in
the feed, not in `pushEnabled`, not after reconcile released, retired,
restored, synced or collected clients — each of those used to drop every tunnel
on the node, several times a day. Reconcile logs what it changed per node
instead (`reconciled node …: released 1, restored 2`). `XrayInbounds.restartCore`
is left for provisioning, after it creates or changes a Hysteria2 or VLESS
**inbound**; it is coalesced per node (`coalesceByKey`) and logs its reason.

This was proved against the image the nodes run, `ghcr.io/mhsanaei/3x-ui:v3.10.2`
(Xray 26.10.10), before the restarts were removed. A local container was set up
the way provisioning does it — `restartXrayOnClientDisable` off, then
`syncInbounds` with the real `buildHysteriaInbound` (UDP/443, self-signed
certificate), `buildRealityInbound` (gRPC) and `buildWireguardInbound`, which
restarts once for the new inbounds. Then, with the core's PID recorded:

- Hysteria2, VLESS and WireGuard clients were added through `XrayClient` with
  no restart; xray clients in sibling containers (`hysteria` outbound pinned
  with `pinnedPeerCertSha256`, `vless` + Reality gRPC, `wireguard`) behind a
  socks inbound fetched a page through each at once (HTTP 200, all three in the
  panel's online list), and a client with a wrong password or UUID was refused;
- deleting the Hysteria2 client and disabling the VLESS and WireGuard ones
  refused every new connection, still without a restart. The VLESS and
  WireGuard tunnels already up stopped carrying traffic at once; a Hysteria2
  QUIC connection authenticated before the delete kept carrying new requests
  until the client reconnected — the session survives, a new one is refused;
- re-enabling (VLESS through `bulkEnable`, WireGuard by delete and add) and
  re-adding a disabled Hysteria2 client through `create` worked again live;
- the core's PID never changed across twenty minutes of this, through many
  ticks of the panel's 30-second restart job, and the panel logged no start
  after the inbound one.

**Paying re-enables the node clients at once, not on the next sweep.**
`setEnabledAll` used to flip `peer.state` in the database only; the panel
client stayed disabled until `reconcile-peers` ran `syncEnabled`, up to five
minutes later, while the feed already served its credentials — so a reader who
had just paid got auth failures. On enable it now calls
`PeersService.pushEnabled` detached: per node, it enables only the clients the
panel still holds disabled. Disabling stays with the sweep — a few minutes of
grace cost nothing. The sweep is still the guarantee for both directions.
