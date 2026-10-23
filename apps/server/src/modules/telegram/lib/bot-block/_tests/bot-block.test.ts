import type { ChatMemberUpdated } from 'grammy/types';

import { describe, expect, it } from 'vitest';

import { botBlockChange } from '../bot-block';

type MemberStatus = ChatMemberUpdated['new_chat_member']['status'];

type UpdateInput = {
  type: ChatMemberUpdated['chat']['type'];
  from: MemberStatus;
  to: MemberStatus;
};

const update = ({ type, from, to }: UpdateInput): ChatMemberUpdated =>
  ({
    chat: { id: 1, type },
    old_chat_member: { status: from },
    new_chat_member: { status: to }
  }) as ChatMemberUpdated;

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
