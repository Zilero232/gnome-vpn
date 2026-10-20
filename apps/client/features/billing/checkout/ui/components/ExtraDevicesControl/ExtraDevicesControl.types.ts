import type { Limits } from '@gnomevpn/schemas';

export type SlotState = 'free' | 'used';

export type ExtraDevicesControlProps = {
  limits: Limits;
  usedSeats: number;
};
