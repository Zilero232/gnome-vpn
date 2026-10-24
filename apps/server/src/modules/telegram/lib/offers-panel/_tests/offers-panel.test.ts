import { describe, expect, it } from 'vitest';

import type { BotMessage } from '@/modules/telegram/telegram.types';

import { BOT_TEXT, CALLBACK_PREFIX, OFFERS_CHOICE } from '@/modules/telegram/config';
import { offersChoice } from '@/modules/telegram/lib/callback-value';

import { offersButton, offersPanel } from '../offers-panel';

const callbacks = (panel: BotMessage): string[] =>
  panel.markup?.inline_keyboard.flat().flatMap((button) => ('callback_data' in button ? [button.callback_data] : [])) ?? [];

describe('offersPanel', () => {
  it('offers to turn offers off while they are on', () => {
    const panel = offersPanel({ isOn: true, locale: 'ru' });

    expect(panel.text).toBe(BOT_TEXT.ru.offersOn);
    expect(callbacks(panel)).toEqual([`${CALLBACK_PREFIX.offers}${OFFERS_CHOICE.off}`]);
  });

  it('offers to turn them back on once they are off', () => {
    const panel = offersPanel({ isOn: false, locale: 'en' });

    expect(panel.text).toBe(BOT_TEXT.en.offersOff);
    expect(callbacks(panel)).toEqual([`${CALLBACK_PREFIX.offers}${OFFERS_CHOICE.on}`]);
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

describe('offersChoice', () => {
  it('reads nothing but the two known answers', () => {
    expect(offersChoice('maybe')).toBeNull();
    expect(offersChoice('')).toBeNull();
  });
});
