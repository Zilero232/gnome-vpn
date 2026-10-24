import { describe, expect, it } from 'vitest';

import { html } from '@/modules/telegram/lib/html';

import { SEND_DEFAULTS } from '../send-defaults.constants';
import { cellsOf, isFormatted, repairFor, withDefaults, withWidth } from '../send-defaults.helpers';

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
  const { cells, fill } = SEND_DEFAULTS.width;

  const lastLine = (text: string) => html.strip(text).split('\n').at(-1) ?? '';

  it("widens a reader's message on its last line, so every bubble is one width without an extra line at the bottom", () => {
    const text = '💳 <b>Подписка</b>\nВторая строка';
    const widened = withWidth({ chat_id: 42, text }).text as string;

    expect(widened.split('\n')).toHaveLength(text.split('\n').length);
    expect(widened.startsWith(`${text} `)).toBe(true);
    expect(cellsOf(lastLine(widened))).toBe(cells);
  });

  it('leaves a message that is already as wide as the target', () => {
    const wide = { chat_id: 42, text: 'я'.repeat(cells) };

    expect(withWidth(wide)).toEqual(wide);
  });

  it('keeps the fill inside a closing quote, where a new line would otherwise start', () => {
    const widened = withWidth({ chat_id: 42, text: 'Итог\n<blockquote>цитата</blockquote>' }).text as string;

    expect(widened.endsWith(`${fill}</blockquote>`)).toBe(true);
    expect(widened.split('\n')).toHaveLength(2);
  });

  it('adds it once, even to a text that already went through', () => {
    const once = withWidth({ chat_id: 42, text: 'x' });

    expect(withWidth(once)).toEqual(once);
  });

  it('leaves a group, such as the admin chat, and anything without text as it is', () => {
    expect(withWidth({ chat_id: -1_001_234_567_890, text: 'alert' }).text).toBe('alert');
    expect(withWidth({ chat_id: 42, caption: 'file' })).toEqual({ chat_id: 42, caption: 'file' });
  });

  it('counts an emoji as two cells and ignores markup', () => {
    expect(cellsOf('💳 a')).toBe(4);
    expect(cellsOf(html.strip('<b>ab</b> &amp;'))).toBe(4);
  });

  it('is invisible: the fill is a blank braille cell, which Telegram does not trim', () => {
    expect(fill).toBe('\u2800');
    expect(fill.trim()).toBe(fill);
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
