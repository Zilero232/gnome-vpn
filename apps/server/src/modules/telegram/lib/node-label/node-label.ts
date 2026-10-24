import { countryName } from '@gnomevpn/schemas';
import { isTruthy } from 'remeda';

import { countryFlag } from '@/common/lib';

import type { NodeLabelInput } from './node-label.types';

import { CITY_SEPARATOR } from './node-label.constants';

export const nodeLabel = ({ node, locale }: NodeLabelInput): string => {
  const flag = countryFlag(node.countryCode);
  const country = [flag, countryName({ locale, countryCode: node.countryCode, fallback: node.country })].filter(isTruthy).join(' ');

  return [country, node.city].filter(isTruthy).join(CITY_SEPARATOR);
};
