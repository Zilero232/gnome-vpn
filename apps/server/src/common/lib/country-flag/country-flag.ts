import { COUNTRY_CODE, LATIN_A, REGIONAL_INDICATOR_A } from './country-flag.constants';

export const countryFlag = (countryCode: string): string => {
  const code = countryCode.trim().toUpperCase();

  if (!COUNTRY_CODE.test(code)) {
    return '';
  }

  return String.fromCodePoint(...[...code].map((letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LATIN_A));
};
