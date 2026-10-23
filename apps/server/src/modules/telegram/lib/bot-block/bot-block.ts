import type { ChatMemberUpdated } from 'grammy/types';

import type { BotBlockChange } from './bot-block.types';

import { BOT_BLOCK } from './bot-block.constants';

export const botBlockChange = ({ chat, old_chat_member, new_chat_member }: ChatMemberUpdated): BotBlockChange | null => {
  if (chat.type !== 'private' || old_chat_member.status === new_chat_member.status) {
    return null;
  }

  if (new_chat_member.status === BOT_BLOCK.blocked) {
    return 'blocked';
  }

  return new_chat_member.status === BOT_BLOCK.unblocked ? 'unblocked' : null;
};
