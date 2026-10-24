export type EmailMessages = typeof import('../locales/ru.json');

export type EmailNoticeKey = keyof EmailMessages['notices'];

export type EmailActionKey = 'change' | 'reset' | 'verify';

export type EmailToken = 'amount' | 'card' | 'code' | 'date' | 'email' | 'percent';

export type EmailFill = Partial<Record<EmailToken, string>>;

export type FillEmailInput = {
  text: string;
  fill: EmailFill;
};
