import { findPlan, planDiscountPercent, planMonthlyRub, PLANS } from '@gnomevpn/schemas';
import { millisecondsInDay } from 'date-fns/constants';
import { InlineKeyboard } from 'grammy';
import { firstBy, isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { BotLocale, BotMessage } from '../telegram.types';
import type {
  AutoRenewPanelInput,
  CheckoutIntroInput,
  DaysLeftInput,
  LinkMessageInput,
  PlanButtonLabelInput,
  PlansTextInput,
  StatusTextInput
} from './subscription.types';

import { BOT_TEXT, CALLBACK_VALUE } from '../config';
import { callbackData } from '../shared/callback-data';
import { menuButtons, offerKeys } from '../shared/keyboard';
import { dayCount, fillLabel, fillText, formatDate, html, planLabel } from '../shared/text';

const BEST_PLAN = firstBy(PLANS, [(plan) => planDiscountPercent(plan.id), 'desc']);

const HIGHLIGHTED_PLAN_ID = planDiscountPercent(BEST_PLAN.id) > 0 ? BEST_PLAN.id : null;

export const daysLeft = ({ until, now, locale }: DaysLeftInput): string => {
  const days = Math.max(0, Math.ceil((until.getTime() - now.getTime()) / millisecondsInDay));

  return dayCount({ days, locale });
};

export const statusText = ({
  period,
  plan,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  hasPaymentMethod,
  isRecurringAvailable,
  limits,
  deviceCount,
  locale,
  now = new Date()
}: StatusTextInput): string => {
  const text = BOT_TEXT[locale];

  if (period === 'none' || !currentPeriodEnd) {
    return text.inactive;
  }

  const isTrial = period === 'trial';
  const footnote = match({ isTrial, cancelAtPeriodEnd, canCharge: hasPaymentMethod && isRecurringAvailable })
    .with({ isTrial: true }, () => text.trialEnds)
    .with({ cancelAtPeriodEnd: true }, () => text.willNotRenew)
    .with({ canCharge: false }, () => text.renewManual)
    .otherwise(() => text.willRenew);

  const card = [
    fillText({ text: text.statusUntil, fill: { date: formatDate({ iso: currentPeriodEnd, locale }) } }),
    fillText({ text: text.statusLeft, fill: { days: daysLeft({ until: new Date(currentPeriodEnd), now, locale }) } }),
    fillText({ text: text.statusPlan, fill: { plan: isTrial ? text.trialPeriod : planLabel({ planId: plan, locale }) } }),
    fillText({ text: text.statusDevices, fill: { count: String(deviceCount), limit: String(limits.deviceLimit) } })
  ].join('\n');

  return html.paragraphs([text.statusTitle, `${html.quote(card)}\n${html.italic(footnote)}`]);
};

export const autoRenewPanel = ({ status, locale }: AutoRenewPanelInput): BotMessage => {
  const text = BOT_TEXT[locale];

  return match(status)
    .returnType<BotMessage>()
    .with({ period: 'none' }, () => ({
      text: text.inactive,
      markup: menuButtons({ locale, keys: offerKeys(status) })
    }))
    .with({ period: 'trial' }, () => ({
      text: text.autoRenewTrial,
      markup: menuButtons({ locale, keys: ['renew'] })
    }))
    .with({ isRecurringAvailable: false }, () => ({
      text: text.autoRenewUnavailable,
      markup: menuButtons({ locale, keys: ['renew'] })
    }))
    .with({ cancelAtPeriodEnd: true, hasPaymentMethod: false }, () => ({
      text: text.autoRenewNeedsCard,
      markup: menuButtons({ locale, keys: ['website'] })
    }))
    .with({ cancelAtPeriodEnd: true }, ({ currentPeriodEnd }) => ({
      text: fillText({ text: text.autoRenewOff, fill: { date: formatDate({ iso: currentPeriodEnd, locale }) } }),
      markup: new InlineKeyboard().text(text.autoRenewEnable, callbackData.autoRenew(CALLBACK_VALUE.switch.on)).success()
    }))
    .otherwise(() => ({
      text: text.autoRenewOn,
      markup: new InlineKeyboard().text(text.autoRenewDisable, callbackData.autoRenew(CALLBACK_VALUE.switch.off)).danger()
    }));
};

export const planButtonLabel = ({ plan, locale }: PlanButtonLabelInput): string => {
  const text = BOT_TEXT[locale];
  const discount = planDiscountPercent(plan.id);
  const label = `${plan.months} ${text.monthShort} — ${fillLabel({ text: text.planPrice, fill: { price: String(plan.priceRub) } })}`;

  return discount > 0 ? `${label} · ${fillLabel({ text: text.planBest, fill: { percent: String(discount) } })}` : label;
};

export const checkoutIntro = ({ planId, amountRub, discount, termsUrl, locale }: CheckoutIntroInput): string => {
  const text = BOT_TEXT[locale];
  const intro = fillText({ text: text.checkoutIntro, fill: { plan: planLabel({ planId, locale }), amount: String(amountRub) } });
  const terms = fillText({ text: text.checkoutTerms, fill: { link: termsUrl } });

  if (isNullish(discount)) {
    return html.paragraphs([intro, terms]);
  }

  const fill = { percent: String(discount.percent), code: discount.code, price: String(findPlan(planId).priceRub) };

  return html.paragraphs([intro, fillText({ text: text.checkoutDiscount, fill }), terms]);
};

export const plansText = ({ locale, isExtending }: PlansTextInput): string => {
  const text = BOT_TEXT[locale];
  const lines = PLANS.map((plan) => {
    const price = fillText({ text: text.planPrice, fill: { price: String(plan.priceRub) } });
    const perMonth = fillText({ text: text.planPerMonth, fill: { price: String(planMonthlyRub(plan.id)) } });

    return `${html.bold(planLabel({ planId: plan.id, locale }))} — ${price} · ${perMonth}`;
  });

  return html.paragraphs([isExtending ? text.choosePlanStacked : text.choosePlan, html.quote(lines.join('\n'))]);
};

export const planKeyboard = (locale: BotLocale): InlineKeyboard =>
  InlineKeyboard.from(
    PLANS.map((plan) => {
      const style = plan.id === HIGHLIGHTED_PLAN_ID ? 'success' : undefined;

      return [InlineKeyboard.text({ text: planButtonLabel({ plan, locale }), style }, callbackData.plan(plan.id))];
    })
  );

export const linkMessage = ({ locale, intro, url }: LinkMessageInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const markup = new InlineKeyboard()
    .copyText(text.appsCopyLink, url)
    .primary()
    .append(menuButtons({ locale, keys: ['apps'] }));

  return { text: html.paragraphs([intro, html.code(url), text.linkWarning]), markup };
};
