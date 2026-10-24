import { isNonNullish } from 'remeda';

import type { BotMessage } from '@/modules/telegram/telegram.types';

import { BOT_TEXT } from '@/modules/telegram/config';

import type { NoAccessMessageInput } from './no-access.types';

import { menuButtons, offerKeys } from '../keyboard';

export const noAccessText = ({ status, locale }: NoAccessMessageInput): string => {
  const text = BOT_TEXT[locale];

  if (isNonNullish(status.currentPeriodEnd)) {
    return text.lapsed;
  }

  return status.isTrialAvailable ? text.noSubscription : text.inactive;
};

export const noAccessMessage = ({ status, locale }: NoAccessMessageInput): BotMessage => ({
  text: noAccessText({ status, locale }),
  markup: menuButtons({ locale, keys: offerKeys(status) })
});
