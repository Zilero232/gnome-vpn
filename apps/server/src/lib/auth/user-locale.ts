import { isNullish } from 'remeda';

import { basePrisma } from '@/core';

import type { EmailLocale } from '../email';
import type { EmailLocaleForInput, RememberLocaleInput } from './auth.types';

import { acceptedLocale, pickEmailLocale } from '../email';
import { AUTH_LOCALE } from './auth.constants';
import { headerLocale } from './request-locale';

const REMEMBERED: readonly string[] = AUTH_LOCALE.rememberedOn;

const GUESSED: readonly string[] = AUTH_LOCALE.guessedOn;

export const emailLocaleFor = async ({ userId, headers }: EmailLocaleForInput): Promise<EmailLocale> => {
  const explicit = headerLocale(headers);

  if (explicit) {
    return explicit;
  }

  const user = await basePrisma.user.findUnique({
    where: { id: userId },
    select: { locale: true, telegramAccount: { select: { locale: true } } }
  });

  return pickEmailLocale([user?.locale, user?.telegramAccount?.locale, acceptedLocale(headers?.get(AUTH_LOCALE.acceptHeader))]);
};

export const rememberLocale = async ({ path, headers, userId }: RememberLocaleInput): Promise<void> => {
  if (isNullish(userId) || !REMEMBERED.includes(path)) {
    return;
  }

  const locale = headerLocale(headers) ?? (GUESSED.includes(path) ? acceptedLocale(headers?.get(AUTH_LOCALE.acceptHeader)) : null);

  if (isNullish(locale)) {
    return;
  }

  await basePrisma.user.updateMany({
    where: { id: userId, OR: [{ locale: null }, { locale: { not: locale } }] },
    data: { locale }
  });
};
