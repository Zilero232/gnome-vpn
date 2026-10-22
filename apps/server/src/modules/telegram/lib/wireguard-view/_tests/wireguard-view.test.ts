import type { WireguardNode, WireguardOverview } from '@gnomevpn/schemas';

import { describe, expect, it } from 'vitest';

import type { BotMessage } from '../../../telegram.types';

import { BOT_TEXT, CALLBACK_PREFIX, SUBJECT_SEPARATOR, WIREGUARD_KINDS } from '../../../config';
import { fillText } from '../../fill-text';
import { wireguardCaption, wireguardKindView, wireguardView } from '../wireguard-view';

const amsterdam: WireguardNode = {
  id: '0b8f6f3e-2f4c-4a77-9b1e-5d6c7a8b9c0d',
  country: 'Netherlands',
  countryCode: 'NL',
  city: 'Amsterdam',
  isDown: false
};

const helsinki: WireguardNode = {
  id: '7d9e2a1b-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
  country: 'Finland',
  countryCode: 'FI',
  city: 'Helsinki',
  isDown: false
};

const config = { deviceId: '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b', name: 'Laptop', node: amsterdam, createdAt: '2026-10-01T00:00:00.000Z' };

const overview = (patch: Partial<WireguardOverview> = {}): WireguardOverview => ({
  nodes: [amsterdam, helsinki],
  configs: [],
  deviceCount: 0,
  deviceLimit: 2,
  ...patch
});

const callbacks = (view: BotMessage): string[] =>
  view.markup?.inline_keyboard.flat().flatMap((button) => ('callback_data' in button ? [button.callback_data] : [])) ?? [];

const withPrefix = (view: BotMessage, prefix: string): string[] => callbacks(view).filter((data) => data.startsWith(prefix));

describe('wireguardView', () => {
  it('offers a new config on every server that is up', () => {
    const view = wireguardView({ overview: overview({ nodes: [amsterdam, { ...helsinki, isDown: true }] }), locale: 'en' });

    expect(withPrefix(view, CALLBACK_PREFIX.wireguardNode)).toEqual([`${CALLBACK_PREFIX.wireguardNode}${amsterdam.id}`]);
    expect(view.text).toContain(BOT_TEXT.en.wireguardPick);
  });

  it('offers a file button for every existing config', () => {
    const view = wireguardView({ overview: overview({ configs: [config], deviceCount: 1 }), locale: 'en' });

    expect(withPrefix(view, CALLBACK_PREFIX.wireguardFile)).toEqual([`${CALLBACK_PREFIX.wireguardFile}${config.deviceId}`]);
    expect(view.text).toContain(BOT_TEXT.en.wireguardConfigs);
  });

  it('offers no new config once every place is taken, and points at the devices instead', () => {
    const view = wireguardView({ overview: overview({ configs: [config], deviceCount: 2 }), locale: 'en' });

    expect(withPrefix(view, CALLBACK_PREFIX.wireguardNode)).toEqual([]);
    expect(callbacks(view)).toContain(`${CALLBACK_PREFIX.menu}devices`);
    expect(view.text).toContain(BOT_TEXT.en.wireguardFull);
  });

  it('says when no server runs WireGuard at all', () => {
    const view = wireguardView({ overview: overview({ nodes: [] }), locale: 'en' });

    expect(view.text).toContain(BOT_TEXT.en.wireguardNoServers);
  });

  it('says when every WireGuard server is down rather than offering nothing silently', () => {
    const view = wireguardView({ overview: overview({ nodes: [{ ...amsterdam, isDown: true }] }), locale: 'en' });

    expect(withPrefix(view, CALLBACK_PREFIX.wireguardNode)).toEqual([]);
    expect(view.text).toContain(BOT_TEXT.en.wireguardAllDown);
  });

  it('never ships an empty row of buttons', () => {
    for (const patch of [{}, { configs: [config], deviceCount: 2 }, { nodes: [] }]) {
      const rows = wireguardView({ overview: overview(patch), locale: 'en' }).markup?.inline_keyboard ?? [];

      expect(rows.every((row) => row.length > 0)).toBe(true);
    }
  });

  it('says the limit once when the refusal and the screen would both say it', () => {
    const text = wireguardView({ overview: overview({ configs: [config], deviceCount: 2 }), locale: 'en', notice: { key: 'wireguardFull' } }).text;

    expect(text.split(BOT_TEXT.en.wireguardFull)).toHaveLength(2);
  });

  it('drops a "pick another server" notice when no server is up to pick', () => {
    const view = wireguardView({
      overview: overview({ nodes: [{ ...amsterdam, isDown: true }] }),
      locale: 'en',
      notice: { key: 'wireguardUnavailable' }
    });

    expect(view.text).not.toContain(BOT_TEXT.en.wireguardUnavailable);
  });

  it('keeps the "config ready" notice even when that config took the last place', () => {
    const view = wireguardView({
      overview: overview({ configs: [config], deviceCount: 2 }),
      locale: 'en',
      notice: { key: 'wireguardCreated', fill: { name: 'Laptop' } }
    });

    expect(view.text.startsWith(fillText({ text: BOT_TEXT.en.wireguardCreated, fill: { name: 'Laptop' } }))).toBe(true);
  });

  it('says the limit before anything about servers, since the limit is what blocks a new config', () => {
    const view = wireguardView({ overview: overview({ nodes: [], deviceCount: 2 }), locale: 'en' });

    expect(view.text).toContain(BOT_TEXT.en.wireguardFull);
    expect(view.text).not.toContain(BOT_TEXT.en.wireguardNoServers);
  });

  it('leads with the notice it is given', () => {
    expect(wireguardView({ overview: overview(), locale: 'en', notice: { key: 'deviceGone' } }).text.startsWith(BOT_TEXT.en.deviceGone)).toBe(true);
  });

  it('names the country in the reader’s language', () => {
    const [button] = wireguardView({ overview: overview({ nodes: [amsterdam] }), locale: 'ru' }).markup?.inline_keyboard.flat() ?? [];

    expect(button?.text).toContain('Нидерланды');
    expect(button?.text).toContain('🇳🇱');
  });
});

describe('wireguardKindView', () => {
  it('offers one button per kind of device, each naming the server and the kind', () => {
    const view = wireguardKindView({ node: amsterdam, locale: 'en' });

    expect(withPrefix(view, CALLBACK_PREFIX.wireguardCreate)).toEqual(
      WIREGUARD_KINDS.map(({ kind }) => `${CALLBACK_PREFIX.wireguardCreate}${amsterdam.id}${SUBJECT_SEPARATOR}${kind}`)
    );
  });

  it('keeps every payload inside Telegram’s 64-byte limit', () => {
    for (const data of callbacks(wireguardKindView({ node: amsterdam, locale: 'en' }))) {
      expect(new TextEncoder().encode(data).length).toBeLessThanOrEqual(64);
    }
  });

  it('leads back to the list', () => {
    expect(callbacks(wireguardKindView({ node: amsterdam, locale: 'en' }))).toContain(CALLBACK_PREFIX.wireguard);
  });
});

describe('wireguardCaption', () => {
  it('escapes the config name, because a device names itself', () => {
    const caption = wireguardCaption({ config: { ...config, name: '<TV>' }, how: 'Open it', locale: 'en' });

    expect(caption).toContain('&lt;TV&gt;');
    expect(caption).toContain('Open it');
  });
});
