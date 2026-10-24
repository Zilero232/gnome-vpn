import type { EmailLocale } from '@/lib/email/email-locale';

export type VerifyEmailProps = {
  url: string;
  locale: EmailLocale;
};
