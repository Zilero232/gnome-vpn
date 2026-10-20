# Provisioning a node

Adding a VPN node, step by step. Why the pipeline is shaped the way it is:
[architecture/provisioning.md](../architecture/provisioning.md). Part of the
[documentation index](../README.md).

## What it does

`bun run provision:nodes` reads `nodes.json` from the repo root (gitignored — it holds root SSH passwords; `nodes.example.json` next to it is the committed template) and sets each host up over SSH: install Docker, jq and fail2ban, open the tunnel and panel ports, ship the 3x-ui compose stack, configure the panel, generate the TLS cert, the Reality keys and the WireGuard keys, install the Hysteria2, VLESS and WireGuard inbounds, register the node. When every host succeeded it prunes nodes missing from `nodes.json`; either way it then pushes the result to production, so a token rotated on a host that failed later still gets there — with a failed host it only adds and updates production nodes, never deletes one, and the run exits 1.

It runs on a workstation, never in CI: the node credentials live in
`nodes.json` and `.env.nodes`, the production VPS credentials in the root
`.env` (`PROVISION_SSH_*`), and adding a node is a decision a person makes, not a
commit.

## Running it

1. Copy `nodes.example.json` to `nodes.json` and fill in each host, its SSH
   credentials (`sshUser`, `sshPassword`), the country, `countryCode` and city.
   A node left out of the file is **removed** on the next run, together with its
   keys.
2. Make sure the root `.env` has a `DATABASE_URL` the script can write to — the
   node rows are written there first — and `PROVISION_SSH_HOST` (plus
   `PROVISION_SSH_USER`, `PROVISION_SSH_PASSWORD` or `PROVISION_SSH_KEY`, and
   `PROVISION_DEPLOY_PATH` when it is not `/opt/gnomevpn`) pointing at the
   production VPS. Without `PROVISION_SSH_HOST` the production sync is skipped
   and the nodes exist only in the local database.
3. Run it and watch the narration — every step says what it is about to do and
   what it found, so a stuck `apt-get` is visible as one:

   ```bash
   bun run provision:nodes
   ```

4. The run writes three keys per node into **`.env.nodes`** —
   `XRAY_KEY_<CC>` (the panel's api token), `XRAY_PANEL_<CC>` (its password) and
   `XRAY_PATH_<CC>` (its random web path) — as soon as the panel hands over the
   token, before the inbounds are touched. It then writes the node rows to the
   VPS over SSH, uploads `.env.nodes` (`chmod 600`) when it differs from the
   copy already there, and runs `docker compose up -d --no-deps --wait server`,
   which **recreates** the server container when its environment changed — a
   plain restart would keep the old one. The server loads `.env.nodes` beside
   `.env`; the `node` table stores only the variable's name
   (`apiTokenEnvVar`), never the secret.

Re-running it on a node that is already set up is safe, and on an unchanged
node it drops no session: the panel container is restarted only when its port
or web path has to change, an inbound is rewritten only when it differs from
what provisioning would write (its client list is preserved either way), the
core is restarted once and only for a created or changed Hysteria2 or VLESS
inbound, the api token is kept unless the panel answers it with a 401, and the
production server is recreated only when `.env.nodes` changed. Why each of these
holds: [architecture/provisioning.md](../architecture/provisioning.md#re-running-it-is-safe).

If a node's certificate, Reality key or WireGuard key had gone missing and had
to be regenerated, the run warns: Hysteria2 entries pinned to the old
certificate fail until their subscription refreshes, and every VLESS or
WireGuard entry issued for that node before then is dead.

## Verifying it

Verify end-to-end, as [architecture/provisioning.md](../architecture/provisioning.md#what-a-run-does-to-a-node)
explains: run a real hysteria client against the node and confirm a request
returns the node's own IP, ideally from the target network. Then fetch a
subscription and check the node appears in it once per protocol — Hysteria2,
VLESS when the Reality keys were written, WireGuard when its key was — and
connect over the `wireguard://` entry too, from a phone on mobile data if you
can, since that is where WireGuard is blocked first.

A node provisioned before a field existed (`certFingerprint`,
`realityPublicKey`, `realityShortId`, `wgPublicKey`) keeps working with what it
has; re-provision it to pick the new field up. A node without `wgPublicKey`
simply offers no WireGuard entry.
