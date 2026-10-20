import type { ReactNode } from 'react';

import type { EmailLocale } from '../../email-locale';

export type EmailAction = {
  url: string;
  label: string;
};

export type BaseEmailProps = {
  locale: EmailLocale;
  preview: string;
  heading: string;
  action?: EmailAction;
  footer?: string;
  children: ReactNode;
};
