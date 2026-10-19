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

## The panel does not restart its own core

`XrayClient` talks to the **3x-ui panel**, not to Xray-core. A Hysteria2 or
VLESS client change needs an explicit `restartCore()`, or the running core never
learns about it. WireGuard clients are applied live and need none — and must be
re-enabled by delete and add, never `bulkEnable`, which makes the panel restart
the whole core.

That restart drops every live session on the node, so batch it: one restart at
the end of a pass, only when a non-WireGuard client actually changed.
`restartCore` is coalesced per node and takes a reason that is logged.

## A Hysteria2 client needs its full field set

`enable/limitIp/totalGB/expiryTime/tgId/reset` must all be present — a client
written as `{email, auth}` is stored by the panel and dropped from the running
core, so every connection fails auth. `PanelClient` spreads `CLIENT_DEFAULTS`
over every client it adds. A VLESS client also carries a `flow` field
(`VLESS_FLOW`, currently `''`). The client email carries the protocol, because
the database is unique on it.
