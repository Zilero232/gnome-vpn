import { keys } from 'remeda';

import type { EmailLocale } from '../email-locale';
import type { EmailMessages, EmailNoticeKey, FillEmailInput } from './email-text.types';

import { fillTokens } from '../../../common/lib';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

export const EMAIL_TEXT: Record<EmailLocale, EmailMessages> = { ru, en };

const NOTICE_KEYS: readonly string[] = keys(ru.notices);

export const isEmailNotice = (value: string): value is EmailNoticeKey => NOTICE_KEYS.includes(value);

export const fillEmail = ({ text, fill }: FillEmailInput): string => fillTokens({ text, fill });
