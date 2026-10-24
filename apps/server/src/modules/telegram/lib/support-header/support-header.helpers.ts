import { match, P } from 'ts-pattern';

import { BOT_TEXT } from '@/modules/telegram/config';

import type { AccessLineInput } from './support-header.types';

import { fillText } from '../fill-text';
import { formatDate } from '../format-date';
import { planLabel } from '../plan-label';

export const accessLine = ({ account, locale }: AccessLineInput): string => {
  const text = BOT_TEXT[locale];
  const date = formatDate({ iso: account.currentPeriodEnd?.toISOString() ?? null, locale });

  return match(account)
    .with({ period: 'paid' }, ({ plan }) => fillText({ text: text.supportPaid, fill: { date, plan: planLabel({ planId: plan, locale }) } }))
    .with({ period: 'trial' }, () => fillText({ text: text.supportTrial, fill: { date } }))
    .with({ currentPeriodEnd: P.nullish }, () => text.supportNever)
    .otherwise(() => fillText({ text: text.supportLapsed, fill: { date } }));
};
