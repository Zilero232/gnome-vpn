# The public offer

`/terms` — «Публичная оферта», "Terms of Service" in English — is the contract a
paying reader enters into. YooKassa asks for one before it enables automatic
payments, and a shop that charges cards without its terms in writing has
nothing to point to when a charge is disputed. Code: `views/terms` and the
`terms` message namespace in `apps/client`; the layout it shares with the
privacy policy is `widgets/site/legal-document`. Part of the
[documentation index](../README.md).

## What it covers

Sixteen numbered sections: definitions, subject, acceptance, the service and
how it is delivered, the user's obligations and prohibited use, prices and
payment, automatic renewal, the trial, refunds, bonuses, promo codes and
gifts, the end of a subscription and termination, liability, personal data,
changes to the offer, governing law and disputes, contacts — then the seller's
requisites when they are set (below). Clause numbers (`4.6.`) are generated from the position, so a
clause added to a section renumbers the rest without anyone editing numbers by
hand; the text never refers to a clause by number, only to a section by name.

Each section is `sections.<key>.title` and an array `sections.<key>.clauses`.
`TERMS_SECTIONS` (`views/terms/config`) lists the keys in page order with each
section's clause count, and a test checks the counts against both locales, so a
clause added in one language and not the other fails `bun run test`.

The Russian text is the contract; the English one says it is a translation and
that the Russian prevails.

## The text describes the code, so it moves with the code

Every promise in the offer was taken from what the server does, not from what a
VPN offer usually says. When a billing rule changes, the offer changes in the
same pull request and `TERMS_UPDATED` moves:

