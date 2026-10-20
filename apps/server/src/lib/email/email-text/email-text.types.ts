import type { EMAIL_TOKENS } from './email-text.constants';

export type EmailMessages = typeof import('../locales/ru.json');

export type EmailNoticeKey = keyof EmailMessages['notices'];

export type EmailFill = Partial<Record<(typeof EMAIL_TOKENS)[number], string>>;

export type FillEmailInput = {
  text: string;
  fill: EmailFill;
};
