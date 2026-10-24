import { Text } from 'react-email';

import { EMAIL_TEXT, fillEmail } from '@/lib/email/email-text';

import type { NoticeEmailProps } from './NoticeEmail.types';

import { BaseEmail } from '../BaseEmail';
import { emailStyles } from '../email-styles';

export const NoticeEmail = ({ notice, url, fill, locale, unsubscribeUrl }: NoticeEmailProps) => {
  const common = EMAIL_TEXT[locale].common;
  const copy = EMAIL_TEXT[locale].notices[notice];
  const heading = fillEmail({ text: copy.heading, fill });

  return (
    <BaseEmail
      action={{ url, label: copy.action }}
      footer={unsubscribeUrl ? common.promoFooter : common.footer}
      heading={heading}
      locale={locale}
      preview={fillEmail({ text: copy.subject, fill })}
      unsubscribe={unsubscribeUrl ? { url: unsubscribeUrl, label: common.unsubscribeAction } : undefined}
    >
      {copy.body.map((paragraph) => (
        <Text key={paragraph} style={emailStyles.text}>
          {fillEmail({ text: paragraph, fill })}
        </Text>
      ))}
    </BaseEmail>
  );
};
