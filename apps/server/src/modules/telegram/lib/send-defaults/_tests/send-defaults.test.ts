import { describe, expect, it } from 'vitest';

import { SEND_DEFAULTS } from '../send-defaults.constants';
import { isFormatted, repairFor, withDefaults, withWidth } from '../send-defaults.helpers';

const sent = { chat_id: 1, text: '<b>Paid</b> &amp; done', parse_mode: 'HTML', message_effect_id: '1', reply_markup: { a: 1 } };

describe('withDefaults', () => {
  it('formats as HTML and hides link previews unless the caller says otherwise', () => {
    expect(withDefaults({ text: 'x' })).toEqual({ text: 'x', parse_mode: 'HTML', link_preview_options: { is_disabled: true } });
  });

  it('lets a caller override either default', () => {
    expect(withDefaults({ text: 'x', link_preview_options: { is_disabled: false } }).link_preview_options).toEqual({ is_disabled: false });
  });
});

describe('withWidth', () => {
  it("ends a reader's message with a blank line of the same width, so every bubble and its buttons are one width", () => {
    const widened = withWidth({ chat_id: 42, text: '💳 <b>Подписка</b>' });

    expect(widened.text).toBe(`💳 <b>Подписка</b>\n${SEND_DEFAULTS.widthLine}`);
    expect(withWidth({ chat_id: '42', text: 'x' }).text).toBe(`x\n${SEND_DEFAULTS.widthLine}`);
  });

  it('adds it once, even to a text that already went through', () => {
    const once = withWidth({ chat_id: 42, text: 'x' });

    expect(withWidth(once)).toEqual(once);
  });

  it('leaves a group, such as the admin chat, and anything without text as it is', () => {
    expect(withWidth({ chat_id: -1_001_234_567_890, text: 'alert' }).text).toBe('alert');
    expect(withWidth({ chat_id: 42, caption: 'file' })).toEqual({ chat_id: 42, caption: 'file' });
  });

  it('is invisible: the line holds nothing but blank braille cells, which Telegram does not trim', () => {
    expect([...SEND_DEFAULTS.widthLine].every((char) => char === '\u2800')).toBe(true);
    expect(SEND_DEFAULTS.widthLine.trim()).toBe(SEND_DEFAULTS.widthLine);
  });
});

describe('repairFor', () => {
  it('sends a message Telegram could not parse again as plain text, keeping the effect and the buttons', () => {
    const repair = repairFor({ error_code: 400, description: "Bad Request: can't parse entities: Unclosed start tag" });

    expect(repair?.(sent)).toEqual({ chat_id: 1, text: 'Paid & done', message_effect_id: '1', reply_markup: { a: 1 } });
  });

  it('drops only an effect Telegram does not know, so the formatting survives', () => {
    const repair = repairFor({ error_code: 400, description: 'Bad Request: EFFECT_ID_INVALID' });

    expect(repair?.(sent)).toEqual({ chat_id: 1, text: sent.text, parse_mode: 'HTML', reply_markup: { a: 1 } });
  });

  it('leaves every other failure to the caller', () => {
    expect(repairFor({ error_code: 403, description: 'Forbidden: bot was blocked by the user' })).toBeNull();
    expect(repairFor({ error_code: 400, description: 'Bad Request: chat not found' })).toBeNull();
  });
});

describe('isFormatted', () => {
  it('covers sending and editing text, nothing else', () => {
    expect(isFormatted('sendMessage')).toBe(true);
    expect(isFormatted('editMessageText')).toBe(true);
    expect(isFormatted('answerCallbackQuery')).toBe(false);
  });
});
