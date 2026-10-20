# Web client decisions

Design records for `apps/client`: the look (one paper theme and the gnome),
what `cacheComponents` buys, how signing in clears the query cache, and how the
indexed set of pages drives SEO. The layer
rules are in [fsd.md](fsd.md); the per-app guidance is
[apps/client/CLAUDE.md](../../apps/client/CLAUDE.md). Part of the
[documentation index](../README.md).

## One theme: paper and a gnome

The site used to be near-black with a single neon mint accent, a faint grid,
noise, glows and uppercase letter-spaced mono labels — the look of every other
VPN landing page, and the owner's word for it was "AI slop". The brand already
had something nobody else has: a friendly flat gnome. The redesign is built
around him, warm and human rather than dark-neon tech, and it covers the whole
app — marketing pages, the account, the auth pages, the 404 and error screens,
the emails and the OG card — so signing in does not drop the visitor into a
different product.

**One palette, on `:root`.** `app/globals.scss` defines it once and
`color-scheme: light`; the token names are the old ones (`--color-bg`,
`--color-surface`, `--color-accent`…) so components followed without edits.
The values were chosen against WCAG AA on the cream paper, not by eye:

| Pair | Ratio |
| --- | --- |
| text `#16201c` on paper `#f4efe4` | 14.6:1 |
| muted `#56625b` on paper / on `--color-bg-deep` `#ede6d7` | 5.6:1 / 5.1:1 |
| accent `#146b47` on paper | 5.7:1 |
| white on the accent button | 6.5:1 |
| danger `#b4232f` / warning `#8a5300` on paper | 5.7:1 / 5.5:1 |

`#1a7f55`, the first candidate for the forest green, fails small text on paper
(4.35:1) and is only `--color-accent-dim`. Mint `#35f0a0` survives as
`--color-highlight`, a fill behind dark text (11.2:1) — the marker under a word,
a dot, the selection colour — never as text. Peach `--color-peach` is the warm
secondary for stickers and notices; `--color-night` (with `--color-on-night`) is
the deep green of the gnome's sky, used for a few dark islands (the hero window,
the pricing "what's included" band, the invite card). An island that holds
ordinary components re-declares `--color-text` and `--color-text-muted` on its
root instead of restyling its children.

Tokens added for colours that were hard-coded for a dark page:
`--color-on-accent` (text on an accent fill), `--color-tint` (an `r g b` triple
for hover washes: `rgb(var(--color-tint) / 7%)`), `--color-overlay` (dialog
backdrop), `--shadow-soft` and `--shadow-dialog` (warm, low shadows instead of
black ones), `--color-accent-hover`. There is no grid, no noise, no glow; mono
type is kept for what is literally technical — a protocol name in the phone
mock, a referral code, a Telegram code, the error digest.

**Type.** Headings are Literata, a text serif with full Cyrillic (OFL), loaded
like Manrope through `next/font/local` from `shared/config/fonts/files` as
`--font-literata` → `--font-serif` → `--font-display`. Only the upright
variable files (Latin and Cyrillic, ~80 KB) ship; an italic would have doubled
the preload on every page for one signature. Literata is `display: 'block'`
with a Times New Roman metric fallback: with `swap` the headings painted in a
metric-adjusted sans and then visibly changed width, which the owner saw as
"headings jump after load"; with `optional` a face that missed its ~100 ms
window was dropped for the life of the document, and since navigation is
client-side the headings stayed in Times New Roman on every page after a cold
visit. The face is preloaded and small, so the block is a blink. JetBrains Mono is not preloaded — nothing above
the fold uses it. Body text stays Manrope. Neither latin nor cyrillic subset
carries `₽` or the arrows `←↑→↓` that end link labels ("See the plans →"), and
system-font glyphs beside Literata or Manrope looked pasted in, so every family
gets one more face: `manrope-symbols.woff2`, `literata-symbols.woff2` and
`jetbrains-mono-symbols.woff2` (~1–2 KB each, U+20BD and U+2190–2193, cut with
`pyftsubset` from the full OFL variable fonts in google/fonts, Literata's
optical-size axis pinned at 12 like the other files). They are listed **first**
in `src`: faces without `unicode-range` are tried last-declared first, so the
tiny face is reached only for a character the real subsets lack. Prices go through ICU (`{price, number}\u00a0₽`), so the
grouping is the locale's own — «1 690 ₽», "1,690 ₽" — and the sign never wraps
away from the number. The OG card loads Manrope's latin-ext subset for it.

