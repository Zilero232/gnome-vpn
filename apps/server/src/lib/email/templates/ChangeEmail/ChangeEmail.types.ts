import type { EmailLocale } from '@/lib/email/email-locale';

export type ChangeEmailProps = {
  url: string;
  newEmail: string;
  locale: EmailLocale;
};
