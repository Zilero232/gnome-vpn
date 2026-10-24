import type { ChatMemberUpdated, User } from 'grammy/types';

import { GrammyError, HttpError } from 'grammy';
import { describe, expect, it } from 'vitest';

import { adminChatOf, botBlockChange, botUrl, deliveryOutcome, identityOf, isAdminChat, isGroupJoin, migratedChatId } from '../update';
import { BOT_URL_BASE, DELIVERY } from '../update.constants';

type MemberStatus = ChatMemberUpdated['new_chat_member']['status'];

type UpdateInput = {
  type: ChatMemberUpdated['chat']['type'];
  from: MemberStatus;
  to: MemberStatus;
};

const GROUP_ID = -1_001_234_567_890;

const user = (overrides: Partial<User> = {}): User => ({
  id: 42,
  is_bot: false,
  first_name: 'Reader',
  ...overrides
});

const update = ({ type, from, to }: UpdateInput): ChatMemberUpdated =>
  ({
    chat: { id: 1, type },
    old_chat_member: { status: from },
    new_chat_member: { status: to }
  }) as ChatMemberUpdated;

const apiError = (error_code: number, description: string, retry_after?: number) =>
  new GrammyError('call failed', { ok: false, error_code, description, parameters: { retry_after } }, 'copyMessage', {});

describe('identityOf', () => {
  it('returns null when the update carries no sender', () => {
    expect(identityOf(undefined)).toBeNull();
  });

  it('carries the id as a bigint so a large one survives', () => {
    const large = 8_000_000_000_000_000_001n;

    expect(identityOf(user({ id: Number(large) }))?.telegramId).toBeTypeOf('bigint');
    expect(identityOf(user())?.telegramId).toBe(42n);
  });

  it('reads the optional fields as null rather than undefined', () => {
    expect(identityOf(user())).toEqual({ telegramId: 42n, username: null, languageCode: null });
  });

  it('keeps the username and language when the sender has them', () => {
    const identity = identityOf(user({ username: 'reader', language_code: 'ru-RU' }));

    expect(identity).toEqual({ telegramId: 42n, username: 'reader', languageCode: 'ru-RU' });
  });
});

describe('adminChatOf', () => {
  it('switches the admin chat off when the variable is empty', () => {
    expect(adminChatOf('')).toBeNull();
  });

  it('reads a group id, which is negative and wider than 32 bits', () => {
    expect(adminChatOf(String(GROUP_ID))).toBe(GROUP_ID);
  });

  it('refuses anything that is not a whole number, rather than aiming at a chat that cannot exist', () => {
    expect(adminChatOf('abc')).toBeNull();
    expect(adminChatOf('1.5')).toBeNull();
  });
});

describe('isAdminChat', () => {
  it('accepts the configured chat', () => {
    expect(isAdminChat({ chatId: GROUP_ID, adminChatId: GROUP_ID })).toBe(true);
  });

  it('refuses every other chat', () => {
    expect(isAdminChat({ chatId: GROUP_ID + 1, adminChatId: GROUP_ID })).toBe(false);
  });

  it('refuses everything while no admin chat is configured', () => {
    expect(isAdminChat({ chatId: GROUP_ID, adminChatId: null })).toBe(false);
  });

  it('refuses an update that carries no chat at all', () => {
    expect(isAdminChat({ chatId: undefined, adminChatId: GROUP_ID })).toBe(false);
  });
});

describe('migratedChatId', () => {
  it('reads the new id Telegram names when the admin group became a supergroup', () => {
    const upgraded = new GrammyError(
      'Call to sendMessage failed',
      {
        ok: false,
        error_code: 400,
        description: 'Bad Request: group chat was upgraded to a supergroup chat',
        parameters: { migrate_to_chat_id: -1_001_234_567_890 }
      },
      'sendMessage',
      {}
    );

    expect(migratedChatId(upgraded)).toBe(-1_001_234_567_890);
  });

  it('answers nothing for any other failure', () => {
    const other = new GrammyError(
      'Call to sendMessage failed',
      { ok: false, error_code: 403, description: 'Forbidden', parameters: {} },
      'sendMessage',
      {}
    );

    expect(migratedChatId(other)).toBeNull();
    expect(migratedChatId(new Error('network'))).toBeNull();
  });
});

