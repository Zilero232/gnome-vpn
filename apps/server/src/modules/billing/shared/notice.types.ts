import type { RewardOutcome } from '@/modules/referrals';

import type { PaymentRow, Purchase, SettleOutcome } from './payment.types';

export type SettledNoticeInput = {
  row: PaymentRow;
  userId: string;
  purchase: Purchase;
  outcome: SettleOutcome;
};

export type AnnounceInput = {
  row: PaymentRow;
  userId: string;
  purchase: Purchase;
  giftCode: string | null;
};

export type AnnounceReferralInput = {
  friendId: string;
  outcome: RewardOutcome;
};

export type ChargeFailedInput = {
  userId: string;
  reason: string | null;
  isCardDropped: boolean;
};
