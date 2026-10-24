---
paths:
  - 'apps/server/**/*.ts'
---

<!-- Compressed editing rules for the API, loaded automatically on edit. -->
<!-- The full reasoning is docs/guides/server/nestjs.md; keep them in sync. -->

# Code style — server: environment

## Environment

`config/env/` validates on boot and **throws** on a missing variable. Code reads the groups (`config.get('yookassa').shopId`, `env.database.url`), one zod file per group, never a flat `config.get('YOOKASSA_SHOP_ID')`.
Node panel API tokens are the exception: the `node` table stores the _name_ of an
env var (`apiTokenEnvVar`), never the secret, and `xrayClientForNode` resolves it
at call time. The values (`XRAY_KEY_<CC>`) live in the gitignored `.env.nodes`,
written by `bun run provision:nodes`.
