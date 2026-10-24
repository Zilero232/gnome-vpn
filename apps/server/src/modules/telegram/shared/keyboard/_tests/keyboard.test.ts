import type { InlineKeyboard } from 'grammy';
import type { KeyboardButton } from 'grammy/types';

import { describe, expect, it } from 'vitest';

import type { BotMessage } from '@/modules/telegram/telegram.types';

import { BOT_BUTTONS, BOT_LOCALES, BOT_TEXT, CALLBACK_PREFIX, CALLBACK_VALUE } from '@/modules/telegram/config';
import { deviceAnswer, offersChoice } from '@/modules/telegram/shared/callback-data';
import { html } from '@/modules/telegram/shared/text';

import type { ChatState } from '../keyboard.types';

import { buttonFor, confirmKeyboard, isButtonUrl, mainKeyboard, noAccessMessage, offersButton, offersPanel, urlMessage } from '../keyboard';
import { KEYBOARD_ROWS, LEGACY_BUTTONS } from '../keyboard.config';

const textOf = (button: KeyboardButton): string => (typeof button === 'string' ? button : button.text);

const labelsOf = (state: ChatState, locale: 'en' | 'ru' = 'ru') => mainKeyboard({ locale, state }).build().flat().map(textOf);

const fresh: ChatState = { isSubscribed: false, isTrialAvailable: true };
const paying: ChatState = { isSubscribed: true, isTrialAvailable: false };
const lapsed: ChatState = { isSubscribed: false, isTrialAvailable: false };

const keyboardKeys = KEYBOARD_ROWS.main.flat().map((slot) => slot.key);

const deviceId = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
const copy = { ask: 'ask', yes: 'yes-label', no: 'no-label' };
const CALLBACK_DATA_LIMIT = 64;

const callbackData = (keyboard: InlineKeyboard): string[] =>
  keyboard.inline_keyboard.flat().map((button) => ('callback_data' in button ? button.callback_data : ''));

const callbacks = (panel: BotMessage): string[] =>
  panel.markup?.inline_keyboard.flat().flatMap((button) => ('callback_data' in button ? [button.callback_data] : [])) ?? [];

const base = { intro: 'Pay here', label: 'Pay', style: 'success' as const };

const never = { period: 'none', currentPeriodEnd: null, isTrialAvailable: true } as const;

describe('mainKeyboard', () => {
  it('offers the trial to someone who can still take it', () => {
    expect(labelsOf(fresh)).toContain(BOT_BUTTONS.ru.trial);
  });

  it('does not offer a trial that is already spent', () => {
    expect(labelsOf(paying)).not.toContain(BOT_BUTTONS.ru.trial);
    expect(labelsOf(lapsed)).not.toContain(BOT_BUTTONS.ru.trial);
  });

  it('hides the link and the status from someone with nothing to connect to', () => {
    expect(labelsOf(fresh)).not.toContain(BOT_BUTTONS.ru.connect);
    expect(labelsOf(fresh)).not.toContain(BOT_BUTTONS.ru.status);
  });

  it('leads with the link once there is a subscription to use', () => {
    const [first] = labelsOf(paying);

    expect(first).toBe(BOT_BUTTONS.ru.connect);
  });

  it('offers a way to pay in every state, worded for that state', () => {
    expect(labelsOf(fresh)).toContain(BOT_BUTTONS.ru.buy);
    expect(labelsOf(lapsed)).toContain(BOT_BUTTONS.ru.buy);
    expect(labelsOf(paying)).toContain(BOT_BUTTONS.ru.renew);
  });

  it('does not ask a paying reader to subscribe, nor a lapsed one to renew', () => {
    expect(labelsOf(paying)).not.toContain(BOT_BUTTONS.ru.buy);
    expect(labelsOf(lapsed)).not.toContain(BOT_BUTTONS.ru.renew);
  });

  it('never renders an empty row', () => {
    for (const state of [fresh, paying, lapsed]) {
      for (const row of mainKeyboard({ locale: 'ru', state }).build()) {
        expect(row.length).toBeGreaterThan(0);
      }
    }
  });

  it('speaks the locale it is given', () => {
    expect(labelsOf(paying, 'en')).toContain(BOT_BUTTONS.en.connect);
    expect(labelsOf(paying, 'en')).not.toContain(BOT_BUTTONS.ru.connect);
  });
});

