import type { CONFIRMED, DECLINED } from '@/modules/telegram/config';
import type { BotText, ConfirmCopy } from '@/modules/telegram/telegram.types';

export type RemoveDeviceCopyInput = {
  copy: BotText;
  name: string;
};

export type ConfirmKeyboardInput = {
  copy: ConfirmCopy;
  prefix: string;
  subject?: string;
};

export type AnswerDataInput = {
  prefix: string;
  answer: typeof CONFIRMED | typeof DECLINED;
  subject?: string;
};