**`Text` variants have zero specificity.** Every class in
`ui-kit/atoms/Text/Text.module.scss` is wrapped in `:where()`, so a `className`
passed to `Text` always wins over its default `size`/`tone`. Before that the two
had equal specificity and CSS chunk order decided — with inlined CSS some page
H1s rendered at the default 16px.

**The gnome is the brand's character.** `GnomeBadge` (ui-kit) is the logo head
in a round night badge: the header mark, the 404, the FAQ and blog
sign-offs. The header carries the only logo — the footer and the account
show none, and the account has no avatar. The illustrated scene — sky, hills
with the gnome's round door, the gnome (lantern optional), foreground
mushrooms — is `ui-kit/atoms/SceneArt`, plain `<g>` groups called as functions,
so one set of art draws the home poster (`ScenePoster`), the auth scene and the
OG card (satori accepts only intrinsic elements inside `<svg>`).

### One header everywhere

`SiteHeader` renders on the marketing, account and auth route groups alike —
the account used to have its own `AccountNav`, a different width and padding,
and the two visibly disagreed. The bar has a fixed height (`--header-height`),
the same container as every page body (below), and a solid
paper background once scrolled. Its actions depend on the session
(`HeaderActions`): signed out it offers "Войти" and the free day, signed in the
account link (marked current on `/account`); on `/auth`, `/reset` and
`/telegram` it shows nothing, since the page itself is the way in. Below the
`3xl` breakpoint (1180px) the six nav links move into the menu sheet while the
actions stay in the bar; below `sm` only «Войти» stays — the free-day button is
in the hero and the sheet. The brand name never hides.

**The language switch is not in the bar.** RU/EN took prime space at every
width and pushed «Войти» off phones; it lives in the footer's bottom row and in
the menu sheet's footer row, beside the support email. The sheet's links share
the title's left edge (the hover pill bleeds into the padding instead) and the
current page carries a mint dot.

**One container.** `@mixin shell-container` (`--shell-width`, 1128px, with the
24/16px gutter) is the header, the footer, the landing and every
`marketing-page`. `marketing-page($measure)` no longer narrows the page box — it
caps its children at `$measure` — so every page's first line sits at the same x
(173px at 1440), and an article or the about page narrows its column, not its
left edge. Measured on `/`, `/pricing`, `/faq`, `/setup`, `/servers`, `/about`,
`/blog`, `/privacy` at 1440, 1024 and 390.

**Toasts sit bottom-right** (`offset` 24px) and full-width bottom-centre on
phones (`mobileOffset` 12px, above the safe area) — top-centre covered the
header nav and its buttons.

`html` paints the paper itself and colours the scrollbar track with it
(`scrollbar-color`): with `scrollbar-gutter: stable` the gutter belongs to the
viewport, so no section background can reach under it; with a hidden scrollbar
(headless Chrome) the gutter shows the page colour rather than white. `html { scrollbar-gutter: stable }` stops
the bar shifting when a page's height crosses the viewport while the account
loads. Measured with Playwright: the header's x/width/height are identical on
`/`, `/pricing`, `/faq` and every account tab, while loading and with a dialog
open, at 1440 and 390.

### Motion

`motion` drives everything that moves; the shared presets live in one place,
`shared/lib/motion` (`EASE_OUT`, `SPRING`, `REVEAL`, `STAGGER`, `IN_VIEW`), and
one-off presets sit beside their component in `<Name>.motion.ts`. Three ui-kit
pieces cover the common cases: `Reveal` (fade + 18px rise once in view, as a
single block, a staggered group or an item of one), `TiltCard` (pointer tilt
≤ 5° on a spring, mouse only) and `IconSwap` (the copy → check morph with a
small burst). `celebrate()` is the success toast with a hopping gnome for the
moments worth it: trial granted, payment settled, config created, referral
claimed. Only `transform` and `opacity` animate.

