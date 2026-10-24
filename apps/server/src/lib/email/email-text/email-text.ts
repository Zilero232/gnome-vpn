import { isIncludedIn, keys } from 'remeda';

import { fillTokens } from '@/common/lib';

import type { EmailLocale } from '../email-locale';
import type { EmailMessages, EmailNoticeKey, FillEmailInput } from './email-text.types';

import en from '../locales/en.json';
import ru from '../locales/ru.json';

export const EMAIL_TEXT: Record<EmailLocale, EmailMessages> = { ru, en };

const NOTICE_KEYS = keys(ru.notices);

export const isEmailNotice = (value: string): value is EmailNoticeKey => isIncludedIn(value, NOTICE_KEYS);

export const fillEmail = ({ text, fill }: FillEmailInput): string => fillTokens({ text, fill });
