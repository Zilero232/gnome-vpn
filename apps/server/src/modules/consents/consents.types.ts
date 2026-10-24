import type { ConsentSource } from '@gnomevpn/schemas';

import type { EmailLocale } from '@/lib/email';

export type SetMarketingInput = {
  userId: string;
  granted: boolean;
  source: ConsentSource;
};

export type RecordPersonalDataInput = {
  userId: string;
  version: string;
  source: ConsentSource;
};

export type UnsubscribeLinkInput = {
  userId: string;
  locale: EmailLocale;
};
