import { referralReward } from '@gnomevpn/schemas';
import { isNullish } from 'remeda';

import type { InviteLineInput, NoticeLayout, NoticeLayoutInput } from './notify.types';

import { BOT_TEXT } from '../config';
import { dayCount, fillText, html, planLabel } from '../shared/text';

export const noticeLayout = ({ text, markup, prompt }: NoticeLayoutInput): NoticeLayout => {
  if (isNullish(prompt)) {
    return { text, markup, followUp: null };
  }

  if (markup === 'main') {
    return { text, markup, followUp: prompt };
  }

  return { text: html.paragraphs([text, prompt]), markup: [...markup, 'invite'], followUp: null };
};

export const inviteLine = ({ planId, locale }: InviteLineInput): string => {
  const reward = referralReward(planId);

  return fillText({
    text: BOT_TEXT[locale].noticeInvite,
    fill: {
      plan: planLabel({ planId, locale }),
      referrer: dayCount({ days: reward.referrerDays, locale }),
      friend: dayCount({ days: reward.friendDays, locale })
    }
  });
};
