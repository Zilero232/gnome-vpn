import { Text } from 'react-email';

import type { ChangeEmailProps } from './ChangeEmail.types';

import { EMAIL_TEXT, fillEmail } from '../../email-text';
import { BaseEmail } from '../BaseEmail';
import { emailStyles } from '../email-styles';

export const ChangeEmail = ({ url, newEmail, locale }: ChangeEmailProps) => {
  const copy = EMAIL_TEXT[locale].change;

  return (
    <BaseEmail action={{ url, label: copy.action }} heading={copy.heading} locale={locale} preview={copy.preview}>
      {copy.body.map((paragraph) => (
        <Text key={paragraph} style={emailStyles.text}>
          {fillEmail({ text: paragraph, fill: { email: newEmail } })}
        </Text>
      ))}
    </BaseEmail>
  );
};
