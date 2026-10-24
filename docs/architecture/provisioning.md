# Provisioning

Why node setup is a local SSH pipeline and how `scripts/provision` is shaped.
The step-by-step runbook is [ops/provisioning-a-node.md](../ops/provisioning-a-node.md).
Part of the [documentation index](../README.md).

## Why it stays local

Provisioning stays local because it talks to nodes over SSH with credentials
that live in `nodes.json` and `.env.nodes`, and because it is run by a human
deciding to add a node — not by a commit.

What the provision scripts share lives in `@gnomevpn/scripts`, never copied
between them: `reporter` (the `[scope] message` output), `ssh` (one `SshClient`)
and `shell` (build remote commands — `arg()` quotes untrusted values through `shell-quote`, `quiet()`
keeps stdout while `silent()` drops it, `dockerExec` quotes every argv entry
itself, so a caller passes raw values). `SshClient.connect` retries a dropped
connection but not a refused login — a wrong password fails at once instead of
three times with backoff — and `exec`/`run` take `{ command, stdin }` when a
secret has to reach the remote command without appearing in its argv.
`putFile` writes a file the same way — `cat > <path>` with the content on
stdin — so nothing is staged in a local temp file and nothing goes through
SFTP; the file gets the remote umask's mode, as before, and a caller that needs
another mode `chmod`s it.

`nodes.json` and `.env.nodes` sit at the repo root — both gitignored, both
holding secrets; `nodes.example.json` is the committed template. A value is read
back with `node:util` `parseEnv` (`readEnvValue`), the same rules as the
`--env-file` the server boots with, so a quoted value reads the same in both.

**`remote/` is one folder per thing done to the host**, not one file that grew:
`host-packages` (docker, jq, fail2ban), `firewall`, `xray-stack`, `host-cert`,
`key-files` (`ensureKeyFiles` writes a set of key files only when one is missing;
`ensureRealityKeys` and `ensureWireguardKeys` are built on it), `panel-config`,
`panel-session`, `xray-panel`, and `host-prepare`, which runs the host-level
steps (packages, firewall, the compose stack) in order.
They were a single 232-line `remote-setup.ts` holding five unrelated concerns.
`inContainer` lives with the stack that defines the container name, so a
concern needing it imports the stack rather than a shared shell helper.

**A provisioning run narrates itself, because a person watches it happen.**
Every step logs what it is about to do and what it found — `docker is already
installed`, `installing fail2ban`, `the node row was updated` — through the one
`log` in `scripts/provision/config`, a `reporter('provision')` shared by every
stage rather than passed down as a parameter. `log.step` prefixes `→` for work
starting and `log.done` indents the outcome under it, so a run reads as a tree
without anything hand-indenting its own messages. A summary at the end is not
enough: a node that takes 30 seconds on `apt-get` looks identical to one that
has hung.

**fail2ban is provisioned, not installed by hand.** Every node gets the same
`jail.d/sshd.local` — `backend = systemd`, because the nodes ship
without rsyslog and a jail reading `/var/log/auth.log` silently bans nobody.
`ensureFail2ban` is idempotent: it installs only when the binary is missing but
rewrites the jail every run, so changing a threshold in `FAIL2BAN` is a
re-provision rather than an ssh session.

## What a run does to a node

`provisionHost` is staged: `prepareHost` (docker, jq, fail2ban, firewall, the
3x-ui compose stack) → `configurePanel` (credentials, port and path, the api
token) → `rememberNodeSecrets` (the three `.env.nodes` keys) → `openPanelSession`
(wait for the api from the workstation) → `installInbounds` (cert, cert
fingerprint, Reality keys, WireGuard keys, then `syncInbounds` for the
Hysteria2, VLESS and WireGuard inbounds) → `registerNode` (the node's database
row). The secrets are written the moment the token is known, not at the end: a
run that failed after the panel rotated its token used to leave `.env.nodes`
holding the revoked one.

