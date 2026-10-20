import type { EmailLocale } from '../email';

export type ClientCallbackInput = {
  url: string;
  locale: EmailLocale;
  path?: string;
};

export type EmailLocaleForInput = {
  userId: string;
  headers?: Headers | null;
};

export type RememberLocaleInput = {
  path: string;
  headers?: Headers | null;
  userId: string | null;
};

export type ClaimedEmailInput = {
  path: string;
  body: unknown;
};
