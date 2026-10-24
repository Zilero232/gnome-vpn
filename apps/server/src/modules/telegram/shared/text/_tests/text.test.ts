import { subMinutes } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import { AppBadRequestException } from '@/common/exceptions';

import type { TextToken } from '../text.types';

import { html, isTelegramHtml } from '../html';
import { dayCount, fillLabel, fillText, formatAgo, formatDate, refusalText, resolveLocale } from '../text';

const token = (name: TextToken): string => `{${name}}`;

const iso = '2026-03-09T12:00:00.000Z';

const COPIES = { REFERRAL_SELF: 'self', REFERRAL_CODE_INVALID: 'invalid' };

describe('html.escape', () => {
  it('escapes the characters Telegram reads as markup, so a device name cannot break a message', () => {
    expect(html.escape('Tom & Jerry <TV> "4K"')).toBe('Tom &amp; Jerry &lt;TV&gt; &quot;4K&quot;');
  });

  it('leaves ordinary text alone', () => {
    expect(html.escape('Pixel 8 — Android 15')).toBe('Pixel 8 — Android 15');
  });
});

describe('html.strip', () => {
  it('turns markup back into the text a reader would have seen', () => {
    expect(html.strip('<b>Paid</b> &amp; <a href="https://x.y">done</a> &lt;3')).toBe('Paid & done <3');
  });

  it('undoes html.escape exactly', () => {
    const raw = 'a & b < c > d "e"';

    expect(html.strip(html.escape(raw))).toBe(raw);
  });
});

describe('isTelegramHtml', () => {
  it('accepts the tags Telegram supports, nested and with attributes', () => {
    expect(isTelegramHtml('<b>Hi</b> <blockquote expandable><i>x</i> <a href="https://a.b">y</a></blockquote>')).toBe(true);
  });

  it('refuses a tag Telegram does not know', () => {
    expect(isTelegramHtml('<div>x</div>')).toBe(false);
  });

  it('refuses unbalanced or crossed tags', () => {
    expect(isTelegramHtml('<b>x')).toBe(false);
    expect(isTelegramHtml('<b><i>x</b></i>')).toBe(false);
  });

  it('refuses a bare angle bracket, which Telegram rejects as a broken tag', () => {
    expect(isTelegramHtml('5 < 6')).toBe(false);
  });
});

describe('html.bold and html.code', () => {
  it('escape what they wrap', () => {
    expect(html.bold('<x>')).toBe('<b>&lt;x&gt;</b>');
    expect(html.code('a&b')).toBe('<code>a&amp;b</code>');
  });
});

describe('html.paragraphs', () => {
  it('puts a blank line between the parts and skips the missing ones', () => {
    expect(html.paragraphs(['a', null, '', 'b', undefined])).toBe('a\n\nb');
  });
});

describe('fillText', () => {
  it('replaces the token a caller names, which is the whole job', () => {
    const text = fillText({ text: `until ${token('date')}`, fill: { date: '1 January' } });

    expect(text).toBe('until 1 January');
  });

  it('replaces every occurrence, because a token can appear twice in one string', () => {
    const text = fillText({ text: `${token('count')} of ${token('count')}`, fill: { count: '2' } });

    expect(text).toBe('2 of 2');
  });

  it('leaves a token nobody filled alone rather than blanking it', () => {
    const text = fillText({ text: `${token('date')} and ${token('plan')}`, fill: { date: 'today' } });

    expect(text).toContain(token('plan'));
  });

  it('returns the text unchanged for an empty fill', () => {
    expect(fillText({ text: 'nothing to do', fill: {} })).toBe('nothing to do');
  });
});

describe('fillText escaping', () => {
  it('escapes what it puts in, so a device called "<TV>" cannot break the markup around it', () => {
    expect(fillText({ text: `<b>${token('name')}</b>`, fill: { name: 'Tom & <TV>' } })).toBe('<b>Tom &amp; &lt;TV&gt;</b>');
  });
});

