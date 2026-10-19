# Nodes and peers

How the server talks to a node's 3x-ui panel, how a peer becomes a panel client,
and how device limits and liveness are enforced. Code:
`apps/server/src/lib/xray/` and `apps/server/src/modules/peers/`.
Part of the [documentation index](../README.md).

## One module talks to the panel

`peers` owns everything that talks to the node's panel on a peer's behalf —
creating a client, releasing it, restarting the core, building the tunnel config.
`subscription-link` sits on top and never touches `XrayClient` directly: it
calls `PeersService.issueAndPersist`, which is where the "create → persist →
roll back on failure" dance is written once.

The only peers issued today are `kind: 'config'` peers named `incy`, one per
node and protocol, created by the subscription feed. `PeerKind` still has a
`session` value and `peerClientName` still knows its prefix, but nothing in the
server creates a session peer any more.

**The feed restarts each node once, not once per client.** `SubscriptionPeersService.ensureNode`
issues every missing peer on a node with `deferRestart`, then calls
`PeersService.restartCore` once for that node. If the restart fails it deletes
the rows it just wrote, so the next fetch issues them again rather than handing
out clients the running core has never heard of.

`XrayClient` itself is a **facade over separate concerns**, each its own folder:

```text
lib/xray/
├── panel-client/      # the 3x-ui HTTP API, and nothing above it
├── inbounds/          # find/create an inbound, shape its payload — used by every protocol
├── protocol-clients/  # list/create/delete clients of one inbound, for Hysteria2 and VLESS
├── hysteria/          # Hysteria2 clients: create, delete, enable
├── vless/             # VLESS + Reality clients, in their own inbound
├── wireguard/         # WireGuard clients: keys, addresses, re-enable by delete and add
├── serialize/         # serializeByKey: one write at a time per node
├── coalesce/          # coalesceByKey: one restart per node at a time, plus one follow-up
└── xray.ts            # the facade the rest of the server calls
```

The name is historical and misleads: `XrayClient` talks to the **3x-ui panel**,
not to Xray-core. The panel runs the core; Hysteria2 is an inbound inside it,
which is why a fix released for the standalone `apernet/hysteria` server does not
reach these nodes.

It was one 300-line class holding every protocol, and that is how a restart bug
hid in it: each inbound needs the core restarted after its own kind of change,
and with the paths interleaved one was easy to miss. Splitting by protocol makes
each rule visible where it applies.

Both protocols are ordinary panel clients, so one `deleteClient` removes either.
A peer has exactly one client name, `peerClientName`. It used to answer a second,
"pre-protocol" name too — a leftover of WireGuard, whose clients predated the
`-wg` suffix. For VLESS that second name is the Hysteria2 client of the same
device, so a VLESS client lost from a node counted as present: `restoreMissing`
never put it back, and the TCP fallback was dead for exactly the readers whose
UDP is blocked. No VLESS client was ever issued without its suffix — the panel
refused the duplicate email — so there is nothing the fallback could find.

**Every write path parses settings strictly.** `readSettings` and `readClients`
return `null` on malformed JSON, and the caller refuses rather than rewriting:
`rewriteInbound` will not update an inbound whose clients it cannot read, and
`ProtocolClients` will not add to one whose settings it cannot parse. A tolerant
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

`limitIp` is still set on every client, as `DEVICE_PEER.ipsPerClient` (2) for a
device's keys: a net against one device's config being copied elsewhere, not a
seat count. 3x-ui counts the IPs through Xray's online-stats API and has
fail2ban drop the oldest IP over the limit — it bans the address for 30 minutes,
it does not refuse the new connection.

**A restored peer gets the limit it was issued with.** `restoreMissing` recreates
a client the node has lost: a device's peer with `DEVICE_PEER.ipsPerClient`, a
shared legacy `incy` peer with its owner's `activeDeviceLimit` — which is why
`RECONCILE_PEER_SELECT` still pulls `user.subscription`. Revoked peers are never
restored; `releaseRevoked` deletes them first.

**Liveness comes from the Xray core.** `onlineEmails()` reads
`/panel/api/clients/onlines` — the sessions the core itself proxies. A node that
does not answer returns `null` rather than an empty set, which is the difference
between _unknown_ and _idle_: `collectOrphans` only reaps a client the node
positively reports as offline, never one it has no evidence about. Orphans are
collected by the weekly `reconcile-peers` pass only (see
[scheduler.md](scheduler.md)); the five-minute pass does not ask for onlines.

**The client email is scoped by protocol, and it has to be.** The database is
unique on `(userId, kind, name, nodeId, protocol)` — five fields — while the
email was built from four. One user issuing two protocols under the same name on
the same node therefore produced two rows and one email, and
`clientEnabledByEmail` merges every protocol into a single map keyed on it: one
client overwrote the other, and `syncEnabled` then disabled a live config against
the wrong client's state.

