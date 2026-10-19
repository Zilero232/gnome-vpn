import { describe, expect, it } from 'vitest';

import { shareTargets } from '../share-targets';

const URL_ = 'https://gnome-vpn.com/?ref=ABCDEF23';
const TEXT = 'Пользуюсь GnomeVPN & советую';

const targets = shareTargets({ url: URL_, text: TEXT, subject: 'Приглашение' });
const hrefOf = (key: string) => targets.find((target) => target.key === key)?.href ?? '';

describe('shareTargets', () => {
  it('offers every messenger once', () => {
    expect(targets.map((target) => target.key)).toEqual(['telegram', 'whatsapp', 'vk', 'email']);
  });

  it('opens the Telegram share sheet with the link and the message', () => {
    const url = new URL(hrefOf('telegram'));

    expect(url.origin + url.pathname).toBe('https://t.me/share/url');
    expect(url.searchParams.get('url')).toBe(URL_);
    expect(url.searchParams.get('text')).toBe(TEXT);
  });

  it('puts the link inside the WhatsApp message, which has no separate link field', () => {
    expect(new URL(hrefOf('whatsapp')).searchParams.get('text')).toBe(`${TEXT} ${URL_}`);
  });

  it('hands VK the link to preview', () => {
    expect(new URL(hrefOf('vk')).searchParams.get('url')).toBe(URL_);
  });

  it('encodes spaces as %20 everywhere, since not every messenger reads a plus sign as a space', () => {
    for (const { href } of targets) {
      expect(href, href).not.toContain('+');
    }
  });

  it('writes the email with the subject and the link in the body', () => {
    const href = hrefOf('email');

    expect(href.startsWith('mailto:?subject=')).toBe(true);
    expect(href).not.toContain('+');
    expect(decodeURIComponent(href)).toContain(URL_);
  });
});
