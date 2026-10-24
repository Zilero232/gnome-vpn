import type { Device, DeviceList, WireguardNode, WireguardOverview } from '@gnomevpn/schemas';

import { CLIENT_IDS, CLIENT_REGISTRY, MAX_EXTRA_DEVICES, resolveLimits } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import type { BotMessage } from '@/modules/telegram/telegram.types';

import { BOT_LOCALES, BOT_PLATFORMS, BOT_TEXT, CALLBACK_PREFIX, CALLBACK_VALUE } from '@/modules/telegram/config';
import { fillText, formatDate, html, isTelegramHtml } from '@/modules/telegram/shared/text';

import {
  clientName,
  clientPaste,
  deviceLabel,
  deviceLine,
  deviceName,
  devicesText,
  devicesView,
  platformNames,
  removeDeviceCopy,
  wireguardCaption,
  wireguardKindView,
  wireguardName,
  wireguardView
} from '../device-view';

const device = (overrides: Partial<Device> = {}): Device => ({
  id: '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b',
  model: 'Pixel 8',
  platform: 'Android',
  osVersion: '15',
  app: 'INCY',
  isIdentified: true,
  isOverLimit: false,
  createdAt: '2026-03-01T12:00:00.000Z',
  lastSeenAt: '2026-03-09T12:00:00.000Z',
  ...overrides
});

const listOf = (devices: Device[], deviceLimit = 2): DeviceList => ({ devices, deviceLimit });

describe('deviceName', () => {
  it('prefers the model, then the app, then a word for an unnamed device', () => {
    for (const locale of BOT_LOCALES) {
      expect(deviceName({ device: device(), locale })).toBe('Pixel 8');
      expect(deviceName({ device: device({ model: null }), locale })).toBe('INCY');
      expect(deviceName({ device: device({ model: null, app: null }), locale })).toBe(BOT_TEXT[locale].deviceUnnamed);
    }
  });

  it('skips a blank model rather than naming the device with nothing', () => {
    expect(deviceName({ device: device({ model: '  ' }), locale: 'en' })).toBe('INCY');
  });
});

describe('deviceLabel', () => {
  it('numbers from one, so a button matches its line', () => {
    expect(deviceLabel({ device: device(), index: 0, locale: 'en' })).toBe('1. Pixel 8');
  });
});

describe('deviceLine', () => {
  it('shows the system, the app and when the device was last seen', () => {
    for (const locale of BOT_LOCALES) {
      const line = deviceLine({ device: device(), index: 0, locale });

      expect(line).toContain('Android 15');
      expect(line).toContain('INCY');
      expect(line).toContain(formatDate({ iso: device().lastSeenAt, locale }));
    }
  });

  it('does not repeat the app when it already names the device', () => {
    const line = deviceLine({ device: device({ model: null }), index: 0, locale: 'en' });

    expect(line.split('INCY')).toHaveLength(2);
  });

  it('marks only a device over the limit', () => {
    for (const locale of BOT_LOCALES) {
      expect(deviceLine({ device: device({ isOverLimit: true }), index: 0, locale })).toContain(BOT_TEXT[locale].deviceOverLimit);
      expect(deviceLine({ device: device(), index: 0, locale })).not.toContain(BOT_TEXT[locale].deviceOverLimit);
    }
  });

  it('leaves out what the app did not report', () => {
    const line = deviceLine({ device: device({ model: null, platform: null, osVersion: null, app: null }), index: 0, locale: 'en' });
    const [title = ''] = line.split('\n');

    expect(html.strip(title)).toBe(`1. ${BOT_TEXT.en.deviceUnnamed}`);
  });
});

describe('devicesText', () => {
  it('counts the devices against the limit', () => {
    const limit = 7;
    const devices = [device(), device(), device()];
    const [header] = devicesText({ list: listOf(devices, limit), locale: 'en' }).split('\n');

    expect(header).toContain(String(devices.length));
    expect(header).toContain(String(limit));
  });

  it('gives every device its own numbered line', () => {
    const text = devicesText({ list: listOf([device({ model: 'Pixel 8' }), device({ model: 'iPhone 15' })]), locale: 'en' });

    expect(text).toContain('1. Pixel 8');
    expect(text).toContain('2. iPhone 15');
  });

  it('explains how a device appears when there are none yet', () => {
    for (const locale of BOT_LOCALES) {
      expect(devicesText({ list: listOf([]), locale })).toContain(BOT_TEXT[locale].devicesEmpty);
    }
  });
});

describe('devicesText markup', () => {
  it('escapes what a device reports about itself, so a hostile model name cannot break the message', () => {
    for (const locale of BOT_LOCALES) {
      const text = devicesText({ list: listOf([device({ model: '<b>Evil & Co', app: '</i>' })]), locale });

      expect(isTelegramHtml(text)).toBe(true);
      expect(html.strip(text)).toContain('<b>Evil & Co');
    }
  });
});

