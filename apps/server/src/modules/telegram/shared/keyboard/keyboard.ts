import type { InlineKeyboardButton } from 'grammy/types';

import { InlineKeyboard, Keyboard } from 'grammy';
import { entries, isEmpty, isIncludedIn, isNonNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { BotLocale, BotMessage, BotText, ButtonKey } from '@/modules/telegram/telegram.types';

import { BOT_BUTTONS, BOT_LOCALES, BOT_TEXT, CALLBACK_VALUE } from '@/modules/telegram/config';

import type {
  ChatState,
  ConfirmCopy,
  ConfirmKeyboardInput,
  KeyboardInput,
  KeyboardRow,
  KeyboardSlot,
  MenuButtonInput,
  MenuButtonsInput,
  NoAccessMessageInput,
  OfferInput,
  OffersPanelInput,
  UrlMessageInput,
  VisibilityInput
} from './keyboard.types';

import { callbackData } from '../callback-data';
import { html } from '../text';
import { BUTTON_STYLE, BUTTON_URL, KEYBOARD_ROWS, LANGUAGE_MENU, LEGACY_BUTTONS } from './keyboard.config';

const BY_LABEL = new Map<string, ButtonKey>(
  BOT_LOCALES.flatMap((locale) => entries(BOT_BUTTONS[locale]).map(([key, label]): [string, ButtonKey] => [label, key]))
);

const isVisible = ({ when, state }: VisibilityInput): boolean =>
  match(when)
    .with('always', () => true)
    .with('subscribed', () => state.isSubscribed)
    .with('unsubscribed', () => !state.isSubscribed)
    .with('trialAvailable', () => state.isTrialAvailable)
    .exhaustive();

const visibleRows = (rows: KeyboardRow[], state: ChatState): KeyboardSlot[][] =>
  rows.map((row) => row.filter(({ when }) => isVisible({ when, state }))).filter((row) => !isEmpty(row));

const menuButton = ({ locale, key }: MenuButtonInput): InlineKeyboardButton =>
  InlineKeyboard.text({ text: BOT_BUTTONS[locale][key], style: BUTTON_STYLE[key] }, callbackData.menu(key));

export const mainKeyboard = ({ locale, state }: KeyboardInput): Keyboard => {
  const rows = visibleRows(KEYBOARD_ROWS.main, state).map((row) => row.map(({ key }) => Keyboard.text(BOT_BUTTONS[locale][key], BUTTON_STYLE[key])));

  return Keyboard.from(rows).resized().persistent().placeholder(BOT_TEXT[locale].keyboardPlaceholder);
};

export const moreKeyboard = ({ locale, state }: KeyboardInput): InlineKeyboard =>
  InlineKeyboard.from(visibleRows(KEYBOARD_ROWS.more, state).map((row) => row.map(({ key }) => menuButton({ locale, key }))));

export const menuButtons = ({ locale, keys }: MenuButtonsInput): InlineKeyboard =>
  InlineKeyboard.from([keys.map((key) => menuButton({ locale, key }))]);

export const languageKeyboard = (current: BotLocale | undefined): InlineKeyboard =>
  InlineKeyboard.from([
    LANGUAGE_MENU.buttons.map(({ locale, label }) =>
      InlineKeyboard.text(locale === current ? `${LANGUAGE_MENU.currentMark} ${label}` : label, callbackData.locale(locale))
    )
  ]);

export const offerKeys = ({ period, isTrialAvailable }: OfferInput): ButtonKey[] =>
  match({ period, isTrialAvailable })
    .returnType<ButtonKey[]>()
    .with({ period: 'paid' }, () => ['renew', 'autoRenew'])
    .with({ period: 'trial' }, () => ['renew'])
    .with({ isTrialAvailable: true }, () => ['trial', 'buy'])
    .otherwise(() => ['buy']);

export const buttonFor = (text: string): ButtonKey | null => BY_LABEL.get(text.trim()) ?? LEGACY_BUTTONS[text.trim()] ?? null;

export const isButtonUrl = (raw: string | null | undefined): raw is string => {
  if (!raw || !URL.canParse(raw)) {
    return false;
  }

  const { protocol, hostname } = new URL(raw);

  return protocol === BUTTON_URL.protocol && !isIncludedIn(hostname, BUTTON_URL.localHosts);
};

export const urlMessage = ({ intro, url, label, style }: UrlMessageInput): BotMessage => {
  if (!isButtonUrl(url)) {
    return { text: html.paragraphs([intro, html.escape(url)]) };
  }

  return { text: intro, markup: new InlineKeyboard().url(label, url).style(style) };
};

export const unlinkCopy = (copy: BotText): ConfirmCopy => ({ ask: copy.unlinkAsk, yes: copy.unlinkYes, no: copy.unlinkNo });

export const deleteCopy = (copy: BotText): ConfirmCopy => ({ ask: copy.deleteAsk, yes: copy.deleteYes, no: copy.deleteNo });

export const rotateCopy = (copy: BotText): ConfirmCopy => ({ ask: copy.rotateAsk, yes: copy.rotateYes, no: copy.rotateNo });

export const confirmKeyboard = ({ copy, prefix, subject }: ConfirmKeyboardInput): InlineKeyboard =>
  new InlineKeyboard()
    .text(copy.yes, callbackData.answer({ prefix, answer: CALLBACK_VALUE.answer.yes, subject }))
    .danger()
    .text(copy.no, callbackData.answer({ prefix, answer: CALLBACK_VALUE.answer.no, subject }));

export const offersButton = ({ isOn, locale }: OffersPanelInput): InlineKeyboardButton => {
  const text = BOT_TEXT[locale];

  return isOn
    ? InlineKeyboard.text(text.offersOffButton, callbackData.offers(CALLBACK_VALUE.switch.off))
    : InlineKeyboard.text(text.offersOnButton, callbackData.offers(CALLBACK_VALUE.switch.on));
};

export const offersPanel = ({ isOn, locale }: OffersPanelInput): BotMessage => ({
  text: isOn ? BOT_TEXT[locale].offersOn : BOT_TEXT[locale].offersOff,
  markup: InlineKeyboard.from([[offersButton({ isOn, locale })]])
});

const noAccessText = ({ status, locale }: NoAccessMessageInput): string => {
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
