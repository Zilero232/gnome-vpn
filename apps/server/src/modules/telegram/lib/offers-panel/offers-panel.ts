import type { InlineKeyboardButton } from 'grammy/types';

import { InlineKeyboard } from 'grammy';

import type { BotMessage } from '@/modules/telegram/telegram.types';

import { BOT_TEXT, CALLBACK_PREFIX, OFFERS_CHOICE } from '@/modules/telegram/config';

import type { OffersPanelInput } from './offers-panel.types';

export const offersButton = ({ isOn, locale }: OffersPanelInput): InlineKeyboardButton => {
  const text = BOT_TEXT[locale];

  return isOn
    ? InlineKeyboard.text(text.offersOffButton, `${CALLBACK_PREFIX.offers}${OFFERS_CHOICE.off}`)
    : InlineKeyboard.text(text.offersOnButton, `${CALLBACK_PREFIX.offers}${OFFERS_CHOICE.on}`);
};

export const offersPanel = ({ isOn, locale }: OffersPanelInput): BotMessage => ({
  text: isOn ? BOT_TEXT[locale].offersOn : BOT_TEXT[locale].offersOff,
  markup: InlineKeyboard.from([[offersButton({ isOn, locale })]])
});
