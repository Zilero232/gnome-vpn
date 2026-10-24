import type { InlineKeyboardButton } from 'grammy/types';

import { GrammyError, HttpError } from 'grammy';
import { assert, describe, expect, it } from 'vitest';

import { BOT_TEXT, BROADCAST, BROADCAST_AUDIENCES, CALLBACK_PREFIX } from '@/modules/telegram/config';

import type { BroadcastChat } from '../broadcast.types';

import {
  audienceKeyboard,
  audienceOf,
  broadcastAnswer,
  broadcastChoice,
  broadcastConfirm,
  broadcastReport,
  deliveryOutcome,
  isCopyable,
  sendWait
} from '../broadcast';

const CALLBACK_DATA_LIMIT = 64;
const LARGEST_MESSAGE_ID = Number.MAX_SAFE_INTEGER;

const chats: BroadcastChat[] = [
  { telegramId: 1n, hasAccess: true },
  { telegramId: 2n, hasAccess: false },
  { telegramId: 3n, hasAccess: true }
];

const apiError = (error_code: number, description: string, retry_after?: number) =>
  new GrammyError('call failed', { ok: false, error_code, description, parameters: { retry_after } }, 'copyMessage', {});

const dataOf = (button: InlineKeyboardButton): string => ('callback_data' in button ? button.callback_data : '');

describe('audienceOf', () => {
  it('sends to everyone when asked for everyone', () => {
    expect(audienceOf({ chats, audience: 'all' })).toHaveLength(chats.length);
  });

  it('splits the chats into two halves that together are everyone', () => {
    const active = audienceOf({ chats, audience: 'active' });
    const inactive = audienceOf({ chats, audience: 'inactive' });

    expect(active).toEqual([1n, 3n]);
    expect(inactive).toEqual([2n]);
    expect([...active, ...inactive].sort()).toEqual(audienceOf({ chats, audience: 'all' }).sort());
  });
});

describe('broadcast callbacks', () => {
  it('reads back the audience and message the keyboard wrote', () => {
    const [row] = audienceKeyboard({ locale: 'ru', source: 42 }).inline_keyboard;

    assert(row);

    for (const [index, button] of row.entries()) {
      const choice = broadcastChoice(dataOf(button).slice(CALLBACK_PREFIX.broadcastAudience.length));

      expect(choice).toEqual({ audience: BROADCAST_AUDIENCES[index], source: 42 });
    }
  });

  it('reads back the confirmation the keyboard wrote, and its refusal', () => {
    const [yes, no] = broadcastConfirm({ choice: { audience: 'active', source: 42 }, count: 3, locale: 'en' }).markup?.inline_keyboard[0] ?? [];

    assert(yes && no);
    const read = (button: InlineKeyboardButton) => broadcastAnswer(dataOf(button).slice(CALLBACK_PREFIX.broadcastSend.length));

    expect(read(yes)).toEqual({ audience: 'active', source: 42, isConfirmed: true });
    expect(read(no)).toEqual({ audience: 'active', source: 42, isConfirmed: false });
  });

  it('stays inside the 64 bytes Telegram allows, even for the largest message id', () => {
    const audience = audienceKeyboard({ locale: 'ru', source: LARGEST_MESSAGE_ID }).inline_keyboard.flat();
    const confirm = BROADCAST_AUDIENCES.flatMap(
      (each) =>
        broadcastConfirm({ choice: { audience: each, source: LARGEST_MESSAGE_ID }, count: 1, locale: 'ru' }).markup?.inline_keyboard.flat() ?? []
    );

    for (const button of [...audience, ...confirm]) {
      expect(Buffer.byteLength(dataOf(button))).toBeLessThanOrEqual(CALLBACK_DATA_LIMIT);
    }
  });

  it('refuses a crafted payload rather than guessing', () => {
    expect(broadcastChoice('everyone:42')).toBeNull();
    expect(broadcastChoice('all:-1')).toBeNull();
    expect(broadcastChoice('all:0x2a')).toBeNull();
    expect(broadcastChoice('all:42:extra')).toBeNull();
    expect(broadcastAnswer('maybe:all:42')).toBeNull();
    expect(broadcastAnswer('yes:all')).toBeNull();
  });
});

describe('sendWait', () => {
  it('sends the first message at once', () => {
    expect(sendWait({ lastSentAt: null, now: 0 })).toBe(0);
  });

  it('never lets more than the allowed number of messages out in any second', () => {
    const sentAt: number[] = [];
    let now = 0;

    for (let index = 0; index < BROADCAST.perSecond * 4; index += 1) {
      now += sendWait({ lastSentAt: sentAt.at(-1) ?? null, now });
      sentAt.push(now);
    }

    for (const start of sentAt) {
      expect(sentAt.filter((at) => at >= start && at < start + 1_000).length).toBeLessThanOrEqual(BROADCAST.perSecond);
    }
  });

  it('does not wait at all when the previous send is long past', () => {
    expect(sendWait({ lastSentAt: 0, now: 1_000 })).toBe(0);
  });
});

describe('deliveryOutcome', () => {
  it('counts a chat that blocked the bot apart from a failure', () => {
    expect(deliveryOutcome(apiError(BROADCAST.blockedCode, 'Forbidden: bot was blocked by the user'))).toEqual({ kind: 'blocked' });
  });

  it('honours the wait Telegram asks for on a flood', () => {
    expect(deliveryOutcome(apiError(BROADCAST.floodCode, 'Too Many Requests', 30))).toEqual({ kind: 'flood', retryAfterSeconds: 30 });
  });

  it('notices the source message is gone, which would fail every other copy too', () => {
    expect(deliveryOutcome(apiError(400, 'Bad Request: message to copy not found'))).toEqual({ kind: 'missing' });
  });

  it('treats anything else, a network failure included, as one failed delivery', () => {
    expect(deliveryOutcome(apiError(400, 'Bad Request: chat not found'))).toEqual({ kind: 'failed' });
    expect(deliveryOutcome(new HttpError('network', new Error('down')))).toEqual({ kind: 'failed' });
  });
});

describe('isCopyable', () => {
  it('accepts a message with content and refuses a service message, which copyMessage cannot send', () => {
    expect(isCopyable({ message_id: 1, text: 'Новости' })).toBe(true);
    expect(isCopyable({ message_id: 1, photo: [], caption: 'Новости' })).toBe(true);
    expect(isCopyable({ message_id: 1, forum_topic_created: { name: 'Topic' } })).toBe(false);
    expect(isCopyable({ message_id: 1, new_chat_members: [] })).toBe(false);
  });
});

describe('protected or uncopyable sources', () => {
  it('reads them as a missing source, so the run stops at the first copy instead of failing every recipient', () => {
    for (const description of ["Bad Request: message can't be copied", "Bad Request: message has protected content and can't be forwarded"]) {
      expect(BROADCAST.sourceMissing.test(description)).toBe(true);
    }
  });
});

describe('broadcastReport', () => {
  const tally = { delivered: 120, blocked: 7, failed: 3 };

  it('reports each count', () => {
    const report = broadcastReport({ tally, isAborted: false, locale: 'ru' });

    for (const count of Object.values(tally)) {
      expect(report).toContain(String(count));
    }
  });

  it('says why it stopped when the source message disappeared', () => {
    expect(broadcastReport({ tally, isAborted: true, locale: 'en' })).toContain(BOT_TEXT.en.broadcastSourceMissing);
    expect(broadcastReport({ tally, isAborted: false, locale: 'en' })).not.toContain(BOT_TEXT.en.broadcastSourceMissing);
  });
});
