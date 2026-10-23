import type { AdminGiftState } from '@gnomevpn/schemas';

export type GiftStateWhereInput = {
  state: AdminGiftState | undefined;
  now: Date;
};
