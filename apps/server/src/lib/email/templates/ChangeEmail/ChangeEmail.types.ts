import type { EmailLocale } from '../../email-locale';

export type ChangeEmailProps = {
  url: string;
  newEmail: string;
  locale: EmailLocale;
};
