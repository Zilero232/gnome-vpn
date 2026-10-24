import { InlineKeyboard } from 'grammy';

import type { BotMessage } from '@/modules/telegram/telegram.types';

import { BOT_TEXT } from '@/modules/telegram/config';

import type { LinkMessageInput } from './link-message.types';

import { html } from '../html';
import { menuButtons } from '../keyboard';

export const linkMessage = ({ locale, intro, url }: LinkMessageInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const markup = new InlineKeyboard()
    .copyText(text.appsCopyLink, url)
    .primary()
    .append(menuButtons({ locale, keys: ['apps'] }));

  return { text: html.paragraphs([intro, html.code(url), text.linkWarning]), markup };
};
