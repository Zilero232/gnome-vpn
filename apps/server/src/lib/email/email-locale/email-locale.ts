import { isIncludedIn, isString } from 'remeda';

import type { EmailLocale, LocaleCandidate, LocalizedPathInput } from './email-locale.types';

import { EMAIL_LOCALE } from './email-locale.constants';

export const isEmailLocale = (value: unknown): value is EmailLocale => isString(value) && isIncludedIn(value, EMAIL_LOCALE.all);

export const pickEmailLocale = (candidates: readonly LocaleCandidate[]): EmailLocale => candidates.find(isEmailLocale) ?? EMAIL_LOCALE.fallback;

export const acceptedLocale = (header: LocaleCandidate): EmailLocale | null => {
  const primary = header?.split(',').at(0)?.split(';').at(0)?.split('-').at(0)?.trim().toLowerCase();

  return isEmailLocale(primary) ? primary : null;
};

export const localizedPath = ({ path, locale }: LocalizedPathInput): string => {
  if (locale === EMAIL_LOCALE.fallback) {
    return path;
  }

  return path === '/' ? `/${locale}` : `/${locale}${path}`;
};
