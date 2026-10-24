import { Text } from 'react-email';

import { EMAIL_TEXT, fillEmail } from '@/lib/email/email-text';

import type { ActionEmailProps } from './ActionEmail.types';

import { BaseEmail } from '../BaseEmail';
import { emailStyles } from '../email-styles';

export const ActionEmail = ({ copy, url, fill = {}, locale }: ActionEmailProps) => {
  const text = EMAIL_TEXT[locale][copy];

  return (
    <BaseEmail action={{ url, label: text.action }} heading={text.heading} locale={locale} preview={text.preview}>
      {text.body.map((paragraph) => (
        <Text key={paragraph} style={emailStyles.text}>
          {fillEmail({ text: paragraph, fill })}
        </Text>
      ))}
    </BaseEmail>
  );
};
