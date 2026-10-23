import type { NOTICE_CLAIM } from '../../../../../../core';
import type { AutoDiscountOffer, AutomaticCode } from '../../../../../promo-codes';
import type { NoticeKey } from '../../../../../telegram/telegram.types';
import type { WIN_BACK } from '../../../../config';

export type WinBackAudience = keyof typeof WIN_BACK.codes;

export type WinBackTouch = keyof typeof NOTICE_CLAIM.winBackTouch;

export type WinBackClaim = {
  notice: string;
  ref: string;
};

export type WinBackRow = {
  currentPeriodEnd: Date;
  trialStartedAt: Date | null;
  claims: WinBackClaim[];
};

export type AudienceOfInput = {
  row: WinBackRow;
  hasPaid: boolean;
};

export type WinBackDueInput = AudienceOfInput & {
  now: Date;
};

export type WinBackDue = {
  audience: WinBackAudience;
  touch: WinBackTouch;
};

export type WinBackWindow = {
  from: Date;
  to: Date;
};

export type WinBackMessageInput = {
  audience: WinBackAudience;
  offer: AutoDiscountOffer;
};

export type WinBackMessage = {
  notice: NoticeKey;
  percent: number;
};

export type LiveCodeInput = {
  code: AutomaticCode | null;
  now: Date;
};
