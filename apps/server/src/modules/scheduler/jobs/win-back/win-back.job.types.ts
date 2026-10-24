import type { AutomaticCode } from '@/modules/promo-codes';

import type { WinBackDue, WinBackRow } from './lib';

export type WinBackCandidate = WinBackRow & {
  id: string;
  userId: string;
};

export type WinBackCodes = Record<WinBackDue['audience'], AutomaticCode | null>;

export type WinBackTouchInput = {
  candidate: WinBackCandidate;
  due: WinBackDue;
  code: AutomaticCode;
};