**Reduced motion is static, not slower.** `MotionConfig reducedMotion='user'`
already sits in `AppProviders`, which turns motion's transform animations into
jumps; on top of that `TiltCard`, the auth scene's parallax and the WebGL
scenes check `useReducedMotion()` (or the media query) and do nothing, and every
keyframe animation has a `prefers-reduced-motion` block. The hero headline and
CTA never wait for an animation — the LCP text renders as is.

### WebGL: the hero gnome and the servers globe

Two moments are real 3D (`three` + `@react-three/fiber`, client-only
dependencies): the gnome on a floating island in the hero, and a dotted globe
with arcs from the visitor to the server cities. Both are progressive
enhancement over a poster that is already on the page:

- **The poster is a frame of the scene.** The SVG poster used to be a different
  drawing (hills and a door) and the crossfade swapped one picture for another.
  Both posters are now frames rendered by the canvas itself — Playwright with a
  fake clock (`page.clock`) at t≈0.3 s, SwiftShader, DPR 2, the phone and labels
  hidden — saved as AVIF + WebP in `public/landing/` (`hero-island-560/880`,
  8–13 KB; `globe-480/960`, transparent, 15–37 KB AVIF). The hero poster is
  preloaded (`preload()` from `react-dom`, `fetchPriority: 'high'`); the globe
  poster is `loading='lazy'`. Every pose the canvas starts in — the rig's
  resting turn, the globe's sway, the blink offset — is at rest at t=0, so the
  fade is invisible. **Regenerate both after changing either scene**: run the
  page, freeze the clock, screenshot the canvas (the globe with
  `omitBackground` and a transparent page), encode with `avifenc -q 40–60` and
  Pillow WebP. What crawlers, slow devices and reduced motion get is that frame.
  The canvas mounts on top inside the same box (the aspect ratio is reserved,
  so nothing moves) and fades in only after its first frame.
- **Code-split.** `GnomeCanvas` and `GlobeCanvas` load through `next/dynamic`
  with `ssr: false`; three and r3f live in one lazy chunk (242 KB gzip, budget
  250 KB) that the home's initial JS does not include.
- **When to load** is `useWebglStage` in `shared/lib/webgl`. `webglTier` (pure,
  tested) turns the environment into `off` / `lite` / `full`: off for reduced
  motion, Save-Data, 2g/3g, no WebGL, ≤ 2 GB memory or ≤ 2 cores; lite for
  ≤ 4 GB, ≤ 4 cores or a phone-sized touch screen. The hero loads after
  `requestIdleCallback` on `full` and after the first interaction on `lite` (so
  a phone that never scrolls never pays for it); the globe loads when its
  section comes within 200px of the viewport.
- **When to run.** `frameloop` is `'never'` while the canvas is off-screen or
  the tab is hidden (an IntersectionObserver plus `visibilitychange`) —
  measured: zero `requestAnimationFrame` calls in two seconds with both scenes
  scrolled away, 120 with the hero on screen.
- **Adapting.** DPR is capped (1.75 full, 1.25 lite); `useAdaptiveQuality`
  samples FPS every two seconds, drops to DPR 1 under 30 fps and hands back to
  the poster under 20. MSAA is on only for `full` (aliasing at DPR 1 looked
  rough); `lite` relies on DPR.
- **Cheap scenes.** Procedural geometry only — no models, textures or HDRs. The
  look is `MeshToonMaterial` with a three-step gradient and `flat` (no tone
  mapping, so the palette stays the palette); light is a hemisphere, one
  directional and the lantern's flickering point light; the shadow is a baked
  radial texture. Grass and the globe's dots are each one `InstancedMesh`;
  materials are shared through `MaterialsContext` and disposed on unmount; the
  per-frame code allocates nothing.
