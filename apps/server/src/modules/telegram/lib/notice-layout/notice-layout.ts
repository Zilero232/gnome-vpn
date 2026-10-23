import { isNullish } from 'remeda';

import type { NoticeLayout, NoticeLayoutInput } from './notice-layout.types';

import { html } from '../html';

export const noticeLayout = ({ text, markup, prompt }: NoticeLayoutInput): NoticeLayout => {
  if (isNullish(prompt)) {
    return { text, markup, followUp: null };
  }

  if (markup === 'main') {
    return { text, markup, followUp: prompt };
  }

  return { text: html.paragraphs([text, prompt]), markup: [...markup, 'invite'], followUp: null };
};
