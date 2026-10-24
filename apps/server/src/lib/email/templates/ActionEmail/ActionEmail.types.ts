import type { EmailLocale } from '@/lib/email/email-locale';
import type { EmailActionKey, EmailFill } from '@/lib/email/email-text';

export type ActionEmailProps = {
  copy: EmailActionKey;
  url: string;
  fill?: EmailFill;
  locale: EmailLocale;
};
