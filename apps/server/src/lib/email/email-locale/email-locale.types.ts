import type { EMAIL_LOCALE } from './email-locale.constants';

export type EmailLocale = (typeof EMAIL_LOCALE.all)[number];

export type LocaleCandidate = string | null | undefined;

export type LocalizedPathInput = {
  path: string;
  locale: EmailLocale;
};