const emptyList: DeviceList = { devices: [], deviceLimit: 2 };

const buttonsOf = (view: BotMessage) => view.markup?.inline_keyboard.flat() ?? [];

const offersPlaces = (view: BotMessage): boolean =>
  buttonsOf(view).some((button) => 'callback_data' in button && button.callback_data.startsWith(CALLBACK_PREFIX.devices));

describe('devicesView', () => {
  it('offers extra places on a paid period', () => {
    expect(offersPlaces(devicesView({ list: emptyList, status: { period: 'paid', limits: resolveLimits(0) }, locale: 'en' }))).toBe(true);
  });

  it('offers none on a trial, which the server would refuse anyway', () => {
    expect(offersPlaces(devicesView({ list: emptyList, status: { period: 'trial', limits: resolveLimits(0) }, locale: 'en' }))).toBe(false);
  });

  it('says the cap is reached with a disabled button instead of buttons that would fail', () => {
    const view = devicesView({ list: emptyList, status: { period: 'paid', limits: resolveLimits(MAX_EXTRA_DEVICES) }, locale: 'en' });
    const disabled = buttonsOf(view).flatMap((button) => ('disabled' in button ? [button.text] : []));

    expect(offersPlaces(view)).toBe(false);
    expect(disabled).toEqual([BOT_TEXT.en.devicesFull]);
  });

  it('offers only the quantities that still fit under the cap', () => {
    const view = devicesView({ list: emptyList, status: { period: 'paid', limits: resolveLimits(MAX_EXTRA_DEVICES - 1) }, locale: 'en' });
    const offered = buttonsOf(view).flatMap((button) =>
      'callback_data' in button && button.callback_data.startsWith(CALLBACK_PREFIX.devices)
        ? [Number(button.callback_data.slice(CALLBACK_PREFIX.devices.length))]
        : []
    );

    expect(offered).toEqual([1]);
  });

  it('leads with the notice it is given', () => {
    const view = devicesView({ list: emptyList, status: { period: 'paid', limits: resolveLimits(0) }, locale: 'en', notice: 'Removed' });

    expect(view.text.startsWith('Removed')).toBe(true);
  });
});

describe('removeDeviceCopy', () => {
  it('names the device in the question, in every language', () => {
    for (const locale of BOT_LOCALES) {
      expect(removeDeviceCopy({ copy: BOT_TEXT[locale], name: 'Pixel 8' }).ask).toContain('Pixel 8');
    }
  });
});

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
      CALLBACK_VALUE.wireguardKinds.map((kind) => `${CALLBACK_PREFIX.wireguardCreate}${amsterdam.id}${CALLBACK_VALUE.separator}${kind}`)
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

describe('wireguardName', () => {
  it('keeps the plain name while it is free', () => {
    expect(wireguardName({ base: 'Phone', taken: ['Laptop'] })).toBe('Phone');
  });

  it('numbers a name that is already taken, starting from two', () => {
    expect(wireguardName({ base: 'Phone', taken: ['Phone'] })).toBe('Phone 2');
  });

  it('skips the numbers already in use', () => {
    expect(wireguardName({ base: 'Phone', taken: ['Phone', 'Phone 2', 'Phone 3'] })).toBe('Phone 4');
  });

  it('fills the first gap rather than counting past it', () => {
    expect(wireguardName({ base: 'Phone', taken: ['Phone', 'Phone 3'] })).toBe('Phone 2');
  });
});

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

      expect(en?.split(' ')[0]).toBe(ru?.split(' ')[0]);
    }
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

describe('platformNames', () => {
  it('names every platform of a client in the locale it is asked for', () => {
    const { platforms } = CLIENT_REGISTRY.incy;

    for (const locale of BOT_LOCALES) {
      const named = platformNames({ platforms: [...platforms], locale });

      for (const platform of platforms) {
        expect(named).toContain(BOT_PLATFORMS[locale][platform]);
      }
    }
  });

  it('leaves no raw identifier in what a reader sees', () => {
    const named = platformNames({ platforms: ['ios', 'macos', 'tv'], locale: 'ru' });

    expect(named).not.toContain('ios');
    expect(named).not.toContain('macos');
    expect(named).not.toContain('tv');
  });

  it('translates every platform a client can declare', () => {
    const declared = new Set(Object.values(CLIENT_REGISTRY).flatMap((client) => client.platforms));

    for (const locale of BOT_LOCALES) {
      for (const platform of declared) {
        expect(BOT_PLATFORMS[locale][platform]).toBeTruthy();
      }
    }
  });
});
