# Protocols and the client

Why the tunnel is Hysteria2 first, why VLESS + Reality rides beside it and
WireGuard comes as a per-device config, and why the user installs INCY rather than an app of ours. Part of the
[documentation index](../README.md).

## Why Hysteria2 leads

The project ran on VLESS + XTLS-Reality first. Measured on a Russian ISP in this
repo's history: the TSPU actively fingerprints the REALITY handshake over _any_
TCP port and kills the connection within minutes of real traffic — fresh ports
work, "burnt" ports don't, and switching donor or transport doesn't help. UDP is
not policed the same way (plain WireGuard on UDP/51820 passes on the same
network), so the tunnel moved to Hysteria2: QUIC over UDP, which the TSPU lets
through where it drops REALITY.

Hysteria2 masquerades as an HTTP/3 site (`masquerade: proxy` to `MASQUERADE_HOST`)
and needs a TLS cert on the node — a self-signed cert generated per node. The
subscription pins its SHA-256 as `pinSHA256`, read off the node at provisioning
and stored as `certFingerprint`. **`insecure=1` is not an option for an xray
core any more**: newer cores reject the parameter outright with `The feature
"allowInsecure" has been removed`, and the tunnel refuses to start. Pinning is
also stricter than what it replaces — it names one certificate rather than
accepting any. sing-box clients cannot pin, so they still get `insecure=1`; how
the feed tells the two apart is in
[subscription-feed.md](subscription-feed.md#certificates-pin-or-skip).

Each client has its own `auth` password; that password is the tunnel credential,
stored per peer.

The Reality inbound is different on both counts: it borrows a real site's
certificate rather than presenting its own, so its entries are never marked
insecure, and its credential is a UUID rather than a password.

## Two protocols, one subscription

Hysteria2 is the default: QUIC holds up under packet loss where TCP collapses,
which is what makes it good on mobile. But QUIC is UDP, and some networks —
corporate Wi-Fi, a few carriers, most hotels — drop UDP wholesale. There the
tunnel cannot come up at all.

VLESS + Reality is the way out: TCP on 443, wearing the TLS handshake of a real
third-party site. The two share port 443 without conflict because one is UDP and
the other TCP.

Both ride in the same subscription under the same server name; INCY labels each
entry with its protocol from the URI scheme, so the user picks whichever
connects and nothing has to be configured.

**This repo has measured REALITY failing before.** The TSPU fingerprinted the
handshake over any TCP port and killed sessions within minutes — that is why the
project left it in the first place. It is here as a fallback for blocked UDP, not
as a claim that it survives active probing. If it turns out dead again, the
Hysteria2 entry is still first in the list.

Which nodes advertise VLESS is decided per node by `feedProtocols` — see
[subscription-feed.md](subscription-feed.md#issuing-the-peers).

## WireGuard as a config, not as a feed entry

WireGuard is the most recognisable of the three — a fixed-size handshake with
no disguise — and Russian networks block it more than the others, mobile ones
especially. It used to ride in the subscription as a third entry per country,
after Hysteria2 and VLESS. In practice that meant a third line in INCY that
often did not connect, picked by people who did not know why it was there, and
a WireGuard key and address spent on every device that fetched the feed.

So the feed carries Hysteria2 and VLESS only (`feedProtocols`), and WireGuard is
what it is good at: a `.conf` for one device and one country, for a router or
an app that speaks nothing else, made on the account's Connect tab
(«По конфигу») or with `/wireguard` in the bot. The WireGuard peers that feed
devices were issued before this are released by `reconcile-peers`
(`releaseFeedWireguard`) in its weekly pass, once the client is not online —
see [devices.md](devices.md).

Plain WireGuard, not AmneziaWG: AmneziaVPN and the official apps read a plain
`.conf`, the 3x-ui AmneziaWG backend is young, and its parameters change with
every TSPU wave.

It was in the project once before, for the desktop client of ours, and was
removed with it (`c77dbeb`). What broke then is what this version is built
around: each config gets its own key pair and address rather than one shared
peer; the client name carries `-wg`, so it never collides with another protocol
of the same device; and the panel lists WireGuard clients with the others, so
reconcile, the device limit and expiry see them. The mechanics are in
[nodes-and-peers.md](nodes-and-peers.md#wireguard-clients).

## Why INCY and not our own client

The repo used to carry a Tauri desktop shell, a privileged Rust service on three
operating systems and an Android tunnel — around 2,500 files of platform code.
All of it is gone. The client is now INCY, a free third-party app that exists on
iOS, Android, Windows, macOS, Linux, Android TV and Apple TV.

We give it one URL. It fetches a base64 list of `hysteria2://` and `vless://` URIs, reads the traffic
counters and the renewal date out of the response headers, and renders our name,
our support link and our servers. Nothing about the tunnel changed — the nodes,
the panel and the peer model are the same.

What this bought: iOS and TV, which we never had and could not have shipped
cheaply. What it cost: the client is not ours, and the user installs an app with
someone else's name. The site says so plainly rather than hiding it — see the
`about` and `faq` namespaces in the locales.

The subscription URL is a standard format, so it also works in Hiddify, v2rayNG,
Streisand and the rest. That is deliberate: a user who dislikes INCY is not stuck.
