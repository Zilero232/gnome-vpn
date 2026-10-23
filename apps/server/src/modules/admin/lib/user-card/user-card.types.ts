import type { DeviceList } from '@gnomevpn/schemas';

import type { Prisma } from '../../../../../generated';
import type { INVITED_SELECT, REDEMPTION_SELECT, USER_CARD_SELECT } from '../../config';
import type { GiftRow, PaymentRow } from '../row-views';

export type CardUserRow = Prisma.UserGetPayload<{ select: typeof USER_CARD_SELECT }>;

export type InvitedRow = Prisma.ReferralGetPayload<{ select: typeof INVITED_SELECT }>;

export type RedemptionRow = Prisma.PromoRedemptionGetPayload<{ select: typeof REDEMPTION_SELECT }>;

export type UserCardInput = {
  user: CardUserRow;
  devices: DeviceList;
  payments: PaymentRow[];
  invited: InvitedRow[];
  invitedTotal: number;
  redemptions: RedemptionRow[];
  gifts: GiftRow[];
  now: Date;
};
