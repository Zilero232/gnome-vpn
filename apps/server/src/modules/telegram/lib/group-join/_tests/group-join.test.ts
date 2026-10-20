import type { ChatMemberUpdated } from 'grammy/types';

import { describe, expect, it } from 'vitest';

import { isGroupJoin } from '../group-join';

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
