import { isPlainObject, isString } from 'remeda';

import type { EmailLocale } from '../email';

import { isEmailLocale } from '../email';
import { AUTH_LOCALE } from './auth.constants';

export const headerLocale = (headers: Headers | null | undefined): EmailLocale | null => {
  const value = headers?.get(AUTH_LOCALE.header)?.trim().toLowerCase();

  return isEmailLocale(value) ? value : null;
};

export const returnedUserId = (returned: unknown): string | null => {
  if (!isPlainObject(returned) || !isPlainObject(returned.user)) {
    return null;
  }

  const { id } = returned.user;

  return isString(id) ? id : null;
};