- **The gnome matches the flat one.** Black eyes under the brim, peach cheeks,
  a white beard wedge (`beardWedge`: a cone leaned forward so it lies on the
  belly down to the belt), the flat palette's terracotta — the lantern's point
  light is weak (0.22) because at 3 it turned the tunic traffic-cone orange —
  arms hanging ~30° from the body (`limbPose` from shoulder and hand points),
  and a lantern hung from a handle (handle, cap, four bars, glass, base) that
  follows the hand. The whole island is scaled 0.84→0.78 and lifted so the
  pom-pom clears the arch and a soft shadow floats under the island.
- **Interaction.** The head and eyes follow the pointer (fine pointers only)
  faster and further than the body, which turns a little and orbits with
  scroll; he breathes, blinks and sways the lantern. Every 8–10 s he does one
  thing — waves, raises the lantern (it flares), or the hat tip springs — and a
  tap or click makes him hop with a lantern flare. The state lives in one ref
  (`useGnomeControls` → `GnomeMotionContext`); the curves are pure and tested
  (`phase`, `swell`, `hopHeight`, `springKick`, `nextAction`). Reduced motion
  never mounts the canvas, so the poster stays still.
- **The globe is the Earth.** Dots sit only on land: `LAND_MASK` is a 180×90
  (2°) bitmap of Natural Earth 1:50m land (public domain, via
  `world-atlas@2.0.2`), 2.7 KB of base64, rasterised once with `d3-geo`
  `geoContains` and checked in — it is data, not a build step. `landDots`
  filters a Fibonacci sphere (11 000 samples on `full`, 6 500 on `lite`, ~3 200
  and ~1 900 on land) and the dots are one `InstancedMesh` of small discs facing
  outward. The camera looks at 52°N 25°E from 6.05 units with a 34° field, which
  puts the whole sphere in the square card with ~8% margin; `projectGlobe` is
  the same projection as a pure function (tested: centre in the middle, north
  up, east right, sphere inside the card), used to place the labels on the
  poster before the canvas exists. «Вы» is Moscow. Arcs rise with distance
  (`arcLift`: 1 + 1.4 × the angle) and carry a moving light; labels are HTML
  pills offset to a side with a short leader line (`GLOBE_LABEL_SIDE`:
  Amsterdam left, Helsinki above, «Вы» below), updated from the projected marker
  each frame once the canvas runs.

Verified: no canvas with reduced motion or with `--disable-webgl`, no console
errors, the poster stays.

### Performance budget

Lighthouse mobile defaults (Moto G-class CPU, slow 4G), production build:

| Budget | Home `/` | `/pricing` |
| --- | --- | --- |
| LCP ≤ 2.5 s | 1.9 s | 0.9 s |
| CLS ≤ 0.05 | 0.002 | 0.001 |
| TBT ≤ 200 ms | 130–170 ms | 150 ms |
| Score | 97–98 | 98 |

The home's LCP element is now the hero poster image (on a phone the art sits
above the headline and is the largest thing on screen); it was the headline
while the poster was inline SVG, which is not an LCP candidate. 1.9 s is the
price of a real picture of the 3D island, inside the budget.

Before this work the same pages scored 70/77 with LCP 3.4/3.3 s and TBT
520/370 ms. What moved the numbers:

- `experimental.inlineCss` — the five render-blocking stylesheets cost ~870 ms
  of FCP on slow 4G; inlined, FCP equals the HTML.
- `"sideEffects"` in `apps/client` (styles only) and `@gnomevpn/schemas`, so
  barrels tree-shake and zod stops riding along with a constant.
- `AppProviders` gets the current locale's messages from the server layout
  instead of importing both locales' JSON (55 KB gzip of JS on every page).
- The toaster mounts lazily; JetBrains Mono is not preloaded.
- **Only the messages a client component reads reach the browser.**
  `clientMessages(locale)` (`shared/i18n/client-messages`) filters the bundle by
  `CLIENT_MESSAGES`: whole namespaces for the shell, the account and auth;
  named keys for `faq` (the search UI, not the 15 KB of answers, which the
  server renders) and `landing` (the picker, the phone, the city names); `meta`
  nowhere; `blog`, `privacy`, `about`, `pricing`, `servers` and `notFound` not
  at all — they are rendered by server components only. 75 K characters → 36 K
  in every page's payload. A test scans every `'use client'` file and fails if
  one asks for a namespace or key the filter drops; a component that is client
  only because a client parent imports it is caught by the build instead
  (`MISSING_MESSAGE` during prerender). Adding a client component that reads a
  new namespace means a line in `CLIENT_MESSAGES`.