After the hosts, `pruneNodes` drops nodes and keys missing from `nodes.json` —
only when every host succeeded, since a failed host proves nothing about the
file being complete. `syncToProduction` runs either way, so a token rotated on
a host that failed later still reaches production; with a failed host it is
told not to delete production nodes the local database lacks
(`buildNodeSync({ pruneMissing })`). It answers
`{ status: 'synced' | 'skipped' | 'failed', message }`, and a failed sync makes
the run exit 1 just like a failed host.

## Re-running it is safe

Production nodes carry live sessions, so a re-run of an unchanged node must
change nothing a user can feel. Every restart it used to make was one too many:
a single run restarted each node's container once and its core three times.

- **The panel keeps running when it is already in place.** `x-ui setting
  -username/-password` is applied every run — the panel reads both from its
  database on each login and needs no restart. The port and the web base path
  are what need one, so `configurePanel` first waits for the panel to answer at
  `PORTS.panel` and the known path; only when it does not (a new node, or a path
  that changed) does it set them and `docker restart` the container. A node
  with no token in `.env.nodes` checks once rather than waiting out the boot
  timeout. Both waits are `p-wait-for` with a `timeout.fallback` of `false`, so
  running out of time is an answer, not an exception.
- **The inbounds are compared, not rewritten.** `syncInbounds` uses one
  `XrayClient` for the host, lists the panel's inbounds once and, per inbound,
  compares what provisioning would write with what is stored — every field
  provisioning sets, the stored JSON parsed, `clients` left out, anything the
  panel added on its own ignored (`inboundMatches`). An equal inbound is not
  touched. The core is restarted once at the end, and only when the Hysteria2 or
  the VLESS inbound was created or changed; the WireGuard inbound and its client
  deletes apply live.
- **The secrets reach production only when they changed.** `syncToProduction`
  reads the VPS's `.env.nodes` first and uploads it only when it differs —
  beside the old one, `chmod 600`'d, moved into place. Then it always runs
  `docker compose up -d --no-deps --wait server`: compose hashes the values
  loaded from `env_file` into the service config, so it recreates the container
  exactly when they changed and leaves a current one running, and `--wait` holds
  on the healthcheck. A failed run therefore needs no rollback — the file on the
  VPS is what the panels now accept, and the next run's `up -d` still sees the
  container lagging behind it and recreates it. Putting the old file back would
  have restored a token the panel had already revoked.

**The panel's api token survives a re-run.** `x-ui setting -getApiToken` mints a
new token and revokes the old one, so a run that always asked for one cut
production off every node until its server picked up the new `.env.nodes` — and
`docker compose restart` never re-reads `env_file`, so it never did: every panel
call answered 401 and the account page said the node was not responding.
`configurePanel` now keeps the token `.env.nodes` already holds when the panel
still accepts it, and `syncToProduction` applies the file with `up -d`, which
recreates the container when the token changed, so a rotated token does reach
it.

**A token is rotated only on a 401.** The check asks `inbounds/list` with the
token and reads the http status curl reports beside the body. 3x-ui v3.10.2
answers an unknown bearer token with a bare 401 (and a wrong base path with
404), so 401 is the one answer that proves the token dead. A 200 has to be the
panel's `{ success: true }` reply. Anything else — a timeout, a 5xx, a 404, a
login page — fails the host instead of rotating, because rotating on a guess
revokes the token production is using. The bearer header goes to curl on stdin
(`-H @-`), never in the command line, and the settings body for
`restartXrayOnClientDisable` goes through a file in a `mktemp -d` directory;
the setting is written only when it is not already off.

**A re-run never puts a node back into rotation.** `upsertNode` and the
production sync (`buildNodeSync`) update every field provisioning owns and
leave `is_available` alone; only a row they insert starts in rotation. Taking a
node out is the owner's decision in the admin panel, and it used to be undone by
the next run. A node is one row per host and one per country:
`node.host` and `node.country_code` are unique
(`20261026100000_drop_write_only_columns_and_indexes`, which refuses to run and
names the duplicates when the table already holds any), matching what
`nodes.json` validation already demanded and the `XRAY_KEY_<CC>` naming
assumes. The inbound's seed `auth` is generated for the Hysteria2 inbound and
no longer stored on the node row: nothing ever read it.