describe('botBlockChange', () => {
  it('sees a reader blocking the bot in their private chat', () => {
    expect(botBlockChange(update({ type: 'private', from: 'member', to: 'kicked' }))).toBe('blocked');
  });

  it('sees a reader unblocking it again', () => {
    expect(botBlockChange(update({ type: 'private', from: 'kicked', to: 'member' }))).toBe('unblocked');
  });

  it('ignores a group, where the same statuses mean the bot was removed or added', () => {
    expect(botBlockChange(update({ type: 'group', from: 'member', to: 'kicked' }))).toBeNull();
    expect(botBlockChange(update({ type: 'supergroup', from: 'kicked', to: 'member' }))).toBeNull();
  });

  it('ignores an update that changes nothing', () => {
    expect(botBlockChange(update({ type: 'private', from: 'member', to: 'member' }))).toBeNull();
  });
});

describe('isGroupJoin', () => {
  it('sees the bot being added to a group', () => {
    expect(isGroupJoin(update({ type: 'group', from: 'left', to: 'member' }))).toBe(true);
  });

  it('sees the bot being added to a supergroup as an admin', () => {
    expect(isGroupJoin(update({ type: 'supergroup', from: 'kicked', to: 'administrator' }))).toBe(true);
  });

  it('ignores a private chat, where blocking and unblocking also arrive as member updates', () => {
    expect(isGroupJoin(update({ type: 'private', from: 'kicked', to: 'member' }))).toBe(false);
  });

  it('ignores a promotion inside a group the bot was already in', () => {
    expect(isGroupJoin(update({ type: 'group', from: 'member', to: 'administrator' }))).toBe(false);
  });

  it('ignores the bot leaving', () => {
    expect(isGroupJoin(update({ type: 'group', from: 'member', to: 'left' }))).toBe(false);
  });
});

describe('botUrl', () => {
  it('points at the chat with the bot', () => {
    expect(botUrl('GnomeBot')).toBe(`${BOT_URL_BASE}GnomeBot`);
  });

  it('drops a leading at sign someone typed into the variable', () => {
    expect(botUrl('@GnomeBot')).toBe(`${BOT_URL_BASE}GnomeBot`);
  });

  it('answers undefined when no bot is configured, so the caller keeps its own default', () => {
    expect(botUrl('')).toBeUndefined();
    expect(botUrl(undefined)).toBeUndefined();
  });
});

describe('deliveryOutcome', () => {
  it('counts a chat that blocked the bot apart from a failure', () => {
    expect(deliveryOutcome(apiError(DELIVERY.blockedCode, 'Forbidden: bot was blocked by the user'))).toEqual({ kind: 'blocked' });
  });

  it('honours the wait Telegram asks for on a flood', () => {
    expect(deliveryOutcome(apiError(DELIVERY.floodCode, 'Too Many Requests', 30))).toEqual({ kind: 'flood', retryAfterSeconds: 30 });
  });

  it('notices the source message is gone, which would fail every other copy too', () => {
    expect(deliveryOutcome(apiError(400, 'Bad Request: message to copy not found'))).toEqual({ kind: 'missing' });
  });

  it('treats anything else, a network failure included, as one failed delivery', () => {
    expect(deliveryOutcome(apiError(400, 'Bad Request: chat not found'))).toEqual({ kind: 'failed' });
    expect(deliveryOutcome(new HttpError('network', new Error('down')))).toEqual({ kind: 'failed' });
  });
});

describe('protected or uncopyable sources', () => {
  it('reads them as a missing source, so the run stops at the first copy instead of failing every recipient', () => {
    for (const description of ["Bad Request: message can't be copied", "Bad Request: message has protected content and can't be forwarded"]) {
      expect(deliveryOutcome(apiError(400, description))).toEqual({ kind: 'missing' });
    }
  });
});