- **No flag-icons stylesheet.** Its 28 KB of CSS listed all 271 flags with
  hashed URLs, inlined twice (in `<style>` and in the RSC payload), and did not
  compress: 22 KB of the home's 104 KB gzipped HTML. `CountryFlag` imports the
  SVGs of 51 likely node countries (`CountryFlag.constants.ts`) and sets the one
  it needs as an inline background; an unknown code renders a neutral chip. A
  node in a new country needs its code added there.
- The hero poster is static (no infinite SVG keyframes, which cost seconds of
  paint under throttling), the globe's 480 dots are one data-URI image instead
  of 480 hydrated nodes.
- Each below-the-fold home section is its own `<Suspense>` boundary, so React
  hydrates them as separate tasks instead of one 170 ms long task.

Home initial JS: 449 KB gzip before → 399 KB after, with the 3D on top in its
own lazy chunk. The home's HTML went from 104 KB to 84 KB gzipped with the two
cuts above, and TBT from 210–350 ms to 130–170 ms. Measure with
`bunx lighthouse@12 <url> --preset=perf --form-factor=mobile --extra-headers='{"Accept-Language":"ru"}'`
against `next start` — without the header Lighthouse is redirected to `/en`.

### The home page

Hero (headline, a one-line sub, CTAs, two plain facts — the free day is in the
button and was said four times; the gnome scene and a phone in CSS 3D showing a
connected server list built from `SERVER_LOCATIONS`; below `lg` the phone moves
to the bottom-right at ~41% width beside a narrower arch, server names may wrap
to two lines and the protocol label is dropped) → "connected in three minutes"
(left-aligned like every other section; a platform picker over `PLATFORMS` that
is one horizontally scrolling row with a fading right edge below `xl`; three
steps per platform reusing the `/setup` copy, the real download link, and a
real «Получить ссылку» link to `/account?mode=signup#connect` where there used
to be a paragraph dressed as the account's button) → pricing (the `PricingCard`
widget: equal cards, the featured one marked by a 2px accent ring and a badge
inside, «без скидки» under the monthly price, 12px discount chips; the free day
and the auto-renewal line) → servers and what's inside (the globe, sticky beside
five points on desktop and above them on phones) → a signed note from the gnome
(straight, its lines ruled every 32px under the baselines, a 56px gnome beside
the heading on phones) → six FAQ highlights as the `/faq` accordion, collapsed,
one column. The comparison table against free VPNs is gone;
its argument is two sentences in the note.

### Unknown addresses answer 404 inside the site

`/nope` used to get Next's default white English page, because nothing matched
it, and `/blog/nope` the branded screen without header or footer and with
status **200**. Now:

- `app/[locale]/[...rest]/page.tsx` calls `notFound()`, so every unmatched
  path in either locale lands in the app (`/nope` is rewritten to `/ru/nope`
  by the proxy; `/ru/nope` still redirects to `/nope`, as next-intl's
  `as-needed` prefix does for every page).
- `app/[locale]/not-found.tsx` wraps `NotFoundView` in `SiteShell`
  (`widgets/site/site-shell`, the header + content + footer the marketing layout
  also uses), and `StatusScreen` takes `isInline` so it does not demand a full
  viewport between them.
- **The status.** With `partialPrefetching` an unlisted param is served from
  the route's App Shell immediately — 200 is on the wire before the page throws
  `notFound()`. Both the catch-all and `blog/[slug]` export
  `ensureStatic = 'navigation'` (with a `generateStaticParams`, which that level
  requires): the first request for an unlisted value waits for the complete
  render, so the 404 is decided before anything is sent. Verified with
  `curl -I` against `next start`: `/nope`, `/en/nope`, `/a/b/c`, `/blog/nope`,
  `/en/blog/nope` → 404; real pages 200. A middleware that rewrote with
  `status: 404` was tried first and does not work — the prerendered shell's 200
  wins.
