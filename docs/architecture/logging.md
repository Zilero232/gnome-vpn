# Logging

One logger for the whole monorepo, and what must never reach it. Part of the
[documentation index](../README.md).

## One logger, one list of secrets

`@gnomevpn/logger` holds the only `pino()` call in the repo. The server, the web
app and the provision scripts each pass a service name and get a child logger —
nobody configures levels, redaction or transport a second time.

That matters because of `REDACTED_PATHS`. A panel password, a subscription
token and a peer's tunnel credential all pass through this monorepo, and a
second logger configured elsewhere is a second list to keep in sync — which is
how one of them ends up in a log that gets pasted into an issue.

Output is pretty by default and JSON in production; `LOG_FORMAT=json` forces it
either way, which is what the reporter's tests read. A script keeps its
`[scope] message` shape through `pretty.messageFormat` rather than by writing to
`console` — the shape is a display concern, the fields are the data.

## A node's URL is a secret, so logs name the node instead

`node.apiUrl` embeds the 3x-ui panel's random web path — the only thing between
the public panel port and its login page. `REDACTED_PATHS` strips object keys,
which cannot help once the URL is interpolated into a message string, and
`node-health` writes one every minute. Log lines name `node.id` (or the bare
host for `XrayClient`, which has nothing else), never the URL.

## The edge's access log is masked, and the feed is not in it

The privacy policy says no traffic is logged, and the subscription token must
never reach a log. Caddy's access log used to break both: it wrote the full
client IP, every header and the full URI of every request — including
`GET /sub/<token>` on each INCY refresh, which is the token itself and, over
time, a history of each subscriber's addresses. So `infra/caddy/Caddyfile`
now:

- **skips** the requests that would build that history: `/sub/*` (the feed),
  `/routing/geo/*` (the geo files every refresh fetches) and
  `/auth/reset-password/*` (a reset token in the path) — `log_skip` on a path
  matcher, which needs Caddy 2.8 or later (the image is `caddy:2-alpine`);
- **masks** the client address in the rest through a `format filter` wrapping
  `console`: `request>remote_ip` and `request>client_ip` go through `ip_mask`
  with `/16` for IPv4 and `/32` for IPv6;
- **drops** what carries a credential: the `token`, `code` and `ref` query
  parameters of `request>uri` (email verification and reset tokens, the
  Telegram login code, a friend or gift code), the `Authorization`, `Cookie`
  and `X-Telegram-Bot-Api-Secret-Token` request headers, and the `Set-Cookie`
  and `Set-Auth-Token` response headers. Caddy redacts cookies and
  `Authorization` by itself; deleting them here does not depend on that
  default.

A new route that carries a secret in its path or query gets a line in the same
place — a matcher entry or a `query` action — in the same pull request.

Every container in `docker-compose.yml` logs through the `x-logging` anchor:
`json-file`, three files of 10 MB each, so the access log is capped and
overwritten rather than kept forever, which is what the privacy policy says
about it. A Caddyfile change applies after `docker compose restart caddy` (the
deploy ends with it); a change to `logging` recreates the containers on the
next `docker compose up -d`.
