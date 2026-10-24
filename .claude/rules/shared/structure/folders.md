---
paths:
  - '**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'
---

<!-- Compressed editing rules, loaded automatically when a TS/JS file is edited. -->
<!-- The full reasoning is docs/guides/shared/folders.md; keep them in sync. -->

# Structure — folders

## Folders are one concern, not one function

Each gets its own `index.ts`, `<name>.types.ts` and `<name>.constants.ts` where
it needs them. A helper too small to have its own types belongs in the
`<name>.helpers.ts` of the concern that uses it — a one-line regex behind its own
barrel is three levels of indirection for one statement.

## Too thin, too thick

Merge a folder that holds one short function, constant or type into the concern
that uses it (tests merge into one `_tests/<name>.test.ts`). Split a file that
does several jobs — one service per domain of work, private `<Fn>Input` types
beside their service rather than in a module-wide `.types.ts`.

## Barrels

An `index.ts` only at a boundary (`modules/<x>/`, `core/`, `common/<layer>/`,
`lib/<integration>/`, or a `lib/<concern>/` imported from outside its folder),
exporting only names with an outside consumer. The server has no aggregate
`lib/index.ts`: import `@/lib/xray`, `@/lib/auth`, `@/lib/yookassa`,
`@/lib/email`.

## Feature folders in a big module

A server module with several features splits into one folder per feature
(controller, services, helpers, types, config, `_tests/`), plus `shared/` for
what several features use; Nest wiring stays in the module file. A feature
reaches a sibling only through `shared/`, and owns the constants only it uses.