- The 404 body is rendered in the browser (the root `AuthProvider` reads
  `usePathname()` outside `<Suspense>`, which bails the not-found tree out of
  server rendering); the status and `noindex` are what crawlers act on.
- A path with a dot that is not a file (`/foo.php`) is excluded from the proxy,
  becomes an unknown `[locale]` and still gets Next's default 404 page (with a
  404 status). `global-not-found` does not help: the `[locale]` segment matched,
  so it is never consulted.

### FAQ search

`/faq` filters as you type. The matching is pure and tested
(`views/faq/lib/word-match` and `views/faq/lib/faq-search`), and every rule
below exists because a real query went wrong without it:

- **Stop-words go first.** «как», «можно», «ли», «сколько», «что», «у вас»,
  "how", "can", "is", "do"… (`SEARCH_STOP_WORDS`) are dropped from the query.
  «сколько стоит» used to match every answer that said «сколько устройств».
  A query made only of stop-words leaves the list whole.
- **A stem is a stem only for real words.** Two words match by prefix only when
  the shorter is at least five letters, they differ in length by at most two
  and share `max(5, shorter − 3)` letters — «деньгами» finds «деньги», but
  «деньги» no longer finds «день» (which had «вернуть деньги» returning the
  free-day answer).
- **One typo is forgiven** in words of five letters or more: a
  Damerau-Levenshtein distance of 1 against the word or against its stem with
  an ending of up to two letters, so «торент» finds «торренты».
- **Synonyms** (`SEARCH_SYNONYMS`, both languages) widen a word to its group
  («возврат» ↔ «вернуть», «стоит» ↔ «тариф», «iphone» ↔ «телефон»).
- **Ranking, not just filtering.** Every query word must match; each scores
  5/4/2 in the question (exact / stem or typo / synonym) and 1.25/1/0.5 in the
  answer, and hits under 40% of the best score are dropped. The results are one
  flat ranked list, five at a time with «Показать ещё», only the first opened —
  every hit auto-expanding was a wall of text. Matches stay marked with `<mark>`.

There is a real «Сколько стоит?» question; its answer takes the prices from
`PLANS` through ICU arguments (`FAQ_ANSWER_VALUES` in `entities/app/faq`), so
a repricing cannot leave the FAQ behind. `llms-full.txt` formats it the same
way. Topic chips narrow to one group and combine with the text. The empty
state is one box — no repeated chips, no second «Не нашли ответ?» footer — and
offers the Telegram bot only when the server names one. The count is announced
politely; `?q=` and `?topic=` are written with `replaceState` (debounced) and
read after mount; `/` focuses the field.

### The way in

The auth pages are an entrance rather than a form on a blank page: `AuthShell`
(`widgets/auth/auth-shell`) puts the gnome by his door beside the card on
desktop — layered SVG with a little pointer parallax, no WebGL, so auth stays
light. On phones the same scene becomes the card's top band (150px, cropped to
the gnome and the door) instead of a separate block above it. The door opens
while the form has focus and as the visitor gets in; the pose changes with the
page (the lantern for sign-in, a key for the reset). The lantern's glow is a
radial gradient that fades to nothing inside its circle — two flat circles read
as a disc.

**Nothing moves when the form changes.** The shell is pinned to the top of the
page (`align-self: flex-start` and a fixed top margin) and the art column sits
in its own grid area, so switching sign-in ↔ sign-up changes only the card's
own height; both used to be vertically centred and the card jumped ~70px.

**The segmented control is the title.** The card has no visible heading on
sign-in and sign-up (a visually hidden `h1` stays for screen readers); the
forgot-password mode, which has no control, shows its heading.

**Sign-up asks for email and password only.** `signUpSchema` is
`{ email, password }`; better-auth still needs a `name`, so `useSignUp` sends
`nameFromEmail(email)` — the local part, or the whole address when that is
shorter than the two characters the name rule needs — and the person can change
it in Profile. There is no «repeat password»: the field has an eye toggle and a
strength hint (`passwordStrength`). Under the button the form says that
creating an account means agreeing to the privacy policy, with a link; there is
no terms page to link.

