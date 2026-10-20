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
block sits on the account's Connect tab, so both places recommend the same
apps.

## The account tabs, in the order people need them

Subscription, Connect, Devices, Invite, Profile, Telegram. The status and the
payment come first because that is what a returning visitor checks; Connect
next, since it is what someone who just paid opens; the settings-like tabs
last. Devices only appears with access.

**Connect is one tab for both ways in.** The INCY link and the WireGuard
configs used to be two tabs, App and WireGuard, which read as two products and
put the recommended way and the fallback side by side as equals. `ConnectCard`
now shows a switch between "INCY app" and "WireGuard config", INCY first; the
WireGuard side appears only with access, because creating a config needs a
running period. The link on the INCY side that says a `.conf` is available
flips the switch rather than navigating, and moves focus to the WireGuard
panel's heading so a keyboard or screen-reader user is not left on a button
that no longer exists.

While the subscription status is still loading, Connect shows a loading block
rather than the INCY card: the switch only appears once access is known, and
mounting INCY first would swap the layout under the reader a moment later.
Without access, a notice above the INCY card says the link delivers no servers
until a free day or a subscription is active — the feed answers an account
without access with an empty list, and someone who pasted the link and saw
nothing had no way to know why. If the hash asks for WireGuard (`#wireguard`)
the notice says configs need the same. Both link to `#subscription`; the link is
a plain hash anchor, so the `hashchange` it fires is what switches the tab.

**A status that failed to load is not "no access".** `useSubscriptionStatus`
returns `isUnavailable` (an error and no data). Connect then shows a retry
instead of the locked notice, and the Devices tab stays visible, because hiding
the reader's devices on a network blip read as "your devices are gone".

## Account tabs follow the URL hash

`AccountTabs` selects the tab named by `location.hash` and writes the hash back
with `history.replaceState` when a tab is picked, so `/account#connect` opens
that tab and a reload keeps it. A tab can answer to aliases as well: Connect
answers to `#wireguard`, which also selects the WireGuard side, and to `#app`,
the name of the old App tab, so old bookmarks still land. `ConnectCard` reads
the same hash and writes `#connect` or `#wireguard` as the switch moves, so the
setup page's link lands on the configs. The hash is applied after mount and
again whenever the set of tabs changes — the Devices tab and the WireGuard side
only appear once the subscription status has loaded, so a hash read on mount
alone would miss them. The hash is never read during render, which keeps the
server and the first client render identical. Every tab name, the aliases
included, lives in `ACCOUNT_TAB` (`shared/constants`).

On a phone the tab row is wider than the screen and scrolls sideways, with the
edges faded to show there is more. Whenever the active tab changes, by a click
or by the hash, its button is scrolled into view (`block` and `inline` set to
`nearest`), so a tab opened from a link is never hidden off the edge.

## Deep links survive signing in

`AuthProvider` sends a signed-out reader on a private route to
`/auth?next=<path, query and hash>`, and once a session appears on `/auth` it
goes to that `next` instead of always `/account`. `next` is accepted only as a
relative path on this site (`safeNextPath` resolves it against a probe origin
and refuses anything that leaves it, `//host`, `/\host` and `/auth` itself),
so the parameter cannot be turned into an open redirect. The Telegram widget
sign-in follows the same `next`.

The pricing and landing calls to action carry their intent in the URL:
`/account?plan=<id>&mode=signup`. `mode=signup` is moved onto the sign-in page
(it opens on the sign-up form) and dropped from `next`; `plan` stays in `next`
and `PlanPicker` preselects it on mount. Both are read from `location` after
mount, never during render, so the prerendered pages stay identical to the
first client render. The locale switcher keeps the query and the hash for the
same reason a deep link should: switching language is not navigating away.

## The account page after a checkout

`useSettlePayment` stamps the pending checkout in session storage together with
a fingerprint of the status it was started from (period end, extra devices,
card, renewal flag, period). `PendingCheckoutBanner` shows "waiting for YooKassa
— do not pay twice" while the stamp is live, and `pendingOutcome` ends it: the
status's `lastPayment` for this checkout succeeded or was cancelled, or the
fingerprint changed. "I cancelled the payment" clears the stamp by hand. The
status polls every three seconds only while the stamp is live and once a minute
otherwise — an inactive account no longer polls fast forever.

A paid period shows a renewal block with the plan picker (current plan
preselected, any plan allowed — the term stacks) whenever auto-renewal is not
actually going to run (`isAutoRenewActive`: recurring available, a card on file,
renewal not turned off). It is highlighted in the last three days and when the
last automatic charge was declined (`hasAutoChargeFailed`). Outside a paid
period, when recurring is available, the plan picker says under the pay button
that saving the card on the payment page turns auto-renewal on at that price —
a saved card is the consent `billing.md` describes, so the page says so before
the reader gives it.

An account whose email is not confirmed sees "confirm your email to start the
free day" with a resend button in place of the trial banner, since the trial is
refused until the email is verified; better-auth's `sendVerificationEmail` sends
it, and a `429` from it surfaces as its own message (`TOO_MANY_REQUESTS` in
`unwrapAuth`) rather than a generic failure.