describe('KEYBOARD_ROWS', () => {
  it('names a button that both locales can label, so no press renders blank', () => {
    for (const locale of BOT_LOCALES) {
      for (const key of keyboardKeys) {
        expect(BOT_BUTTONS[locale][key]).toBeTruthy();
      }
    }
  });

  it('places every button once, because a repeated one is an ambiguous press', () => {
    expect(new Set(keyboardKeys).size).toBe(keyboardKeys.length);
  });

  it('labels every button differently across both languages, so a label maps back to one key', () => {
    const labels = BOT_LOCALES.flatMap((locale) => keyboardKeys.map((key) => BOT_BUTTONS[locale][key]));

    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('buttonFor', () => {
  it('recognises every label in every language', () => {
    for (const locale of BOT_LOCALES) {
      for (const [key, label] of Object.entries(BOT_BUTTONS[locale])) {
        expect(buttonFor(label)).toBe(key);
      }
    }
  });

  it('still answers a label an older release put on the keyboard, so it never lands in the support desk', () => {
    for (const [label, key] of Object.entries(LEGACY_BUTTONS)) {
      expect(buttonFor(label)).toBe(key);
      expect(Object.keys(BOT_BUTTONS.ru)).toContain(key);
    }
  });

  it('survives the whitespace a client may add', () => {
    expect(buttonFor(`  ${BOT_BUTTONS.ru.status}  `)).toBe('status');
  });

  it('refuses anything that is not a button, so a link code still reads as one', () => {
    expect(buttonFor('ABCD2345')).toBeNull();
    expect(buttonFor('')).toBeNull();
    expect(buttonFor('Подписка')).toBeNull();
  });
});

describe('isButtonUrl', () => {
  it('accepts a public https address, the only kind Telegram puts behind a button', () => {
    expect(isButtonUrl('https://yoomoney.ru/checkout/payments/v2/contract?orderId=1')).toBe(true);
  });

  it('refuses plain http and app schemes, which Telegram rejects as BUTTON_URL_INVALID', () => {
    expect(isButtonUrl('http://example.com')).toBe(false);
    expect(isButtonUrl('incy://import/abc')).toBe(false);
  });

  it('refuses a local address, so the dev setup still sends the link as text', () => {
    expect(isButtonUrl('https://localhost:3000/telegram?code=x')).toBe(false);
    expect(isButtonUrl('https://127.0.0.1/x')).toBe(false);
  });

  it('refuses something that is not a URL at all', () => {
    expect(isButtonUrl('not a url')).toBe(false);
  });
});

describe('urlMessage', () => {
  it('puts a public https link behind a button and keeps it out of the text', () => {
    const url = 'https://pay.example.com/x?a=1&b=2';
    const { text, markup } = urlMessage({ ...base, url });
    const urls = markup?.inline_keyboard.flat().flatMap((button) => ('url' in button ? [button.url] : []));

    expect(text).toBe(base.intro);
    expect(urls).toEqual([url]);
  });

  it('writes a link Telegram would refuse as a button into the text instead, escaped', () => {
    const url = 'http://localhost:3000/x?a=1&b=2';
    const { text, markup } = urlMessage({ ...base, url });

    expect(markup).toBeUndefined();
    expect(html.strip(text)).toContain(url);
    expect(text).toContain('&amp;');
  });
});

describe('confirmKeyboard', () => {
  it('answers yes and no on the prefix it was given', () => {
    expect(callbackData(confirmKeyboard({ copy, prefix: CALLBACK_PREFIX.rotate }))).toEqual([
      `${CALLBACK_PREFIX.rotate}${CALLBACK_VALUE.answer.yes}`,
      `${CALLBACK_PREFIX.rotate}${CALLBACK_VALUE.answer.no}`
    ]);
  });

  it('carries the subject in a payload that reads back to the same device', () => {
    const data = callbackData(confirmKeyboard({ copy, prefix: CALLBACK_PREFIX.removeDevice, subject: deviceId }));
    const answers = data.map((value) => deviceAnswer(value.slice(CALLBACK_PREFIX.removeDevice.length)));

    expect(answers).toEqual([
      { isConfirmed: true, deviceId },
      { isConfirmed: false, deviceId }
    ]);
  });

  it('stays inside what Telegram accepts as callback data', () => {
    for (const value of callbackData(confirmKeyboard({ copy, prefix: CALLBACK_PREFIX.removeDevice, subject: deviceId }))) {
      expect(new TextEncoder().encode(value).length).toBeLessThanOrEqual(CALLBACK_DATA_LIMIT);
    }
  });
});

describe('offersPanel', () => {
  it('offers to turn offers off while they are on', () => {
    const panel = offersPanel({ isOn: true, locale: 'ru' });

    expect(panel.text).toBe(BOT_TEXT.ru.offersOn);
    expect(callbacks(panel)).toEqual([`${CALLBACK_PREFIX.offers}${CALLBACK_VALUE.switch.off}`]);
  });

  it('offers to turn them back on once they are off', () => {
    const panel = offersPanel({ isOn: false, locale: 'en' });

    expect(panel.text).toBe(BOT_TEXT.en.offersOff);
    expect(callbacks(panel)).toEqual([`${CALLBACK_PREFIX.offers}${CALLBACK_VALUE.switch.on}`]);
  });
});

describe('offersButton', () => {
  it('carries a payload the callback parser reads back as the opposite of the current state', () => {
    for (const isOn of [true, false]) {
      const button = offersButton({ isOn, locale: 'ru' });
      const data = 'callback_data' in button ? button.callback_data : '';

      expect(offersChoice(data.slice(CALLBACK_PREFIX.offers.length))).toBe(!isOn);
    }
  });
});

describe('noAccessMessage', () => {
  it('offers the free day to someone who never had access', () => {
    expect(noAccessMessage({ status: never, locale: 'ru' }).text).toBe(BOT_TEXT.ru.noSubscription);
  });

  it('tells a former subscriber the subscription ended rather than offering a trial they cannot take', () => {
    const lapsedStatus = { ...never, currentPeriodEnd: '2026-01-01T00:00:00.000Z', isTrialAvailable: false };

    expect(noAccessMessage({ status: lapsedStatus, locale: 'ru' }).text).toBe(BOT_TEXT.ru.lapsed);
  });

  it('does not offer a free day that is no longer available', () => {
    expect(noAccessMessage({ status: { ...never, isTrialAvailable: false }, locale: 'en' }).text).toBe(BOT_TEXT.en.inactive);
  });
});
