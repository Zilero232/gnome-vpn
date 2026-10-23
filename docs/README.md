# Documentation index

Everything under `docs/`, grouped by concern. Agent-facing editing digests live separately in [.claude/rules/](../.claude/rules/) (loaded by path) and in the `CLAUDE.md` files: [root](../CLAUDE.md), [apps/client](../apps/client/CLAUDE.md), [apps/server](../apps/server/CLAUDE.md). The public overview is the [README](../README.md).

## Architecture

Design decisions — the "why" behind the code, and what has already gone wrong.

- [architecture/protocols.md](architecture/protocols.md) — why Hysteria2 leads, VLESS + Reality as the TCP fallback in the same subscription, WireGuard as a per-device config, why INCY and not our own client.
- [architecture/subscription-feed.md](architecture/subscription-feed.md) — the subscription as the product surface: routes, the token, the period gate, headers, `tlsMode` and `pinSHA256`, `no-store` and no ETag, third-party clients, the announce banner, platform downloads.
- [architecture/routing.md](architecture/routing.md) — «Российские сайты — напрямую» and ad blocking as an INCY routing profile: why INCY-only and a body line, the switches, ad blocking by a short list plus AdGuard DNS, our own trimmed geo files with `.sha256` sidecars, the `LastUpdated` rule, DNS, other apps and WireGuard.
- [architecture/devices.md](architecture/devices.md) — the device registry: HWID keys, per-device credentials, admission in the feed, revocation through reconcile.
- [architecture/nodes-and-peers.md](architecture/nodes-and-peers.md) — `XrayClient` over the 3x-ui panel, device limits, liveness, client emails, releasing peers, core restarts.
- [architecture/billing.md](architecture/billing.md) — prices and flags, webhooks, automatic renewal and its idempotence key, pending payments, declined cards, reminders, the trial, account deletion freeing the nodes.
- [architecture/referrals.md](architecture/referrals.md) — invite a friend: days both ways for the first payment, the cap, first-touch attribution through a cookie or the bot's start payload, settling inside the payment transaction.
- [architecture/promo-codes.md](architecture/promo-codes.md) — friend, campaign and gift codes: formats that cannot collide, one redemption endpoint, bonus days, the discount lifecycle, gifts issued exactly once per payment, how the owner creates codes.
- [architecture/scheduler.md](architecture/scheduler.md) — the twelve cron jobs (thirteen schedules: reconcile-peers also runs a weekly orphan pass), node health, expired access in both directions, pruning the support desk and expired sessions and codes, rebuilding the geo files, win-back touches and abandoned-checkout reminders, and the notice log that makes each of them say a thing once.
- [architecture/telegram-bot.md](architecture/telegram-bot.md) — the bot as a second door to the same account: services, account creation, linking, the webhook and its host, the keyboard, notifications and which of them are offers (gated on consent, with «Не присылать предложения» and `/offers`), the consent recorded when the bot creates an account, callback payloads, the admin chat, the support desk, owner commands (`/stats`, `/broadcast`) and operational alerts.
- [architecture/provisioning.md](architecture/provisioning.md) — why provisioning is local, `scripts/provision` and its `remote/` folders, narration, fail2ban, what a run does to a node.
- [architecture/logging.md](architecture/logging.md) — one logger and one list of secrets; a node's URL never reaches a log.
- [architecture/web-client.md](architecture/web-client.md) — the paper theme, the gnome and the WebGL scenes, the 404 routing, client message namespaces, `cacheComponents` without `use cache`, clearing the query cache on sign-in, indexed pages, structured data.
- [architecture/fsd.md](architecture/fsd.md) — Feature-Sliced Design as used by `apps/client`: layers, slices, segments, where a thing goes.
- [architecture/pitfalls.md](architecture/pitfalls.md) — things that have already bitten us.
- [architecture/legal.md](architecture/legal.md) — the public offer on `/terms`: what it covers, why it must move with the billing rules, the seller's requisites as build-time variables, where it is linked; the separate personal data consent on `/consent` and how the site collects it; the consent records (personal data and offers), their versions, where each is written, which notices are offers and the unsubscribe link; which copy is out under the VPN advertising ban.
- [architecture/status.md](architecture/status.md) — the public `/status` page: what it shows and why nothing locates a node, uptime per UTC day, the degraded rule, the "is my VPN on" check through ipify and its rate limit.
- [architecture/admin.md](architecture/admin.md) — the web admin panel on `/admin`: `ADMIN_EMAILS` plus a confirmed email, why everyone else gets an unmatched-route 404, the overview shared with `/stats`, the trend charts and why active subscriptions over time is not drawn, the user card and its actions, refunds through the webhook, promo codes, nodes, CSV exports, the `admin_action` log of every write, what is never shown.

## Guides

The style guide, split by stack. Index and tooling: [guides/README.md](guides/README.md).

- `guides/client/` — slices, `ui/` and `ui-kit`, `model/hooks`, segments, React, component body and size, styles, forms, conditional render, drill cleanup, i18n.
- `guides/server/` — [NestJS modules](guides/server/nestjs.md), [Prisma and the sweeps](guides/server/data.md).
- `guides/shared/` — naming, imports and barrels, types, functions, blank lines, readability, comments, constants and config, folders, dependencies, shared schemas, tests, forbidden list, pre-commit checklist.

## Ops

- [ops/deploy.md](ops/deploy.md) — the VPS: DNS, secrets, the server's `.env`, the Telegram bot, first run, migrations, what the deploy workflow assumes.
- [ops/backups.md](ops/backups.md) — the `backup` service, restoring a dump, moving the database to another VPS.
- [ops/provisioning-a-node.md](ops/provisioning-a-node.md) — adding a VPN node with `bun run provision:nodes` and verifying it end to end.
