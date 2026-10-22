import { PLANS, REFERRAL_POLICY, referralReward } from '@gnomevpn/schemas';
import { InlineKeyboard } from 'grammy';

import type { BotMessage } from '../../telegram.types';
import type { InviteViewInput, ShareUrlInput } from './invite-view.types';

import { BOT_TEXT, INVITE_SHARE, NEW_LINE } from '../../config';
import { dayCount } from '../day-count';
import { fillText } from '../fill-text';
import { html } from '../html';
import { planLabel } from '../plan-label';

export const shareUrl = ({ url, text }: ShareUrlInput): string => {
  const share = new URL(INVITE_SHARE.base);

  share.searchParams.set(INVITE_SHARE.urlParam, url);
  share.searchParams.set(INVITE_SHARE.textParam, text);

  return share.toString();
};

export const inviteView = ({ overview, locale }: InviteViewInput): BotMessage => {
  const text = BOT_TEXT[locale];

  const rewards = PLANS.map((plan) => {
    const reward = referralReward(plan.id);

    return fillText({
      text: text.inviteReward,
      fill: {
        plan: planLabel({ planId: plan.id, locale }),
        referrer: dayCount({ days: reward.referrerDays, locale }),
        friend: dayCount({ days: reward.friendDays, locale })
      }
    });
  });

  const stats = fillText({
    text: text.inviteStats,
    fill: {
      invited: String(overview.invited),
      rewarded: String(overview.rewarded),
      days: dayCount({ days: overview.daysEarned, locale })
    }
  });

  const pendingDays = dayCount({ days: overview.pendingDays, locale });
  const pending = overview.pendingDays > 0 ? fillText({ text: text.invitePending, fill: { days: pendingDays } }) : null;
  const code = fillText({ text: text.inviteCode, fill: { code: overview.code } });
  const botLink = overview.telegramLink ? fillText({ text: text.inviteBotLink, fill: { link: overview.telegramLink } }) : null;
  const siteLink = fillText({ text: text.inviteSiteLink, fill: { link: overview.link } });
  const footnote = fillText({ text: text.inviteFootnote, fill: { days: dayCount({ days: REFERRAL_POLICY.capDays, locale }) } });

  const shared = overview.telegramLink ?? overview.link;

  const markup = new InlineKeyboard()
    .url(text.inviteShare, shareUrl({ url: shared, text: text.inviteShareText }))
    .success()
    .row()
    .copyText(text.appsCopyLink, shared);

  return {
    text: html.paragraphs([text.inviteTitle, html.quote(rewards.join(NEW_LINE)), stats, pending, code, botLink, siteLink, footnote]),
    markup
  };
};
