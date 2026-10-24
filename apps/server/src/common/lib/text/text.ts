import { entries } from 'remeda';

import type { FillTokensInput, PluralizeInput } from './text.types';

import { COUNTRY_CODE, DEFAULT_PLURAL_LOCALE, LATIN_A, REGIONAL_INDICATOR_A } from './text.constants';

export const countryFlag = (countryCode: string): string => {
  const code = countryCode.trim().toUpperCase();

  if (!COUNTRY_CODE.test(code)) {
    return '';
  }

  return String.fromCodePoint(...[...code].map((letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LATIN_A));
};

export const pluralize = ({ count, forms, locale = DEFAULT_PLURAL_LOCALE }: PluralizeInput): string =>
  forms[new Intl.PluralRules(locale).select(count)] ?? forms.many;

export const fillTokens = ({ text, fill }: FillTokensInput): string =>
  entries(fill).reduce((carry, [token, value]) => carry.replaceAll(`{${token}}`, () => value), text);
