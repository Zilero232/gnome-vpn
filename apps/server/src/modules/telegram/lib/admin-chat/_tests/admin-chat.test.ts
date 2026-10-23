import { GrammyError } from 'grammy';
import { describe, expect, it } from 'vitest';

import { adminChatOf, isAdminChat, migratedChatId } from '../admin-chat';

const GROUP_ID = -1_001_234_567_890;

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
