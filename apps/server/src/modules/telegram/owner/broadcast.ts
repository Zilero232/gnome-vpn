import { InlineKeyboard } from 'grammy';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { BotMessage } from '../telegram.types';
import type { AudienceInput, BroadcastConfirmInput, BroadcastKeyboardInput, BroadcastReportInput, SendWaitInput } from './owner.types';

import { BOT_TEXT, CALLBACK_PREFIX, CALLBACK_VALUE } from '../config';
import { callbackData } from '../shared/callback-data';
import { confirmKeyboard } from '../shared/keyboard';
import { fillLabel, fillText, html } from '../shared/text';
import { BROADCAST } from './owner.config';

const SEND_INTERVAL_MS = Math.ceil(1_000 / BROADCAST.perSecond);

export const audienceOf = ({ chats, audience }: AudienceInput): bigint[] =>
  chats
    .filter((chat) =>
      match(audience)
        .with('all', () => true)
        .with('active', () => chat.hasAccess)
        .with('inactive', () => !chat.hasAccess)
        .exhaustive()
    )
    .map((chat) => chat.telegramId);

export const sendWait = ({ lastSentAt, now }: SendWaitInput): number =>
  isNullish(lastSentAt) ? 0 : Math.max(0, lastSentAt + SEND_INTERVAL_MS - now);

export const audienceKeyboard = ({ locale, source }: BroadcastKeyboardInput): InlineKeyboard =>
  InlineKeyboard.from([
    CALLBACK_VALUE.audiences.map((audience) =>
      InlineKeyboard.text(BOT_TEXT[locale][BROADCAST.audienceLabel[audience]], callbackData.broadcastAudience({ audience, source }))
    )
  ]);

export const broadcastConfirm = ({ choice, count, locale }: BroadcastConfirmInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const ask = fillText({ text: text.broadcastConfirm, fill: { audience: text[BROADCAST.audienceLabel[choice.audience]], count: String(count) } });

  return {
    text: ask,
    markup: confirmKeyboard({
      copy: { ask, yes: fillLabel({ text: text.broadcastSend, fill: { count: String(count) } }), no: text.broadcastCancel },
      prefix: CALLBACK_PREFIX.broadcastSend,
      subject: callbackData.broadcastSubject(choice)
    })
  };
};

export const broadcastReport = ({ tally, isAborted, locale }: BroadcastReportInput): string => {
  const text = BOT_TEXT[locale];
  const report = fillText({
    text: text.broadcastReport,
    fill: { delivered: String(tally.delivered), blocked: String(tally.blocked), failed: String(tally.failed) }
  });

  return html.paragraphs([report, isAborted ? text.broadcastSourceMissing : null]);
};

export const isCopyable = (message: object): boolean => BROADCAST.copyableFields.some((field) => field in message);
