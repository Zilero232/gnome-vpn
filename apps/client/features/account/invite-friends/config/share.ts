import type { LucideIcon } from 'lucide-react';

import { Mail, MessageCircle, MessagesSquare, Send } from 'lucide-react';

import type { ShareTargetKey } from '../lib';

export const SHARE_ICONS: Record<ShareTargetKey, LucideIcon> = {
  telegram: Send,
  whatsapp: MessageCircle,
  vk: MessagesSquare,
  email: Mail
};
