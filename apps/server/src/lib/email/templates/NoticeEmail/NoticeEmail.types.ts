import type { EmailLocale } from '@/lib/email/email-locale';
import type { EmailFill, EmailNoticeKey } from '@/lib/email/email-text';

export type NoticeEmailProps = {
  notice: EmailNoticeKey;
  url: string;
  fill: EmailFill;
  locale: EmailLocale;
  unsubscribeUrl?: string;
};
