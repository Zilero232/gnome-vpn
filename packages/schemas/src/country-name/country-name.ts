import type { CountryNameInput } from './country-name.types';

export const countryName = ({ locale, countryCode, fallback }: CountryNameInput): string => {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode.toUpperCase()) ?? fallback;
  } catch {
    return fallback;
  }
};
