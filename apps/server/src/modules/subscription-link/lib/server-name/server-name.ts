import { isTruthy } from 'remeda';

import { countryFlag } from '@/common/lib';

import type { ServerNameInput } from './server-name.types';

export const serverName = ({ country, countryCode }: ServerNameInput): string => [countryFlag(countryCode), country].filter(isTruthy).join(' ');
