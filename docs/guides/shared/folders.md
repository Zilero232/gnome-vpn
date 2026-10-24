# Folders

Part of the [style guide](../README.md).

## Folders are one concern, not one function

**A folder is one concern, not one function.** Each gets its own `index.ts`,
`<name>.types.ts` and `<name>.constants.ts` where it needs them, so a reader
opens `vless/` and finds every VLESS thing and nothing else.

The unit is the concern because the alternative was tried: `lib/xray` once held
seven folders and fifteen files for a handful of lines — `strip-cidr-mask/` was a
single regex behind its own barrel, `generate-auth/` a single `randomBytes` call.
Reaching either meant `lib/xray/lib/<name>/<name>.ts`, three levels of
indirection to arrive at one statement. A helper too small to have its own types
belongs in the `<name>.helpers.ts` of the concern that uses it.

## Two ways a folder goes wrong

Both make a reader open more files than the code needs, from opposite sides.

**Too thin.** A folder whose whole content is one short function, one constant
or one type is a hop, not a concern. Merge it into the concern that uses it:
the server's `common/lib` once held `describe-error/`, `error-code/`,
`country-flag/`, `pluralize/`, `fill-tokens/`, `short-code/` and
`timing-safe-equal/` — seven folders, twenty-odd files — and is now `errors/`,
`text/` and `crypto/`. Tests merge the same way, one `_tests/<name>.test.ts` per
merged folder with the `describe` blocks unchanged.

**Too thick.** A file that does several jobs — a 400-line service that
dispatches, settles, refunds and notifies, or a `.types.ts` that collects every
input type of a module — is split by job: one service per domain of work, and a
service's private `<Fn>Input` types beside that service, not in a module-wide
grab bag. A `lib/<concern>/` that grows past a screen of unrelated functions
gets subfolders by concern.

The test for both: following one request should open the files that do the
work, and each of those files should be about one thing.

## When a folder gets an `index.ts`

A barrel exists only at a boundary — `modules/<x>/`, `core/`,
`common/<layer>/`, `lib/<integration>/`, a `lib/<concern>/` that code outside
its folder imports — and it exports only the names that have an outside
consumer. A `<Fn>Input` used by one file stays internal. A folder with a single
file that nothing outside imports needs no barrel at all, and the server's
`lib/` has no aggregate barrel: import `@/lib/xray`, `@/lib/auth`,
`@/lib/yookassa` or `@/lib/email`, so that reaching `XrayClient` no longer loads
better-auth.

## A module with several features is split by feature

A server module that serves more than one feature — the bot's account, devices,
subscription and owner tools; the feed, the link, routing, geo files and
WireGuard configs — is not one `services/` + `lib/` + `config/` heap. Each
feature gets a folder holding its controller, services, pure helpers, types,
config and `_tests/`, so a reader opens `telegram/devices/` and finds every
devices thing and nothing else:

```text
modules/telegram/
├── telegram.module.ts      # Nest wiring stays here
├── index.ts                # the public barrel, nothing else exported
├── bot/                    # how updates arrive and are routed
├── notify/                 # the submodule other modules import
├── account/ subscription/ devices/ invite/ support/ owner/
├── shared/                 # what several features use: text, keyboards, callback data
└── config/                 # only what several features share
```

A feature reaches a sibling only through the module's `shared/` (or a submodule
like `notify/`), never into its internals; a constant one feature uses lives in
that feature as `<feature>.config.ts`. A feature folder has no `index.ts` unless
code outside the module imports it. A small module — `health`, `platforms` —
stays flat: the split pays off once a folder mixes concerns, not before.

