import { ADMIN_PERIODS, ADMIN_USER_FILTERS, periodKindSchema, planIdSchema } from '@gnomevpn/schemas';
import { parseAsString, parseAsStringLiteral } from 'nuqs';

export const USER_FILTERS = {
  scope: 'users',
  parsers: {
    query: parseAsString.withDefault(''),
    access: parseAsStringLiteral(periodKindSchema.options),
    plan: parseAsStringLiteral(planIdSchema.options),
    autoRenew: parseAsStringLiteral(ADMIN_USER_FILTERS.autoRenew),
    telegram: parseAsStringLiteral(ADMIN_USER_FILTERS.telegram),
    email: parseAsStringLiteral(ADMIN_USER_FILTERS.email),
    period: parseAsStringLiteral(ADMIN_PERIODS).withDefault(ADMIN_USER_FILTERS.defaultPeriod)
  }
} as const;

export const USER_SEARCH = {
  debounceMs: 300
} as const;
