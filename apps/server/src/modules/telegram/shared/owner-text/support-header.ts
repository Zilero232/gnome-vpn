import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { isNullish, isTruthy } from 'remeda';
import { match, P } from 'ts-pattern';

import { BOT_TEXT } from '@/modules/telegram/config';

import type { AccessLineInput, SupportHeaderInput } from './owner-text.types';

import { fillText, formatDate, planLabel, resolveLocale } from '../text';

const accessLine = ({ account, locale }: AccessLineInput): string => {
  const text = BOT_TEXT[locale];
  const date = formatDate({ iso: account.currentPeriodEnd?.toISOString() ?? null, locale });

  return match(account)
    .with({ period: 'paid' }, ({ plan }) => fillText({ text: text.supportPaid, fill: { date, plan: planLabel({ planId: plan, locale }) } }))
    .with({ period: 'trial' }, () => fillText({ text: text.supportTrial, fill: { date } }))
    .with({ currentPeriodEnd: P.nullish }, () => text.supportNever)
    .otherwise(() => fillText({ text: text.supportLapsed, fill: { date } }));
};

export const supportHeader = ({ sender, account, locale }: SupportHeaderInput): string => {
  const text = BOT_TEXT[locale];
  const name = [sender.first_name, sender.last_name].filter(isTruthy).join(' ');
  const who = isNullish(sender.username) ? name : `${name} @${sender.username}`;
  const title = fillText({ text: text.supportHeader, fill: { name: who, id: String(sender.id) } });

  if (isNullish(account)) {
    return [title, fillText({ text: text.supportNoAccount, fill: { locale: resolveLocale(sender.language_code) } })].join('\n');
  }

  const contact = fillText({
    text: text.supportAccount,
    fill: {
      email: isPlaceholderEmail(account.email) ? text.supportNoEmail : account.email,
      locale: account.locale,
      count: String(account.deviceCount)
    }
  });

  return [title, contact, accessLine({ account, locale })].join('\n');
};
