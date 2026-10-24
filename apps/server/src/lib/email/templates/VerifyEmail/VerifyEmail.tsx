import { Text } from 'react-email';

import { EMAIL_TEXT } from '@/lib/email/email-text';

import type { VerifyEmailProps } from './VerifyEmail.types';

import { BaseEmail } from '../BaseEmail';
import { emailStyles } from '../email-styles';

export const VerifyEmail = ({ url, locale }: VerifyEmailProps) => {
  const copy = EMAIL_TEXT[locale].verify;

  return (
    <BaseEmail action={{ url, label: copy.action }} heading={copy.heading} locale={locale} preview={copy.preview}>
      {copy.body.map((paragraph) => (
        <Text key={paragraph} style={emailStyles.text}>
          {paragraph}
        </Text>
      ))}
    </BaseEmail>
  );
};
