---
paths:
  - 'apps/server/src/lib/xray/**/*.ts'
  - 'apps/server/src/modules/peers/**/*.ts'
  - 'apps/server/src/modules/scheduler/**/*.ts'
  - 'scripts/provision/**/*.ts'
---

<!-- Compressed editing rules for the API, loaded automatically on edit. -->
<!-- The full reasoning is docs/architecture/nodes-and-peers.md; keep them in sync. -->

# Code style — server: the 3x-ui panel

## Client changes apply live; only an inbound needs a restart

`XrayClient` talks to the **3x-ui panel**, not to Xray-core. On v3.10.2 the
panel pushes every client add, delete and disable for Hysteria2, VLESS and
WireGuard into the running core through its gRPC API, and restarts the core by
itself only when that push fails. Never call `restartCore()` after a client
change — it drops every live session on the node. It belongs only after
provisioning created or changed an inbound. WireGuard clients are still
re-enabled by delete and add, never `bulkEnable`. A disabled Hysteria2 client
keeps a QUIC session it already has until it reconnects.

## A Hysteria2 client needs its full field set

`enable/limitIp/totalGB/expiryTime/tgId/reset` must all be present — a client
written as `{email, auth}` is stored by the panel and dropped from the running
core, so every connection fails auth. `PanelClient` spreads `CLIENT_DEFAULTS`
over every client it adds. A VLESS client also carries a `flow` field
(`INBOUND.vless.flow`, currently `''`). The client email carries the protocol, because
the database is unique on it.

## No IP limit, no server-side WireGuard keepalive

`limitIp` is always 0 (`CLIENT_DEFAULTS`) and the nodes run
`XUI_ENABLE_FAIL2BAN=false`: the panel's IP limit bans a phone's carrier-NAT
address for 30 minutes on every port, cutting off the phone and everyone behind
that address. A WireGuard client is added without `keepAlive` — on the server
it makes the core ping peers that have no endpoint and floods the log; the
`.conf` keeps `PersistentKeepalive`.
