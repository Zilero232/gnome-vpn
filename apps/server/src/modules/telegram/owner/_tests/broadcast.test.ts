import type { InlineKeyboardButton } from 'grammy/types';

import { assert, describe, expect, it } from 'vitest';

import { BOT_TEXT, CALLBACK_PREFIX, CALLBACK_VALUE } from '@/modules/telegram/config';
import { broadcastAnswer, broadcastChoice } from '@/modules/telegram/shared/callback-data';

import type { BroadcastChat } from '../owner.types';

import { audienceKeyboard, audienceOf, broadcastConfirm, broadcastReport, isCopyable, sendWait } from '../broadcast';
import { BROADCAST } from '../owner.config';

const CALLBACK_DATA_LIMIT = 64;
const LARGEST_MESSAGE_ID = Number.MAX_SAFE_INTEGER;

const chats: BroadcastChat[] = [
  { telegramId: 1n, hasAccess: true },
  { telegramId: 2n, hasAccess: false },
  { telegramId: 3n, hasAccess: true }
];

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

      expect(choice).toEqual({ audience: CALLBACK_VALUE.audiences[index], source: 42 });
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
    const confirm = CALLBACK_VALUE.audiences.flatMap(
      (each) =>
        broadcastConfirm({ choice: { audience: each, source: LARGEST_MESSAGE_ID }, count: 1, locale: 'ru' }).markup?.inline_keyboard.flat() ?? []
    );

    for (const button of [...audience, ...confirm]) {
      expect(Buffer.byteLength(dataOf(button))).toBeLessThanOrEqual(CALLBACK_DATA_LIMIT);
    }
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

describe('isCopyable', () => {
  it('accepts a message with content and refuses a service message, which copyMessage cannot send', () => {
    expect(isCopyable({ message_id: 1, text: 'Новости' })).toBe(true);
    expect(isCopyable({ message_id: 1, photo: [], caption: 'Новости' })).toBe(true);
    expect(isCopyable({ message_id: 1, forum_topic_created: { name: 'Topic' } })).toBe(false);
    expect(isCopyable({ message_id: 1, new_chat_members: [] })).toBe(false);
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