Remote commands are composed through `@gnomevpn/scripts/shell` rather than
written as strings — `arg()` quotes anything untrusted, and `quiet()`/`silent()`
are distinct on purpose: `quiet` hides stderr but keeps stdout, which is what
reading a remote key needs.

The node runs a **Hysteria2 inbound** (`protocol: hysteria`, `version: 2`) built in `scripts/provision/inbound/hysteria-inbound`, served by the 3x-ui panel — no separate hysteria process. It listens on **443/UDP** (QUIC); the Reality inbound takes 443/TCP. `openTunnelPort` opens both, plus the panel port (`PORTS` in `scripts/provision/config`). `ensureCert` generates a self-signed EC cert inside the container (`/etc/gnomevpn/{cert,key}.pem`); the subscription pins its SHA-256 rather than trusting it blindly — see [protocols.md](protocols.md) and [subscription-feed.md](subscription-feed.md).

Each client has its own `auth` password, generated by `generateAuth` (in
`XrayClient.createHysteriaClient` when the caller passes none) and stored as the peer's
tunnel credential in the `nodeCredential` column. `syncInbounds` **updates** an
existing inbound rather than replacing it — and only when it differs — and
`XrayInbounds.update` and `ensure` preserve the current client list so a re-provision does not
strand live sessions.

**Adding a client goes through `POST /panel/api/clients/add`, never a rewrite of
the inbound.** The old path read the whole client array, appended to it and wrote
it back, which races with itself — two connects at once and the first client is
lost. The panel's endpoint takes one client and owns that read-modify-write
itself.

The `auth` is still generated here rather than left to the panel: it mints one
when the field is omitted, but it does not return it, and the credential has to
be known to be handed to the device.

**The explicit `XrayInbounds.restartCore()` afterwards is load-bearing** — a created or
changed Hysteria2 or VLESS inbound ends in one. Client writes do not need it:
the panel applies them to the running core live — see
[nodes-and-peers.md](nodes-and-peers.md#client-changes-apply-live-only-an-inbound-needs-a-restart).

`MASQUERADE_HOST` in `scripts/provision/config` is the SNI the Hysteria2 inbound
presents, the CN of the self-signed cert, the site an HTTP/3 prober is proxied to
(`masquerade: proxy`), and also the Reality donor (`REALITY_DONOR`). It therefore
has to be a real TLS 1.3 site that the node can reach and that nobody would think
to block.

**The WireGuard inbound takes 51820/UDP** (`PORTS.wireguard`, from `WIREGUARD`
in the server's peers config so both ends agree), with a `/16` client subnet
(`10.9.0.0/16`) rather than the panel's `/24`, because every device gets an
address of its own. Its server key is seeded into `/etc/gnomevpn/wg.{key,pub}`
like the Reality keys — written only when missing, so a re-provision keeps the
key every issued config was built against; `lostWireguardKeys` warns when it
had to mint a new one, and the production sync then drops that node's
WireGuard peers (a changed `wg_public_key`, like a changed port or server name
for every peer). `lostRealityKeys` compares against the previous row's
`realityPublicKey` the same way, and `lostCert` warns when the certificate had
to be regenerated, since every Hysteria2 entry pins the old fingerprint until
its subscription refreshes. The inbound keeps the remark and port of the one the old
desktop client used, so a node that still carries that inbound gets it updated
rather than a second one fighting for the port, and `syncInbounds` then
deletes the clients that inbound still held for the old desktop sessions
(`app-` prefix, `dropLegacyWireguardClients`) — nothing issues those any more.

**Verify a node end-to-end, never by "the panel returned 200".** A Hysteria2 client written without its full field set is stored by the panel but dropped from the running core (`clients: null`), and every connection then fails auth with a 404. The only trustworthy check is to run a real hysteria client against the node and confirm a request returns the node's own IP — ideally from the target network, since the whole reason for Hysteria2 is a TSPU that treats UDP/QUIC differently from TCP.
