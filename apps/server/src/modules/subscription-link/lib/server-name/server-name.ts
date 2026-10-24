import { isTruthy } from 'remeda';

import { countryFlag } from '@/common/lib';

import type { ServerNameInput } from './server-name.types';

export const serverName = ({ country, countryCode, city, suffix }: ServerNameInput): string =>
  [countryFlag(countryCode), country, city, suffix].filter(isTruthy).join(' ');
