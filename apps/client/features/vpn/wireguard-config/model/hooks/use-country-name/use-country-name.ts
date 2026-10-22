'use client';

import type { WireguardNode } from '@gnomevpn/schemas';

import { countryName } from '@gnomevpn/schemas';
import { useLocale } from 'next-intl';

export const useCountryName = () => {
  const locale = useLocale();

  return (node: Pick<WireguardNode, 'country' | 'countryCode'>) => countryName({ locale, countryCode: node.countryCode, fallback: node.country });
};
