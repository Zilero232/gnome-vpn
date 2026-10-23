import { GrammyError, InlineKeyboard } from 'grammy';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { BotMessage } from '../../telegram.types';
import type {
  AudienceInput,
  BroadcastAnswer,
  BroadcastChoice,
  BroadcastConfirmInput,
  BroadcastKeyboardInput,
  BroadcastReportInput,
  DeliveryOutcome,
  SendWaitInput
} from './broadcast.types';

import { BOT_TEXT, BROADCAST, BROADCAST_AUDIENCES, CALLBACK_PREFIX, CONFIRMED, DECLINED, SUBJECT_SEPARATOR } from '../../config';
import { confirmKeyboard } from '../confirm-copy';
import { fillLabel, fillText } from '../fill-text';
import { html } from '../html';
import { AUDIENCE_LABEL, SEND_INTERVAL_MS } from './broadcast.constants';
import { parseChoice } from './broadcast.helpers';

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

export const broadcastChoice = (raw: string): BroadcastChoice | null => parseChoice(raw.split(SUBJECT_SEPARATOR));

export const broadcastAnswer = (raw: string): BroadcastAnswer | null => {
  const [answer, ...rest] = raw.split(SUBJECT_SEPARATOR);
  const choice = parseChoice(rest);

  if (isNullish(choice) || (answer !== CONFIRMED && answer !== DECLINED)) {
    return null;
  }

  return { ...choice, isConfirmed: answer === CONFIRMED };
};

export const sendWait = ({ lastSentAt, now }: SendWaitInput): number =>
  isNullish(lastSentAt) ? 0 : Math.max(0, lastSentAt + SEND_INTERVAL_MS - now);

export const deliveryOutcome = (error: unknown): DeliveryOutcome => {
  if (!(error instanceof GrammyError)) {
    return { kind: 'failed' };
  }

  if (error.error_code === BROADCAST.blockedCode) {
    return { kind: 'blocked' };
  }

  if (error.error_code === BROADCAST.floodCode) {
    return { kind: 'flood', retryAfterSeconds: error.parameters.retry_after ?? 1 };
  }

  return BROADCAST.sourceMissing.test(error.description) ? { kind: 'missing' } : { kind: 'failed' };
};

export const audienceKeyboard = ({ locale, source }: BroadcastKeyboardInput): InlineKeyboard =>
  InlineKeyboard.from([
    BROADCAST_AUDIENCES.map((audience) =>
      InlineKeyboard.text(BOT_TEXT[locale][AUDIENCE_LABEL[audience]], `${CALLBACK_PREFIX.broadcastAudience}${audience}${SUBJECT_SEPARATOR}${source}`)
    )
  ]);

export const broadcastConfirm = ({ choice, count, locale }: BroadcastConfirmInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const ask = fillText({ text: text.broadcastConfirm, fill: { audience: text[AUDIENCE_LABEL[choice.audience]], count: String(count) } });

  return {
    text: ask,
    markup: confirmKeyboard({
      copy: { ask, yes: fillLabel({ text: text.broadcastSend, fill: { count: String(count) } }), no: text.broadcastCancel },
      prefix: CALLBACK_PREFIX.broadcastSend,
      subject: `${choice.audience}${SUBJECT_SEPARATOR}${choice.source}`
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
