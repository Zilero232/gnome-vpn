import { Text } from 'react-email';

import type { ResetPasswordProps } from './ResetPassword.types';

import { EMAIL_TEXT } from '../../email-text';
import { BaseEmail } from '../BaseEmail';
import { emailStyles } from '../email-styles';

export const ResetPassword = ({ url, locale }: ResetPasswordProps) => {
  const copy = EMAIL_TEXT[locale].reset;

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