**Releasing a peer deletes the row first and the panel client afterwards.**
Deleting a client is an HTTP call to the node, so waiting for it means a slow or
unreachable panel holds up the response. `releaseDetached` removes the rows, then
fires the panel calls detached; a leaked client is collected by `collectOrphans`
on the next weekly sweep anyway, while a stuck release would be visible
immediately.

## WireGuard clients

`lib/xray/wireguard` holds them, beside `hysteria/` and `vless/`. A WireGuard
peer is an ordinary panel client of the `GnomeVPN WireGuard` inbound — email,
`privateKey`, `publicKey`, `allowedIPs`, `keepAlive` — added through the same
`/panel/api/clients/add`, and since 3x-ui v3.4.2 the panel turns those clients
into xray peers itself, so the per-client traffic, online list and deletion
work as for the other two protocols.

**The server generates the key pair; the panel picks the address.** The device
needs its private key in the URI, so `PeersService.issue` mints it
(`generateWireguardKeys`, x25519 through `@noble/curves`) and stores it as the
peer's `nodeCredential`. The address is left to the panel, which allocates the
next free one in the inbound's `10.9.0.0/16`; `WireguardClients.create` reads
it back and the peer row keeps it as `tunnel_address`, unique per node. A
restore sends both back, so a config already on a phone keeps working.
`allowedIPs` is always a single `/32` — since v3.9.0 the panel rejects
overlapping ranges, and a wider one would capture other clients' traffic.

**Adding a WireGuard client needs no core restart.** The panel applies it live
through xray's `AlterInbound`, so `ensureNode` restarts the core only when a
Hysteria2 or VLESS client was issued too; a node that only gained WireGuard
keeps its sessions. A failed restart forgets only the clients that needed it.

**Re-enabling a WireGuard client is a delete and an add, never `bulkEnable`.**
The panel's `bulkEnable` calls xray's `AddUser` without the key and the
address; for WireGuard that fails, the panel flags a restart, and its own
30-second job restarts the whole core — every Hysteria2 and VLESS session on
the node with it. `XrayClient.setClientsEnabled` therefore splits the emails:
the others go through `bulkEnable`, the WireGuard ones are deleted and added
back with the same keys and address, both of which apply live. Disabling goes
through `bulkDisable` for everyone, which removes the peer live.

Every step that only touched WireGuard clients reports that no restart is
needed: `setClientsEnabled` returns whether a non-WireGuard email changed, and
`syncEnabled`, `restoreMissing`, `releaseRevoked` and `collectOrphans` pass that
on, so reconcile and `pushEnabled` restart a node only for Hysteria2 or VLESS
work. Re-adding a client drops its traffic counter on the panel, so the usage a
device reports starts over after a renewal that had disabled it; access is not
affected.

## The panel does not restart its own core

For Hysteria2 and VLESS clients, a mutating panel endpoint ends in
`SetToNeedRestart()` and the running core does not learn about the change on
its own: the client sits in the panel's database while the core has never heard
of it, and the very first connection fails auth with a 404. Those changes need
an explicit `restartCore()`. Newer panels run a 30-second job that restarts on
that flag when an API apply failed — which is exactly what `bulkEnable` on a
WireGuard client sets off — so a flag is never something to rely on, and never
something to raise by accident. WireGuard adds and deletes are applied live and
need no restart (above).

That restart drops every live session on the node, so batch it: one restart at
the end of a pass, only when something actually changed. `reconcile-peers`
restarts once per node per pass, and the feed once per node per fetch
(`deferRestart`, above).

**Concurrent restarts of one node collapse into at most two.** Batching per
fetch was not enough: three new devices importing at once were three fetches,
three restarts back to back, and a restart that failed while another was
running made the feed forget the peers it had just issued. `restartCore` goes
through `coalesceByKey` (`lib/xray/coalesce`), keyed on the node: with nothing
running it restarts at once; every call made while a restart runs shares one
follow-up restart, which starts only after the running one ends — a client
added mid-restart may not be in the running one, so it cannot simply join it.
Every restart is logged with its reason (`reconcile synced, restored`,
`issued 2 client(s) for a new device`, …), so a node that keeps dropping
sessions shows why.

**Paying re-enables the node clients at once, not on the next sweep.**
`setEnabledAll` used to flip `peer.state` in the database only; the panel
client stayed disabled until `reconcile-peers` ran `syncEnabled`, up to five
minutes later, while the feed already served its credentials — so a reader who
had just paid got auth failures. On enable it now calls
`PeersService.pushEnabled` detached: per node, it enables only the clients the
panel still holds disabled and restarts only if there were any, so a renewal of
an account that never lapsed restarts nothing. Disabling stays with the sweep —
a few minutes of grace cost nothing, and a restart per expiry would. The sweep
is still the guarantee for both directions.
