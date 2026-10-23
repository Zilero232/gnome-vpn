import type { PaymentKind } from '../../../../../../../generated';
import type { NoticeKey } from '../../../../../telegram/telegram.types';

export type CheckoutRow = {
  id: string;
  userId: string | null;
  kind: PaymentKind;
  createdAt: Date;
};

export type AbandonedCheckout = {
  id: string;
  userId: string;
  createdAt: Date;
  notice: NoticeKey;
};
