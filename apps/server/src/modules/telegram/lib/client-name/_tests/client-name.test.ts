import { CLIENT_IDS, CLIENT_REGISTRY } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { BOT_LOCALES, BOT_TEXT } from '../../../config';
import { clientName, clientPaste, parseClientId } from '../client-name';

describe('clientName', () => {
  it('names every client the registry publishes', () => {
    for (const id of CLIENT_IDS) {
      expect(clientName({ id, locale: 'ru' }).trim()).not.toBe('');
    }
  });

  it('marks the recommended client, and only that one', () => {
    for (const locale of BOT_LOCALES) {
      const marked = CLIENT_IDS.filter((id) => clientName({ id, locale }).includes(BOT_TEXT[locale].appsRecommended));
      const recommended = CLIENT_IDS.filter((id) => CLIENT_REGISTRY[id].isRecommended);

      expect(marked).toEqual(recommended);
    }
  });

  it('keeps the brand name identical across languages', () => {
    for (const id of CLIENT_IDS) {
      const [ru, en] = BOT_LOCALES.map((locale) => clientName({ id, locale }));

      expect(en.split(' ')[0]).toBe(ru.split(' ')[0]);
    }
  });
});

describe('parseClientId', () => {
  it('accepts every id the registry holds', () => {
    for (const id of CLIENT_IDS) {
      expect(parseClientId(id)).toBe(id);
    }
  });

  it('refuses anything else, so a crafted payload cannot index the registry', () => {
    expect(parseClientId('made-up')).toBeNull();
    expect(parseClientId('')).toBeNull();
    expect(parseClientId('__proto__')).toBeNull();
    expect(parseClientId('constructor')).toBeNull();
  });
});

describe('clientPaste', () => {
  it('says where to paste for every app, in every language', () => {
    for (const locale of BOT_LOCALES) {
      for (const id of CLIENT_IDS) {
        expect(clientPaste({ id, locale }).trim()).not.toBe('');
      }
    }
  });

  it('gives each app its own instruction', () => {
    const instructions = CLIENT_IDS.map((id) => clientPaste({ id, locale: 'en' }));

    expect(new Set(instructions).size).toBe(CLIENT_IDS.length);
  });
});
