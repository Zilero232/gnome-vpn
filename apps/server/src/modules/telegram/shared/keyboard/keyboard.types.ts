import type { PeriodKind, SubscriptionStatus } from '@gnomevpn/schemas';
import type { KeyboardButton } from 'grammy/types';

import type { BotLocale, BotText, ButtonKey } from '@/modules/telegram/telegram.types';

export type ButtonStyle = NonNullable<KeyboardButton.CommonButton['style']>;

export type ButtonVisibility = 'always' | 'subscribed' | 'trialAvailable' | 'unsubscribed';

export type ChatState = {
  isSubscribed: boolean;
  isTrialAvailable: boolean;
};

export type KeyboardSlot = {
  key: ButtonKey;
  when: ButtonVisibility;
};

export type KeyboardRow = KeyboardSlot[];

export type VisibilityInput = {
  when: ButtonVisibility;
  state: ChatState;
};

export type KeyboardInput = {
  locale: BotLocale;
  state: ChatState;
};

export type MenuButtonsInput = {
  locale: BotLocale;
  keys: readonly ButtonKey[];
};

export type MenuButtonInput = {
  locale: BotLocale;
  key: ButtonKey;
};

export type OfferInput = {
  period: PeriodKind;
  isTrialAvailable: boolean;
};

export type UrlMessageInput = {
  intro: string;
  url: string;
  label: string;
  style: ButtonStyle;
};

export type ConfirmCopy = {
  ask: string;
  yes: string;
  no: string;
};

export type ConfirmKeyboardInput = {
  copy: ConfirmCopy;
  prefix: string;
  subject?: string;
};

export type ConfirmCopyPick = (copy: BotText) => ConfirmCopy;

export type OffersPanelInput = {
  isOn: boolean;
  locale: BotLocale;
};

export type NoAccessMessageInput = {
  status: Pick<SubscriptionStatus, 'currentPeriodEnd' | 'isTrialAvailable' | 'period'>;
  locale: BotLocale;
};
