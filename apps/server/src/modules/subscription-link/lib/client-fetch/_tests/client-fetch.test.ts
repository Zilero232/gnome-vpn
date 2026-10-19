import { describe, expect, it } from 'vitest';

import { isClientFetch } from '../client-fetch';

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const HTML = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

const fetchBy = (userAgent: string, accept = '*/*') => ({ headers: { 'user-agent': userAgent, accept }, hwid: null });

describe('isClientFetch', () => {
  it('takes the VPN apps', () => {
    for (const agent of [
      'INCY/3.8.8/android',
      'v2rayNG/1.9.30',
      'HiddifyNext/2.5.7',
      'ClashMetaForAndroid/2.11',
      'Streisand/1.6',
      'NekoBox/1.3.4',
      'okhttp/4.12.0'
    ]) {
      expect(isClientFetch(fetchBy(agent)), agent).toBe(true);
    }
  });

  it('refuses a browser opening the link', () => {
    expect(isClientFetch(fetchBy(CHROME, HTML))).toBe(false);
  });

  it('refuses the link previews messengers fetch when the link is sent in a chat', () => {
    for (const agent of [
      'TelegramBot (like TwitterBot)',
      'WhatsApp/2.23.20.0',
      'facebookexternalhit/1.1',
      'Twitterbot/1.0',
      'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
      'Slackbot-LinkExpanding 1.0',
      'vkShare; +http://vk.com/dev/Share',
      'Viber/21.4 CFNetwork/1410.0.3 Darwin/22.6.0'
    ]) {
      expect(isClientFetch(fetchBy(agent)), agent).toBe(false);
    }
  });

  it('takes an app that borrows a browser user agent but does not ask for a page', () => {
    expect(isClientFetch(fetchBy(CHROME, '*/*'))).toBe(true);
  });

  it('takes anything that reports a hardware id, whatever its user agent says', () => {
    expect(isClientFetch({ ...fetchBy(CHROME, HTML), hwid: 'ABCDEF12-3456' })).toBe(true);
  });

  it('takes a fetch with no user agent at all', () => {
    expect(isClientFetch({ headers: {}, hwid: null })).toBe(true);
  });
});
