import { addDays, isAfter, isBefore, subDays } from 'date-fns';
import { isNullish, values } from 'remeda';

import type { AutomaticCode } from '@/modules/promo-codes';

import { NOTICE_CLAIM } from '@/core';
import { WIN_BACK } from '@/modules/scheduler/config';
import { isTrialPeriod } from '@/modules/subscription';

import type {
  AudienceOfInput,
  LiveCodeInput,
  WinBackAudience,
  WinBackDue,
  WinBackDueInput,
  WinBackMessage,
  WinBackMessageInput,
  WinBackRow,
  WinBackTouch,
  WinBackWindow
} from './win-back-touch.types';

const TOUCHES = values(WIN_BACK.touchDays);

const audienceOf = ({ row, hasPaid }: AudienceOfInput): WinBackAudience | null => {
  if (!isTrialPeriod(row)) {
    return 'lapsed';
  }

  return hasPaid ? null : 'trial';
};

const TOUCH_NUMBERS = [1, 2] as const satisfies WinBackTouch[];

export const sentTouches = ({ currentPeriodEnd, claims }: WinBackRow): number => {
  const ref = currentPeriodEnd.toISOString();
  const sent = TOUCH_NUMBERS.filter((touch) => claims.some((claim) => claim.ref === ref && claim.notice === NOTICE_CLAIM.winBackTouch[touch]));

  return Math.max(0, ...sent);
};

export const winBackWindow = (now: Date): WinBackWindow => ({
  from: subDays(now, Math.max(...TOUCHES.map((touch) => touch.second)) + WIN_BACK.lateDays),
  to: subDays(now, Math.min(...TOUCHES.map((touch) => touch.first)))
});

export const winBackDue = ({ row, hasPaid, now }: WinBackDueInput): WinBackDue | null => {
  const audience = audienceOf({ row, hasPaid });

  if (isNullish(audience)) {
    return null;
  }

  const days = WIN_BACK.touchDays[audience];
  const sent = sentTouches(row);
  const firstAt = addDays(row.currentPeriodEnd, days.first);
  const secondAt = addDays(row.currentPeriodEnd, days.second);
  const lateAt = addDays(secondAt, WIN_BACK.lateDays);

  if (sent < 2 && !isBefore(now, secondAt) && isBefore(now, lateAt)) {
    return { audience, touch: 2 };
  }

  if (sent < 1 && !isBefore(now, firstAt) && isBefore(now, secondAt)) {
    return { audience, touch: 1 };
  }

  return null;
};

export const winBackMessage = ({ audience, offer }: WinBackMessageInput): WinBackMessage | null => {
  if (offer.kind === 'used') {
    return null;
  }

  const notice = offer.kind === 'granted' ? WIN_BACK.offerNotice[audience] : WIN_BACK.reminderNotice;

  return { notice, percent: offer.percent };
};

export const liveCode = ({ code, now }: LiveCodeInput): AutomaticCode | null => {
  if (isNullish(code) || isNullish(code.expiresAt)) {
    return code;
  }

  return isAfter(code.expiresAt, now) ? code : null;
};
