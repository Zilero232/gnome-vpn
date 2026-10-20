import { Text } from 'react-email';

import type { NoticeEmailProps } from './NoticeEmail.types';

import { EMAIL_TEXT, fillEmail } from '../../email-text';
import { BaseEmail } from '../BaseEmail';
import { emailStyles } from '../email-styles';

export const NoticeEmail = ({ notice, url, fill, locale }: NoticeEmailProps) => {
  const copy = EMAIL_TEXT[locale].notices[notice];
  const heading = fillEmail({ text: copy.heading, fill });

  return (
    <BaseEmail
      action={{ url, label: copy.action }}
      footer={EMAIL_TEXT[locale].common.footer}
      heading={heading}
      locale={locale}
      preview={fillEmail({ text: copy.subject, fill })}
    >
      {copy.body.map((paragraph) => (
        <Text key={paragraph} style={emailStyles.text}>
          {fillEmail({ text: paragraph, fill })}
        </Text>
      ))}
    </BaseEmail>
  );
};
