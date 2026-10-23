---
paths:
  - '**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'
---

<!-- Compressed editing rules, loaded automatically when a TS/JS file is edited. -->
<!-- The full reasoning is docs/guides/shared/dependencies.md; keep them in sync. -->

# Dependencies — reuse before writing

## Reuse over reinvention

Before writing a helper, check whether an installed library covers it:
`@siberiacancode/reactuse` (React hooks), `remeda` (arrays/objects), `ts-pattern`
(typed branching), `date-fns`, `motion` (animation), `p-retry`,
`@base-ui/react` (unstyled primitives), `@gnomevpn/logger` (logs — one
`createLogger`, never a second `pino()` call), `nuqs` (state in the URL query,
client only). On the server: the `@nestjs/throttler` storage for rate limits off
an HTTP route, `cache-manager` `wrap` for a value cached across requests,
`@isaacs/ttlcache` for a per-process value with a lifetime, `csv-stringify/sync`
(with `escape_formulas`), `ipaddr.js` behind `canonicalIp`,
`@bufbuild/protobuf/wire` to read protobuf without a schema, `shell-quote` behind
`arg()`, `node:util` `parseEnv` for a `.env`.

Only libraries **already declared** in a `package.json` count. A transitive
dependency used directly is a phantom dependency — it passes locally through
hoisting and fails on a clean CI install.
