import type { EmailLocale } from '../../email-locale';
import type { EmailFill, EmailNoticeKey } from '../../email-text';

export type NoticeEmailProps = {
  notice: EmailNoticeKey;
  url: string;
  fill: EmailFill;
  locale: EmailLocale;
  unsubscribeUrl?: string;
};
