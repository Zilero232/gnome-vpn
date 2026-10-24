import type { EmailLocale } from '@/lib/email/email-locale';

export type ResetPasswordProps = {
  url: string;
  locale: EmailLocale;
};
