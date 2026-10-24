import { entries } from 'remeda';

import type { FillTokensInput, PluralizeInput } from './text.types';

import { COUNTRY_FLAG, DEFAULT_PLURAL_LOCALE } from './text.constants';

export const countryFlag = (countryCode: string): string => {
  const code = countryCode.trim().toUpperCase();

  if (!COUNTRY_FLAG.countryCode.test(code)) {
    return '';
  }

  return String.fromCodePoint(...[...code].map((letter) => COUNTRY_FLAG.regionalIndicatorA + letter.charCodeAt(0) - COUNTRY_FLAG.latinA));
};

export const pluralize = ({ count, forms, locale = DEFAULT_PLURAL_LOCALE }: PluralizeInput): string =>
  forms[new Intl.PluralRules(locale).select(count)] ?? forms.many;

export const fillTokens = ({ text, fill }: FillTokensInput): string =>
  entries(fill).reduce((carry, [token, value]) => carry.replaceAll(`{${token}}`, () => value), text);
