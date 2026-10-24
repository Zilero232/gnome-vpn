import type { WireguardOverview } from '@gnomevpn/schemas';
import type { InlineKeyboard } from 'grammy';

import { CLIENT_IDS, CLIENT_REGISTRY, PLANS, resolveLimits } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { BOT_TEXT, CALLBACK_PREFIX } from '../config';
import { appsKeyboard, clientView, devicesView, removeDeviceCopy, wireguardKindView, wireguardView } from '../devices/device-view';
import { audienceKeyboard, broadcastConfirm } from '../owner/broadcast';
import { confirmKeyboard, deleteCopy, languageKeyboard, menuButtons, moreKeyboard, offersPanel, rotateCopy, unlinkCopy } from '../shared/keyboard';
import { LEGACY_BUTTONS } from '../shared/keyboard/keyboard.config';
import { autoRenewPanel, planKeyboard } from '../subscription/subscription-view';

const DEVICE = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
const NODE = '0b8f6f3e-2f4c-4a77-9b1e-5d6c7a8b9c0d';
const SOURCE = 42;

const dataOf = (keyboard: InlineKeyboard | undefined): string[] =>
  keyboard?.inline_keyboard.flat().flatMap((button) => ('callback_data' in button ? [button.callback_data] : [])) ?? [];

const paid = {
  period: 'paid' as const,
  cancelAtPeriodEnd: false,
  hasPaymentMethod: true,
  isRecurringAvailable: true,
  isTrialAvailable: false,
  currentPeriodEnd: '2026-12-31T00:00:00.000Z'
};