describe('replacement patterns', () => {
  it('puts a value in verbatim even when it looks like a replacement pattern, as a Telegram name may', () => {
    for (const name of ["$'", '$&', '$`', '$$', '$1']) {
      expect(fillText({ text: `<b>${token('name')}</b>`, fill: { name } })).toBe(`<b>${html.escape(name)}</b>`);
      expect(fillLabel({ text: `x ${token('name')}`, fill: { name } })).toBe(`x ${name}`);
    }
  });
});

describe('fillLabel', () => {
  it('fills a button label verbatim, because a button shows text rather than markup', () => {
    expect(fillLabel({ text: `x ${token('name')}`, fill: { name: 'Tom & Jerry' } })).toBe('x Tom & Jerry');
  });
});

describe('formatDate', () => {
  it('renders the date in the language it is asked for', () => {
    expect(formatDate({ iso, locale: 'ru' })).toContain('март');
    expect(formatDate({ iso, locale: 'en' })).toContain('March');
  });

  it('names the same day in both languages', () => {
    for (const locale of ['ru', 'en'] as const) {
      expect(formatDate({ iso, locale })).toContain('9');
      expect(formatDate({ iso, locale })).toContain('2026');
    }
  });

  it('renders nothing for a subscription that has no period', () => {
    expect(formatDate({ iso: null, locale: 'ru' })).toBe('');
  });
});

describe('formatAgo', () => {
  const now = new Date(iso);

  it('puts a past moment in the past, in each language', () => {
    const date = subMinutes(now, 21);

    expect(formatAgo({ date, now, locale: 'ru' })).toContain('назад');
    expect(formatAgo({ date, now, locale: 'en' })).toContain('ago');
  });

  it('names the distance it measured', () => {
    expect(formatAgo({ date: subMinutes(now, 21), now, locale: 'en' })).toContain('21');
  });
});

describe('dayCount', () => {
  it('declines the Russian noun by the number', () => {
    expect(dayCount({ days: 1, locale: 'ru' })).toBe('1 день');
    expect(dayCount({ days: 3, locale: 'ru' })).toBe('3 дня');
    expect(dayCount({ days: 7, locale: 'ru' })).toBe('7 дней');
    expect(dayCount({ days: 21, locale: 'ru' })).toBe('21 день');
  });

  it('uses the singular only for one day in English', () => {
    expect(dayCount({ days: 1, locale: 'en' })).toBe('1 day');
    expect(dayCount({ days: 15, locale: 'en' })).toBe('15 days');
  });
});

describe('resolveLocale', () => {
  it('reads the region off a full tag rather than expecting a bare language', () => {
    expect(resolveLocale('ru-RU')).toBe('ru');
    expect(resolveLocale('en-GB')).toBe('en');
  });

  it('ignores the case Telegram happens to send', () => {
    expect(resolveLocale('RU')).toBe('ru');
  });

  it('serves English to a language we do not speak, rather than guessing', () => {
    expect(resolveLocale('de')).toBe('en');
    expect(resolveLocale('zh-CN')).toBe('en');
  });

  it('serves English when the client reports nothing at all', () => {
    expect(resolveLocale(null)).toBe('en');
    expect(resolveLocale(undefined)).toBe('en');
    expect(resolveLocale('')).toBe('en');
  });
});

describe('refusalText', () => {
  it('answers a known refusal with its own copy, without reporting it', () => {
    const onUnknown = vi.fn();

    const text = refusalText({ error: new AppBadRequestException('REFERRAL_SELF', 'no'), copies: COPIES, fallback: 'later', onUnknown });

    expect(text).toBe('self');
    expect(onUnknown).not.toHaveBeenCalled();
  });

  it('falls back and reports an error it has no copy for, so a real failure is not passed off as a refusal', () => {
    const onUnknown = vi.fn();
    const error = new Error('database down');

    const text = refusalText({ error, copies: COPIES, fallback: 'later', onUnknown });

    expect(text).toBe('later');
    expect(onUnknown).toHaveBeenCalledWith(error);
  });

  it('treats a coded error outside the map as unknown', () => {
    const onUnknown = vi.fn();

    const text = refusalText({ error: new AppBadRequestException('REFERRAL_UNAVAILABLE', 'no'), copies: COPIES, fallback: 'later', onUnknown });

    expect(text).toBe('later');
    expect(onUnknown).toHaveBeenCalledTimes(1);
  });
});
