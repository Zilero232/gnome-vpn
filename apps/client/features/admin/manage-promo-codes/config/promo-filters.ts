import { ADMIN_CAMPAIGN_STATES, ADMIN_GIFT_STATES, CAMPAIGN_KINDS } from '@gnomevpn/schemas';
import { parseAsStringLiteral } from 'nuqs';

export const CAMPAIGN_FILTERS = {
  scope: 'campaigns',
  parsers: {
    state: parseAsStringLiteral(ADMIN_CAMPAIGN_STATES),
    kind: parseAsStringLiteral(CAMPAIGN_KINDS)
  }
} as const;

export const GIFT_FILTERS = {
  scope: 'gifts',
  parsers: {
    state: parseAsStringLiteral(ADMIN_GIFT_STATES)
  }
} as const;
