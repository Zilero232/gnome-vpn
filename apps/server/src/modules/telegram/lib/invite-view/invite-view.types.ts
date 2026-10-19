import type { ReferralOverview } from '@gnomevpn/schemas';

import type { BotLocale } from '../../telegram.types';

export type InviteViewInput = {
  overview: ReferralOverview;
  locale: BotLocale;
};

export type ShareUrlInput = {
  url: string;
  text: string;
};
