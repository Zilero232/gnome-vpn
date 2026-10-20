import { describe, expect, it } from 'vitest';

import { botUrl } from '../bot-url';
import { BOT_URL_BASE } from '../bot-url.constants';

describe('botUrl', () => {
  it('points at the chat with the bot', () => {
    expect(botUrl('GnomeBot')).toBe(`${BOT_URL_BASE}GnomeBot`);
  });

  it('drops a leading at sign someone typed into the variable', () => {
    expect(botUrl('@GnomeBot')).toBe(`${BOT_URL_BASE}GnomeBot`);
  });

  it('answers undefined when no bot is configured, so the caller keeps its own default', () => {
    expect(botUrl('')).toBeUndefined();
    expect(botUrl(undefined)).toBeUndefined();
  });
});
