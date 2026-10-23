'use client';

import { countryName } from '@gnomevpn/schemas';
import { useLocale } from 'next-intl';

import type { CountryNameSource } from './use-country-name.types';

export const useCountryName = () => {
  const locale = useLocale();

  return ({ countryCode, country }: CountryNameSource) => countryName({ locale, countryCode, fallback: country ?? countryCode });
};
