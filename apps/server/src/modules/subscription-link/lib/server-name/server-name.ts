import { isTruthy } from 'remeda';

import type { ServerNameInput } from './server-name.types';

import { countryFlag } from '../../../../common/lib';

export const serverName = ({ country, countryCode, city, suffix }: ServerNameInput): string =>
  [countryFlag(countryCode), country, city, suffix].filter(isTruthy).join(' ');
