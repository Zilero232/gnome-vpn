import type { NoticeSpec } from '@/modules/telegram/telegram.types';

export type NoticeLayoutInput = {
  text: string;
  markup: NoticeSpec['markup'];
  prompt: string | null;
};

export type NoticeLayout = {
  text: string;
  markup: NoticeSpec['markup'];
  followUp: string | null;
};
