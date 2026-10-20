import { secondsInDay } from 'date-fns/constants';

export const SESSION = {
  expiresIn: 30 * secondsInDay,
  updateAge: secondsInDay
} as const;

export const EMAIL_FIELD_BY_PATH: Readonly<Record<string, string>> = {
  '/sign-up/email': 'email',
  '/change-email': 'newEmail'
};

export const AUTH_LOCALE = {
  header: 'x-locale',
  acceptHeader: 'accept-language',
  rememberedOn: ['/sign-up/email', '/sign-in/email', '/get-session'],
  guessedOn: ['/sign-up/email']
} as const;

export const AUTH_PATHS = {
  account: '/account'
} as const;
