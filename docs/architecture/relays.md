# Relays

Why a Russian VPS forwards traffic to the foreign nodes, how it is set up and
how the subscription offers it. Code: `scripts/provision/relay`,
`apps/server/src/modules/subscription-link/lib/feed-routes`. Part of the
[documentation index](../README.md).

## Why a relay

Measured on 2026-11-09 from a home MTS line (AS30881), with tcpdump on the node:
the ISP's DPI dropped the first data packet of about half the connections to
our nodes. Both nodes are HOSTKEY (AS57043).

- **TLS on TCP/443:** 13 of 24 handshakes passed, whatever the SNI (bing,
  yandex, example.com). In the failed ones the SYN and ACK reached the node and
  the ClientHello never did.
- **QUIC (Hysteria2):** 9 of 20 Initial packets arrived on 443, 13 of 20 on an
  arbitrary port. Port hopping cannot help.
- **Random UDP and plain HTTP:** 20 of 20 and 15 of 15 arrived. The filter
  looks at the protocol on these addresses, not at the address alone.
- **Through a Russian VPS:** 8 of 8 TLS and 8 of 8 QUIC handshakes, and INCY on
  a phone pinged every time on both Hysteria2 and VLESS. From the VPS itself TLS
  to the nodes passed 19 of 20.

The filtering sits at the providers that connect subscribers. A connection to a
Russian data centre is not the kind it drops, and the data centre's own uplink
abroad is not filtered the same way.

What did not work, so it is not tried again:

- **ClientHello fragmentation alone.** Splitting the ClientHello into two TLS
  records *and* several TCP segments passed 24 of 24, but either trick alone
  passed no more often than nothing. INCY's own fragmentation setting did not
  make the ping reliable.
- **Hysteria2 with Salamander.** The packets pass the filter (34 of 35 from a
  PC), and INCY reads `obfs=salamander` from the link, but INCY's ping on a phone
  still failed about half the time. It also costs the HTTP/3 masquerade.

## How a relay forwards

A relay is plain kernel NAT. Its own nftables table, `gnomevpn_relay`, holds
one DNAT rule per protocol and port — `tcp dport 9443 dnat to <node>:443`,
`udp dport 9443 dnat to <node>:443` — and a masquerade for each node, so the
node answers to the relay and the relay answers to the client. Nothing on the
relay decrypts or terminates anything; the keys, the certificate pin and the
Reality handshake are the node's, end to end. One relay port carries both
Hysteria2 (UDP) and VLESS (TCP), because the node serves both on 443.

The ruleset lives in `/etc/gnomevpn/relay.nft` and is loaded by the
`gnomevpn-relay.service` oneshot unit, so it survives a reboot. The file starts
with `table` + `delete table`, so loading it again replaces the table instead
of stacking a copy. ufw stays the filter: `deny routed` by default and one
`ufw route allow` per node and protocol to port 443, plus SSH rate-limited.
Forwarded packets never touch the INPUT chain, so the relay ports are not
opened there.

## nodes.json

`nodes.json` is an object now — `{ "nodes": [...], "relays": [...] }`. The old
bare list still reads, as nodes without relays. A relay names its SSH login
the same way a node does and lists its routes:

```json
{
  "host": "198.51.100.7",
  "sshUser": "root",
  "sshPassword": "…",
  "routes": [
    { "countryCode": "NL", "port": 8443 },
    { "countryCode": "FI", "port": 9443 }
  ]
}
```

The schema refuses a route to a country no node serves, a port used twice on
one relay, a port below 1024, a node routed by two relays (a node has one
relay), and a relay on a node's own address. A node must be addressed by IPv4:
nftables forwards to an address.

## Provisioning and the database

`bun run provision:nodes` sets the relays up after the nodes: SSH locked to the
key, ufw, fail2ban, nftables, the base tuning shared with the nodes (without the
Docker step — a relay runs no containers), `net.ipv4.ip_forward`, the ruleset
and the unit. `nft -c` checks the file before the unit loads it.

The node row carries `relay_host` and `relay_port`. After the relays run,
`assignRelays` writes them for every node: a routed node gets its relay, a node
no relay routes any more is cleared, and a node whose relay **failed** is left
as it was. A half-set-up relay is never advertised, and a working one is not
dropped because one run failed. The production sync carries both columns. A
relay change never revokes a peer: the keys are the node's and stay the same.

**A relay is left alone when a node failed.** The relays run only after every
node provisioned. On 2026-11-10 two new nodes failed on fail2ban, the relay was
re-pointed at them anyway, and every user dialling the relay reached a node that
held none of their keys until the relay was put back by hand.

## In the subscription

`feedRoutes` gives each node one route. A node with a relay is served **only**
through the relay; a node without one, directly. The name is the same either
way, so the user never has to choose between two entries of one country. The
peer is the node's, so a relay costs no extra keys and no extra device slot.

A direct fallback beside the relay entry was built first and dropped: the
networks that need the relay are the ones where the direct entry fails half the
time, and two identical countries in the list only made people pick.

`buildTunnelConfig` takes the relay as an `endpoint` that replaces only the
address and port. VLESS would otherwise always dial `REALITY.listenPort`.

## Risks

- **The relay sits in Russia, and its nodes have no other entry.** If Roskomnadzor
  finds it, or the hoster closes the account, every node it routes is gone from
  the subscription's working list. The way back is a run: remove the relay (or
  point the routes at a new one) in `nodes.json` and run provisioning; the nodes
  are served directly, or through the new relay, on the next feed fetch.
- **Never on the production VPS.** The site, the bot and the subscription live
  there; a block of a relay address must not take them down. Keep relays on a
  separate hosting account too, since a hoster may close the whole account.
- **Hosting rules.** Several Russian hosts forbid public VPN and proxy servers
  (Beget, RUVDS, NTX). Aeza was ordered in December 2025 to remove VPN servers
  from one of its subnets. The draft "Antifraud 3.0" would bar Russian hosting
  for VPN owners from March 2028; if it passes, a Russian relay stops being an
  option.
- **The relay is probed every minute, and a dead one is bypassed.**
  `node-health` measures every node's loss through its relay as well as
  directly (kept per minute in `node_probe`), stamps `relay_healthy_at` while under
  `NODE_LOSS.relayDownPercent`, and alerts `alertRelayLoss` after the usual
  three-minute streak. Once the relay has failed for `RELAY_DOWN.staleMinutes`,
  `feedRoutes` serves the node directly until it passes again; a relay never
  probed yet counts as live, so a deploy does not drop them all. Two limits: the
  probe runs from the production VPS, so it sees a relay that is down, not one a
  single ISP blocks; and an app picks the direct entry up only when it next
  refreshes the subscription.