| Offer                                                                 | Where it comes from                                                                                                   |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| trial length, device limit, max extra places, gift days               | `TRIAL_DAYS`, `DEFAULT_DEVICE_LIMIT`, `MAX_EXTRA_DEVICES`, `giftDays(plan)` — interpolated through `TERMS_VALUES`     |
| prices                                                                | not in the text at all: «цена на странице «Тарифы» в момент оплаты»                                                   |
| charge in the last 24 hours, one attempt per payment method           | `WINDOW.renewHours`, `wasAttempted` in `recurring-charge` ([billing.md](billing.md))                                  |
| renewal amount: the last plan bought at today's price, else monthly   | `findPlan(subscription.plan).priceRub` in `recurring-charge`; `activate` writes the plan, a code or trial row `DEFAULT_PLAN_ID` |
| no discount on a renewal, extra places or a gift                      | `recurring-charge` and `buyExtraDevices`/`buyGift` price without `PromoDiscountService.quote`                         |
| reminder "usually three days before", email and bot                   | `WINDOW.remindHours`, `renewSoon` in `period-reminder`, `NoticeEmailService`                                          |
| paying outside a paid period saves the method and turns renewal on    | `save_payment_method: isRecurringEnabled()` in `CheckoutService`; `activate`'s `isConsentGiven` ([billing.md](billing.md#automatic-renewal)) |
| paying inside one keeps the choice; card binding and the toggle turn it on | `resolveCancelAtPeriodEnd`, `attachPaymentMethod`, `AutoRenewService.resumeAutoRenew`; unbinding: `unbindCard`  |
| only the card mask is kept                                            | `describeCard` (type and last 4) into `savedCardTitle`                                                                |
| an unusable card is unbound                                           | `CARD_LOST_REASONS`, `dropUnusableCard`                                                                               |
| refund rewinds the period, takes referral days back                   | `handleRefund`, `ReferralRewardService.revoke` ([billing.md](billing.md#refunds))                                     |
| a refunded gift is disabled and its days taken back                   | `GiftCodeService.revoke` ([promo-codes.md](promo-codes.md#the-gift-lifecycle))                                        |
| automatic refunds                                                     | lapsed extra places (`lapsed`), a payment of a deleted account (`orphan`), a discount already used (`discountUsed`)  |
| a campaign code: one discount or days, one pending discount, once per identity, email confirmed | `PromoRedemptionService`, `PromoDiscountService` ([promo-codes.md](promo-codes.md#the-discount-lifecycle)) |
| a gift: single use, no expiry, survives the buyer, not a renewal      | `GIFT.maxUses`, `buyer_id` set null, `save_payment_method: false` in `buyGift`                                        |
| extra places end 6 hours after a lapse                                | `activate` resets `extraDevices` past `PERIOD_GRACE`; `graceDeviceLimit` in the device-slot sweep                     |
| a shrinking limit cuts the newest devices, deletes WireGuard configs  | `DevicesService.revokeOverLimit` (`device-slots` job), `slotHolders`                                                 |
| a WireGuard config goes with its node or the node's new settings      | `buildNodeSync` in `scripts/provision/node/node-sync`                                                                 |
| trial once per email and Telegram identity, never after any access    | `trial_grant` ([billing.md](billing.md#the-trial)); `trialState.isTrialAvailable` needs no `currentPeriodEnd`        |
| no deletion while a payment is pending                                | `ACCOUNT_PAYMENT_PENDING`                                                                                             |

A number that has no constant on the client is written out in both languages:
the 14 days of the refund promise (the same figure the pricing page, the FAQ
and the landing page already make), the last 24 hours of a period, "usually
three days", the 10 days to answer a claim, the 6 hours of `PERIOD_GRACE`
after which extra places end, the 1-month plan a code-only account renews on,
and the age of 14 (the privacy policy says the same). Search the two
`terms.json` files for them when one of those changes. The privacy policy
writes out its own: the 30 days a session lasts (`SESSION.expiresIn`), the 90
days a support thread is remembered (`RETENTION.supportMessageDays`), the 190
days within which a deleted account leaves the backups (postgres-backup-local
removes a monthly dump after `BACKUP_KEEP_MONTHS` × 31 + 1 = 187 days, checked
on every 6-hourly run — [ops/backups.md](../ops/backups.md)), and the 10
working days, extendable by 5, to answer a data request (152-ФЗ).

**Referral bonuses are worded generally; promo codes and gifts are not.** The
referral numbers live in `REFERRAL_REWARDS` and are shown in the account and
the bot; the offer only says that bonuses follow the rules shown in the service
at the time and have no cash value. Campaign codes and gifts are spelled out
because they decide what a payment buys: a discount is one payment's, never a
renewal's; a gift is a paid product with its own refund consequences, and the
person who activates it is not the person who paid. Both follow
[promo-codes.md](promo-codes.md); a change there is a change to the
«Бонусы, промокоды и подарки» section in the same pull request.

## Refunds: the promise and the statute side by side

The site has always promised a refund of the unused period within 14 days, no
questions asked, and the offer keeps that promise: the unused part is counted
in whole days of the term that payment bought, and a term that has not started
yet (bought on top of a running one) is refunded in full.

It does not make 14 days a cut-off. Under Article 32 of the consumer protection
law a consumer may withdraw from a services contract at any time, paying only
the provider's actual costs, and a clause that narrows a consumer's statutory
right is void and finable (КоАП 14.8). So the 14 days stay a promise and the
last clause of the section says the statute is not limited by it. For the same
reason the disputes section asks for a claim by email but does not make it a
precondition for going to court, and the liability cap applies only "to the
extent the law allows".

Only full refunds are automated (`handleRefund`); a partial one is logged and
alerted for a person, who adjusts the period by hand — and the refund the offer
promises, the unused part of a term, is usually partial. The offer promises the
refund within 10 days of the request — the term the consumer law sets for
refund demands.

## The seller's requisites are build-time variables

The offer must name the seller, and the seller may be an individual
entrepreneur (ИП: ИНН and ОГРНИП) or self-employed (самозанятый: ИНН only). The
values are not invented anywhere in the repository; they come from five
optional variables validated in `shared/config/client-env.ts` and grouped as
`SELLER` in `shared/config/seller.ts`:

| Variable                     | Format                                                  |
| ---------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SELLER_NAME`    | any text; empty hides the requisites section            |
| `NEXT_PUBLIC_SELLER_STATUS`  | `entrepreneur` or `selfEmployed`, shown as a translated label |
| `NEXT_PUBLIC_SELLER_INN`     | 12 digits                                               |
| `NEXT_PUBLIC_SELLER_OGRNIP`  | 15 digits                                               |
| `NEXT_PUBLIC_SELLER_ADDRESS` | any text                                                |

An empty value counts as unset, so a missing repository variable is an empty
build arg and never fails the build; a malformed one fails it. `sellerRows`
prints only the fields that are set, in that order, and the support email
always closes the list. The page is prerendered, so the values are read at
build time: `deploy.yml` passes them from the repository variables `vars.SELLER_*`
through the Dockerfile's build args, the same way `NEXT_PUBLIC_API_URL` goes in,
and changing them needs a redeploy. The variables are listed in
[ops/deploy.md](../ops/deploy.md#secrets).

Until `SELLER_NAME` is set the offer names no seller. Set it before taking real
payments.

## Where the offer is accepted

Acceptance is creating an account, starting the trial or paying, so the link
sits wherever one of those happens:

- the sign-up form: «Создавая аккаунт, вы принимаете условия оферты и политику
  конфиденциальности», both linked;
- under every button that leads to YooKassa: `OfferNote` in the plan picker
  (and so in the renewal panel), under extra places and under the gift
  purchase — "by paying you accept";
  under «Привязать карту» and «Включить автопродление» the `autoRenew` variant,
  which names automatic charges;
- the bot's payment messages (`checkoutIntro`, `devicesIntro`) end with a link
  to the offer in the reader's language (`TelegramSharedService.termsUrl`);
- the pricing page, the footer's legal group beside the privacy policy, and a
  footnote on the privacy policy itself.

The bot creates an account on `/start` without showing the offer; using the
service is acceptance by conduct, and the first payment in the bot shows the
link before YooKassa does.

`OfferNote` reads `terms.notes`, the only part of the namespace sent to the
browser (`CLIENT_MESSAGES`); the offer itself is server-rendered and stays out
of the client bundle, which the client-messages test asserts.

## Copy describes the product, never bypassing blocks

Russian law fines advertising and popularising ways to get around blocked
resources, and the people who sell VPN access are the ones it is aimed at. So
the site, the bot and the blog describe what the product does — a private,
stable connection; protocols that keep working on networks that drop UDP or
filter traffic — and never call it a way around blocks, never say a protocol
"bypasses blocking", and never say what the state blocks. A protocol that is
unreliable is described by how it behaves for the reader ("easy to recognise,
often fails on mobile networks"), which is what they need to choose. Technical
statements about a network — a hotel Wi-Fi that drops UDP, an office filter
that passes only 443 — are not that, and stay. Two more shapes are out: naming
the services a reader may want to reach (the bot says «Видео в 4K, игры и
звонки», not a platform), and presenting a protocol as a disguise. Reality
"carries the TLS handshake of a real site, so it works where only HTTPS on 443
is open" — never "looks like ordinary HTTPS" or "only active probing can tell
it apart"; WireGuard is "easy to recognise by its handshake", not
"undisguised". New copy follows the same rule; the docs in English are
internal and may name things as they are.

## What the offer promises that a person has to do

- **Receipts.** The offer says a receipt is provided as the law requires. The
  checkout sends YooKassa no `receipt` object, so 54-ФЗ receipts (or «Мой
  налог» for a self-employed seller) are the owner's job until that is wired.
- **Refunds** are made in the YooKassa dashboard within 10 days of the request.
- **A partial refund changes nothing by itself.** `handleRefund` acts only on a
  payment refunded in full; for a partial one the period, auto-renewal and the
  referral days all stay as they were, while the offer promises the period is
  shortened, renewal turned off and bonus days taken back. The owner does that
  by hand — the admin panel has «Выключить автопродление» and day grants.
- **Turning off renewal by email** for someone locked out of the account.
- **Telling users about material changes** by email or through the bot — the
  bot's `/broadcast` reaches every linked chat, there is no tooling for a mass
  email; bump `TERMS_UPDATED` at least.
- **Keeping `/broadcast` to service messages.** The offer calls what the bot
  and the emails send service messages and promises advertising only where the
  law allows; under the advertising law that means the reader's prior consent,
  which nothing in the product collects. A promotion sent with `/broadcast` is
  the owner's call and the owner's risk.

The text was written from the product's behaviour, not by a lawyer. Have it
read by one before relying on it in a dispute.
