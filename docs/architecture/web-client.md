# Web client decisions

Design records for `apps/client`: what `cacheComponents` buys, how signing in
clears the query cache, and how the indexed set of pages drives SEO. The layer
rules are in [fsd.md](fsd.md); the per-app guidance is
[apps/client/CLAUDE.md](../../apps/client/CLAUDE.md). Part of the
[documentation index](../README.md).

## `cacheComponents` is on, and nothing writes `use cache`

Next 16's `cacheComponents` is enabled. What it earns is narrow and worth
stating exactly, because the obvious reading of it is wrong twice over.

It is **not** here for `use cache`. Every candidate was measured and none kept
it: `llms.txt` and `llms-full.txt` are static without it and only gain a
revalidation window by adding it; `opengraph-image` stays dynamic with it,
because an `ImageResponse` is no more cacheable than a `Response`; `manifest`,
`robots` and the JSON-LD graph are module constants already computed once. A
cache over work that happens at build time buys nothing and costs a profile
somebody has to reason about later.

What it earns is that `llms.txt` and `llms-full.txt` prerender **without**
`export const dynamic = 'force-static'`. The flag rejects that directive
outright, and turning it off makes both routes dynamic again — measured: 34
prerendered files without the flag, 48 with it, the 14 extra being the Partial
Prerender shells (`/[locale]/faq.html`, `/[locale]/blog/[slug].html`) that serve
a path `generateStaticParams` did not name.

Two rules follow, both learned by breaking the build:

- **A route that must stay dynamic calls `await connection()`.** `/api/health`
  does, and has to, because the Docker healthcheck needs a live answer.
- **Reading the clock during a render fails the build.** `new Date()` in the
  footer stopped the blog prerender with "encountered the unstable value", and
  the same call in `sitemap.ts` quietly turned `/sitemap.xml` dynamic. Both are
  module constants now — the build's own time, which is what `lastModified`
  meant anyway. The footer's live year still comes from `useSyncExternalStore`
  on the client.

If a server component ever does real I/O, `use cache` is the tool for it and the
flag is already on. Until then, adding one is a pessimisation.

## Signing in has to clear the cache signing out clears

`queryClient.clear()` sat in `useSignOut` and nowhere else, so arriving as
somebody else kept the previous reader's answers: a `/website` link from the bot
landed on the account page still rendering the signed-out state, and only a
reload fixed it. Every way in now goes through the same clear — the two Telegram
hooks, the email form and sign-up.

**The clear hangs off the token actually changing, not off saving one.**
`saveAuthToken` runs on every better-auth response and every axios response,
because the server may hand back a refreshed token at any time; clearing there
unconditionally would throw away the cache on ordinary traffic. It returns
whether the value it stored differs from the one already held, and `startSession`
clears only then.

## Indexed pages are a set, not a page

A public page is only indexed when it is in `INDEXED_ROUTES` (`shared/constants/routes/routes.constants.ts`).
That one list drives the sitemap, `robots.txt` and the `llms.txt` page list, so a
page added to the app and not to the list is invisible to every crawler and to
the site's own footer.

Adding an indexed page means five places, not one: the route in `ROUTES`, an
entry in `INDEXED_ROUTES` and `PUBLIC_ROUTES`, `FOOTER_NAV` (internal links are
what stop it being an orphan), `LLMS_PAGES`, and a `meta.title`/`meta.description`
pair in **both** locales. `bun run test` catches the missing translation — a
`servers.rows.label` left as `''` failed the messages suite — and
`bun --filter @gnomevpn/client build` catches the rest.

A page also needs an entry in the sitemap's `PRIORITIES` and
`CHANGE_FREQUENCIES` (`app/sitemap.constants.ts`, exposed as `SITEMAP`). Both fall back to a default, so a missing entry is silent:
`/servers` shipped ranked below `/about` in our own sitemap until it was caught.

**Messages live one file per namespace**, under `shared/i18n/locales/<locale>/<namespace>.json`,
and `messages.ts` imports each one explicitly. The import list is long on purpose
— a dynamic import would leave Next unable to trace the files into the bundle,
and the two locales having the same set of files is what the explicit list makes
visible.

The structured data is one graph in `shared/seo/json-ld`: `Organization`,
`WebSite` and `SoftwareApplication` ship on every page, `Product` only on
pricing, `Service` on the landing, `FAQPage` on the FAQ, `HowTo` on `/setup` and
`Article` on each blog post. `siteJsonLd`'s test asserts the graph's exact node
list, so adding a node means updating it there too — deliberately, because a
silently growing graph is how duplicate entities reach a crawler.

**`FAQPage` lives on `/faq` and nowhere else**, even though the landing and
pricing pages both render questions. The same questions marked up twice is
duplicate structured data, and a crawler treats that as a reason to trust
neither copy.

**`createPageMetadata` names no image and sets `title.absolute`.** Both are
deliberate: an explicit `openGraph.images` overrides the generated
`opengraph-image` route, which is how every page ended up sharing one static
card; and the root `title.template` would otherwise append `· GnomeVPN` to a
title that already contains it.

## Partial prefetching and the smooth scroll flag

`partialPrefetching: true` sits beside `cacheComponents` in `next.config.ts`.
Next 16.4 warns when Cache Components runs without it, recommends both for a
new app, and makes both the default in the next major — so the flag is set now
rather than met as a migration later. The build reports it, and every page
still prerenders as before.

The `<html>` element carries `data-scroll-behavior='smooth'` because the global
styles set `scroll-behavior: smooth`; without the attribute Next keeps smooth
scrolling on during route transitions and warns about it in the browser console.

## The setup page offers three ways, one section each

`/setup` opens with the three ways to connect as cards — INCY (recommended),
another app that reads the subscription, and a WireGuard config — each linking
to its own section further down, rather than a numbered list where the
alternatives arrive as "3. Or…" and "4. Or…". The WireGuard section names the
app per platform (`WIREGUARD_APPS` in `features/vpn/wireguard-config`):
WireSock Secure Connect on Windows, which imports a `.conf` and can route only
chosen programs; AmneziaVPN on iPhone and Android, which imports the file or
its QR code; the official WireGuard app on macOS, Linux and routers. The same
block sits on the account's WireGuard tab, so both places recommend the same
apps.

## Account tabs follow the URL hash

`AccountTabs` selects the tab named by `location.hash` and writes the hash back
with `history.replaceState` when a tab is picked, so `/account#wireguard` opens
that tab, a reload keeps it, and an in-page link like the App tab's
"on the WireGuard tab" switches to it. The hash is applied after mount and again
whenever the set of tabs changes — the WireGuard and Devices tabs only appear
once the subscription status has loaded, so a hash read on mount alone would
miss them. The hash is never read during render, which keeps the server and the
first client render identical. Tab names that other pages link to live in
`ACCOUNT_TAB` (`shared/constants`).