Sign-in and sign-up keep `?mode=` in the URL, animate the height between forms
and put Telegram first when the bot is configured. Server errors that belong to
a field land on it (`useAuthFormError`, mapped by `authErrorField`); the rest
stay toasts. The password field warns about Caps Lock.

### The OG card

`app/[locale]/opengraph-image.tsx` reads the locale from `params`, not
`rootParams.locale()`: root params are not supported in route handlers yet, and
the card had been answering 500 because of it. For the same reason it builds
its translator with `createTranslator` and the message bundle — next-intl's
request config calls `rootParams` too. The fonts are read with literal paths
(`opengraph-image.fonts.ts`); a path built from a variable made the build
trace the whole project into the server output. satori keeps one font per
family name, so each subset is registered under its own name and the styles
list them as a fallback chain (`OG_FAMILY`). `public/brand/og.png`, the static
fallback named by `SITE.ogImage`, is a render of the Russian card.

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
entry in `INDEXED_ROUTES` and `PUBLIC_ROUTES`, `FOOTER_NAV` and its group in `FOOTER_GROUPS` (internal links are
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

## The setup page: one platform picker

`/setup` used to mix three ways of choosing — the "three ways" cards, a
platform tab row inside the INCY section and another inside WireGuard. Now one
segmented «Платформа» control (iPhone, Android, computer, TV), sticky under the
header, filters every section at once through `SETUP_FILTER`: which INCY
downloads to show, which INCY steps, which other subscription apps support the
platform (from `CLIENT_REGISTRY`), and which WireGuard instructions apply. It
starts on iPhone (what the server renders) and switches after mount to what
`platformFromAgent` reads from the user agent.

The three ways stay as anchors — `#incy`, `#apps`, `#wireguard` — in the
column beside the content (a row above it on narrow screens), INCY marked as
recommended. WireGuard is deliberately secondary: a muted box whose
step-by-step instructions are collapsed accordions. Its app table
(`WIREGUARD_APPS` in `features/vpn/wireguard-config`) names WireSock Secure
Connect on Windows, AmneziaVPN on iPhone and Android, the official WireGuard
app on macOS, Linux and routers; the same block sits on the account's Connect
tab, so both places recommend the same apps.

## The account tabs, in the order people need them

Subscription, Connect, Devices, Invite, Profile, Telegram. The status and the
payment come first because that is what a returning visitor checks; Connect
next, since it is what someone who just paid opens; the settings-like tabs
last. Devices only appears with access, and Telegram only when the server
names a bot (`useTelegramWidget`) — a tab for a bot that is off was a dead end.
`#telegram` stays safe without it: a hash no tab answers to falls back to the
first tab.

**While the session resolves the page is a skeleton, not a blank.**
`AccountShell` lays `AccountSkeleton` over the children — the title, the tab
row (a column on desktop) and one card at their final sizes — from the server
render until the user is known. The children still render underneath (`inert`
and hidden from assistive tech), which keeps the segment rendering as Next
requires; before this the page was the motion's `opacity: 0` and then a
full-screen splash.

**Signing out is quiet.** On a phone «Выйти» was the second most prominent
control on the page. It now lives at the end of the Profile tab, with a plain
text link in the header on desktop only; the email under the title is 14px
muted text.

**A fresh account leads with the free day.** When the trial is available, the
Subscription tab opens on one hero: «Подтвердите почту — и первый день
бесплатно» with resend as the primary button, or, once the email is
confirmed, the free day with «Включить пробный день». The plans sit collapsed
under «Сразу оформить подписку» (opened automatically when `?plan=` came from
the pricing page). Before, the first thing a new account saw was «Оплатить
200 ₽».

**Devices count seats, not slots.** The bar under "Device places" has one
segment per seat the subscription owns and fills the ones in use; platform
names come through `platformLabel` («android» → «Android», «ios» → «iOS»).
The Invite tab hides the three zero counters until the first friend arrives
and shows how it works and the days per plan as one table.

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