const node = { id: NODE, country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', isDown: false };

const overview: WireguardOverview = {
  nodes: [node],
  configs: [{ deviceId: DEVICE, name: 'Laptop', node, createdAt: '2026-10-01T00:00:00.000Z' }],
  deviceCount: 1,
  deviceLimit: 2
};

describe('callback data already in readers’ chats', () => {
  it('keeps every prefix byte for byte', () => {
    expect(CALLBACK_PREFIX).toEqual({
      menu: 'menu:',
      plan: 'plan:',
      locale: 'locale:',
      client: 'client:',
      unlink: 'unlink:',
      rotate: 'rotate:',
      autoRenew: 'renew:',
      devices: 'devices:',
      forgetDevice: 'forget:',
      removeDevice: 'remove:',
      wireguard: 'wg:',
      wireguardNode: 'wgnode:',
      wireguardCreate: 'wgnew:',
      wireguardFile: 'wgfile:',
      deleteAccount: 'delete:',
      offers: 'offers:',
      broadcastAudience: 'bcast:',
      broadcastSend: 'bsend:'
    });
  });

  it('opens an action as menu:<button key>', () => {
    expect(dataOf(moreKeyboard({ locale: 'ru', state: { isSubscribed: true, isTrialAvailable: false } }))).toEqual([
      'menu:support',
      'menu:help',
      'menu:invite',
      'menu:website',
      'menu:autoRenew',
      'menu:rotate',
      'menu:language',
      'menu:unlink',
      'menu:deleteAccount'
    ]);

    expect(dataOf(menuButtons({ locale: 'en', keys: ['renew', 'devices'] }))).toEqual(['menu:renew', 'menu:devices']);
  });

  it('picks a plan as plan:<plan id> and a language as locale:<locale>', () => {
    expect(dataOf(planKeyboard('ru'))).toEqual(PLANS.map((plan) => `plan:${plan.id}`));
    expect(dataOf(languageKeyboard('ru'))).toEqual(['locale:ru', 'locale:en']);
  });

  it('opens an app as client:<client id>, WireGuard as a bare wg:, and goes back with client:list', () => {
    expect(dataOf(appsKeyboard('en'))).toEqual([...CLIENT_IDS.map((id) => `client:${id}`), 'wg:']);

    const client = { ...CLIENT_REGISTRY.incy, id: 'incy' as const, downloadUrl: 'https://incy.cc', importUrl: null, copyUrl: 'https://x.y/sub' };

    expect(dataOf(clientView({ client, locale: 'en' }).markup)).toEqual(['client:list']);
  });

  it('answers a question as <prefix><yes|no>, with the subject after a colon', () => {
    const copy = BOT_TEXT.en;

    expect(dataOf(confirmKeyboard({ copy: unlinkCopy(copy), prefix: CALLBACK_PREFIX.unlink }))).toEqual(['unlink:yes', 'unlink:no']);
    expect(dataOf(confirmKeyboard({ copy: deleteCopy(copy), prefix: CALLBACK_PREFIX.deleteAccount }))).toEqual(['delete:yes', 'delete:no']);
    expect(dataOf(confirmKeyboard({ copy: rotateCopy(copy), prefix: CALLBACK_PREFIX.rotate }))).toEqual(['rotate:yes', 'rotate:no']);

    expect(
      dataOf(confirmKeyboard({ copy: removeDeviceCopy({ copy, name: 'Pixel' }), prefix: CALLBACK_PREFIX.removeDevice, subject: DEVICE }))
    ).toEqual([`remove:yes:${DEVICE}`, `remove:no:${DEVICE}`]);
  });

  it('switches auto-renewal and offers with on and off', () => {
    expect(dataOf(autoRenewPanel({ status: paid, locale: 'en' }).markup)).toEqual(['renew:off']);
    expect(dataOf(autoRenewPanel({ status: { ...paid, cancelAtPeriodEnd: true }, locale: 'en' }).markup)).toEqual(['renew:on']);
    expect(dataOf(offersPanel({ isOn: true, locale: 'en' }).markup)).toEqual(['offers:off']);
    expect(dataOf(offersPanel({ isOn: false, locale: 'en' }).markup)).toEqual(['offers:on']);
  });

  it('forgets a device as forget:<id> and buys places as devices:<count>', () => {
    const view = devicesView({
      list: {
        deviceLimit: 2,
        devices: [
          {
            id: DEVICE,
            model: 'Pixel',
            platform: null,
            osVersion: null,
            app: null,
            isIdentified: true,
            isOverLimit: false,
            createdAt: '2026-10-01T00:00:00.000Z',
            lastSeenAt: '2026-10-02T00:00:00.000Z'
          }
        ]
      },
      status: { period: 'paid', limits: resolveLimits(0) },
      locale: 'en'
    });

    expect(dataOf(view.markup)).toEqual([`forget:${DEVICE}`, 'devices:1', 'devices:2', 'devices:3']);
  });

  it('walks WireGuard through wgfile:, wgnode:, wgnew:<node>:<kind> and back to wg:', () => {
    expect(dataOf(wireguardView({ overview, locale: 'en' }).markup)).toEqual([`wgfile:${DEVICE}`, `wgnode:${NODE}`]);

    expect(dataOf(wireguardKindView({ node, locale: 'en' }).markup)).toEqual([
      `wgnew:${NODE}:phone`,
      `wgnew:${NODE}:computer`,
      `wgnew:${NODE}:router`,
      'wg:'
    ]);
  });

  it('sends a broadcast through bcast:<audience>:<message> and bsend:<yes|no>:<audience>:<message>', () => {
    expect(dataOf(audienceKeyboard({ locale: 'ru', source: SOURCE }))).toEqual(['bcast:all:42', 'bcast:active:42', 'bcast:inactive:42']);

    expect(dataOf(broadcastConfirm({ choice: { audience: 'active', source: SOURCE }, count: 3, locale: 'ru' }).markup)).toEqual([
      'bsend:yes:active:42',
      'bsend:no:active:42'
    ]);
  });

  it('still reads the labels an older release put on the reply keyboard', () => {
    expect(LEGACY_BUTTONS).toEqual({
      '➕ Устройства': 'devices',
      '➕ Devices': 'devices',
      '🔄 Автосписание': 'autoRenew',
      '🔄 Auto-charge': 'autoRenew',
      '🔁 Обновить ссылку': 'rotate',
      '🗑️ Удалить аккаунт': 'deleteAccount',
      '🗑️ Delete account': 'deleteAccount'
    });
  });
});
