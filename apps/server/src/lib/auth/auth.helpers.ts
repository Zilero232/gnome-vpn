import { isIncludedIn, isNullish, isPlainObject, isString, keys } from 'remeda';

import { env } from '@/config';

import type { EmailLocale } from '../email';
import type { ClaimedEmailInput, ClientCallbackInput } from './auth.types';

import { isEmailLocale, localizedPath } from '../email';
import { AUTH_LOCALE, EMAIL_FIELD_BY_PATH } from './auth.constants';

export const claimedEmail = ({ path, body }: ClaimedEmailInput): string | null => {
  if (!isIncludedIn(path, keys(EMAIL_FIELD_BY_PATH)) || !isPlainObject(body)) {
    return null;
  }

  const value = body[EMAIL_FIELD_BY_PATH[path]];

  return isString(value) ? value : null;
};

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

export const withClientCallback = ({ url, locale, path = '/' }: ClientCallbackInput): string => {
  const parsed = URL.parse(url);

  if (isNullish(parsed)) {
    return url;
  }

  parsed.searchParams.set('callbackURL', new URL(localizedPath({ path, locale }), env.CLIENT_URL).toString());

  return parsed.toString();
};
