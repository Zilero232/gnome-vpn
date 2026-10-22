import { countryName } from '@gnomevpn/schemas';
import { isTruthy } from 'remeda';

import type { NodeLabelInput } from './wireguard-view.types';

import { countryFlag } from '../../../../common/lib';
import { CITY_SEPARATOR } from './wireguard-view.constants';

export const nodeLabel = ({ node, locale }: NodeLabelInput): string => {
  const flag = countryFlag(node.countryCode);
  const country = [flag, countryName({ locale, countryCode: node.countryCode, fallback: node.country })].filter(isTruthy).join(' ');

  return [country, node.city].filter(isTruthy).join(CITY_SEPARATOR);
};
