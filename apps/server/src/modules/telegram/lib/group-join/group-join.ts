import type { ChatMemberUpdated } from 'grammy/types';

import { GROUP_JOIN } from './group-join.constants';

const ABSENT = new Set<string>(GROUP_JOIN.absent);

const PRESENT = new Set<string>(GROUP_JOIN.present);

export const isGroupJoin = ({ chat, old_chat_member, new_chat_member }: ChatMemberUpdated): boolean =>
  chat.type !== 'private' && ABSENT.has(old_chat_member.status) && PRESENT.has(new_chat_member.status);
